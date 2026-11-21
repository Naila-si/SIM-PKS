<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PksApproval;
use App\Models\PksDocument;
use App\Models\TokenAksesPengguna;
use App\Traits\HandlesBidangAuthorization;

class PksApprovalController extends Controller
{
    use HandlesBidangAuthorization;

    public function store(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser) {
            $token = $request->bearerToken() ?: $request->query('token');
            $authUser = TokenAksesPengguna::verifikasiToken($token);
        }

        if (!$authUser) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $penggunaId = $authUser->pengguna_id;
        $userRole = strtolower((string)$authUser->role);

        $pksId = $request->input('pks_id', $request->input('pksId'));
        $request->merge([
            'pks_id' => $pksId,
        ]);

        $validated = $request->validate([
            'pks_id' => 'required|exists:pks,pks_id',
            'status_aksi' => 'required|string|max:100',
            'catatan' => 'nullable|string|max:2000',
        ]);

        $pks = PksDocument::find($validated['pks_id']);
        if (!$pks) {
            return response()->json(['success' => false, 'message' => 'Dokumen PKS tidak ditemukan.'], 404);
        }

        $statusAksi = $validated['status_aksi'];
        $currentStatus = $pks->status_persetujuan ?? 'Draf';
        $isAdmin = in_array($userRole, ['admin_utama', 'admin']);

        // Strict Whitelist Aksi Persetujuan (Mencegah State Tampering SEC-TAMPER-01)
        $allowedActions = [
            'Tandai Siap Diserahkan',
            'Sudah Diterima',
            'Disetujui Pengelola',
            'Revisi Pengelola',
            'Disetujui Kabag',
            'Revisi Kabag',
            'Draf PKS Disetujui',
            'Disetujui',
            'Revisi Pimpinan',
        ];

        if (!in_array($statusAksi, $allowedActions)) {
            return response()->json([
                'success' => false,
                'message' => 'Aksi persetujuan tidak valid atau berada di luar alur kerja sistem.'
            ], 422);
        }

        // Otorisasi dan Validasi Alur Persetujuan Berdasarkan Role Asli Pengguna
        if ($statusAksi === 'Tandai Siap Diserahkan') {
            $isCreator = ($pks->pengguna_id == $penggunaId);
            if (!$isCreator && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Petugas pembuat PKS yang berhak menandai dokumen siap diserahkan.'
                ], 403);
            }
            $pks->update([
                'status_persetujuan' => 'Menunggu Penyerahan',
                'catatan_revisi' => null
            ]);
            $newStatus = 'Menunggu Penyerahan';
        } elseif ($statusAksi === 'Sudah Diterima') {
            if ($currentStatus === 'Menunggu Penyerahan') {
                if (!in_array($userRole, ['pengelola_pks', 'pengelola']) && !$isAdmin) {
                    return response()->json(['success' => false, 'message' => 'Hanya Pengelola PKS / Admin yang berwenang menerima dokumen pada tahap ini.'], 403);
                }
                // Verifikasi Bidang Pengelola PKS (SEC-RBAC-01)
                if (!$isAdmin && in_array($userRole, ['pengelola_pks', 'pengelola']) && !self::isUserAuthorizedForBidang($authUser, $pks->bidang)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Pengelola PKS hanya berwenang menerima dokumen PKS pada bidang ' . $authUser->bidang . '.'
                    ], 403);
                }
                $newStatus = 'Pemeriksaan Pengelola';
            } elseif ($currentStatus === 'Disetujui Pengelola') {
                if ($userRole !== 'kabag' && !$isAdmin) {
                    return response()->json(['success' => false, 'message' => 'Hanya Kepala Bagian (Kabag) yang berwenang menerima dokumen pada tahap ini.'], 403);
                }
                $newStatus = 'Pemeriksaan Kabag';
            } elseif ($currentStatus === 'Disetujui Kabag') {
                if ($userRole !== 'pimpinan' && !$isAdmin) {
                    return response()->json(['success' => false, 'message' => 'Hanya Pimpinan yang berwenang menerima dokumen pada tahap ini.'], 403);
                }
                $newStatus = 'Pemeriksaan Pimpinan';
            } else {
                return response()->json(['success' => false, 'message' => 'Status PKS saat ini tidak valid untuk aksi penerimaan fisik.'], 400);
            }

            $pks->update(['status_persetujuan' => $newStatus]);
        } elseif (in_array($statusAksi, ['Disetujui Pengelola', 'Revisi Pengelola'])) {
            if (!in_array($userRole, ['pengelola_pks', 'pengelola']) && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Pengelola PKS yang berhak memberikan persetujuan/revisi pada tahap ini.'], 403);
            }
            // Verifikasi Bidang Pengelola PKS (SEC-RBAC-01)
            if (!$isAdmin && in_array($userRole, ['pengelola_pks', 'pengelola']) && !self::isUserAuthorizedForBidang($authUser, $pks->bidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengelola PKS hanya berwenang memeriksa dan menyetujui PKS pada bidang ' . $authUser->bidang . '.'
                ], 403);
            }
            if ($currentStatus !== 'Pemeriksaan Pengelola') {
                return response()->json(['success' => false, 'message' => 'Status PKS saat ini tidak valid untuk aksi persetujuan Pengelola.'], 400);
            }
            $newStatus = $statusAksi;
            $pks->update([
                'status_persetujuan' => $newStatus,
                'catatan_revisi' => str_contains($statusAksi, 'Revisi') ? ($validated['catatan'] ?? null) : $pks->catatan_revisi,
            ]);
        } elseif (in_array($statusAksi, ['Disetujui Kabag', 'Revisi Kabag'])) {
            if ($userRole !== 'kabag' && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Kepala Bagian yang berhak memberikan persetujuan/revisi pada tahap ini.'], 403);
            }
            if ($currentStatus !== 'Pemeriksaan Kabag') {
                return response()->json(['success' => false, 'message' => 'Status PKS saat ini tidak valid untuk aksi persetujuan Kabag.'], 400);
            }
            $newStatus = $statusAksi;
            $pks->update([
                'status_persetujuan' => $newStatus,
                'catatan_revisi' => str_contains($statusAksi, 'Revisi') ? ($validated['catatan'] ?? null) : $pks->catatan_revisi,
            ]);
        } elseif ($statusAksi === 'Draf PKS Disetujui' || $statusAksi === 'Disetujui') {
            if ($userRole !== 'pimpinan' && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Pimpinan yang berhak menyetujui draf final PKS.'], 403);
            }
            if ($currentStatus !== 'Pemeriksaan Pimpinan') {
                return response()->json(['success' => false, 'message' => 'Status PKS saat ini tidak valid untuk persetujuan akhir Pimpinan.'], 400);
            }
            $nomorPks = $pks->nomor_pks ?: \App\Services\NomorDokumenService::generateNextNomor();
            $newStatus = 'Disetujui';
            $pks->update([
                'status_persetujuan' => 'Disetujui',
                'status_pks' => 'Aktif',
                'nomor_pks' => $nomorPks,
                'catatan_revisi' => null,
            ]);
        } elseif ($statusAksi === 'Revisi Pimpinan') {
            if ($userRole !== 'pimpinan' && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Pimpinan yang berhak meminta revisi pada tahap ini.'], 403);
            }
            if ($currentStatus !== 'Pemeriksaan Pimpinan') {
                return response()->json(['success' => false, 'message' => 'Status PKS saat ini tidak valid untuk revisi Pimpinan.'], 400);
            }
            $newStatus = $statusAksi;
            $pks->update([
                'status_persetujuan' => $newStatus,
                'catatan_revisi' => $validated['catatan'] ?? null,
            ]);
        } else {
            return response()->json(['success' => false, 'message' => 'Aksi persetujuan tidak valid.'], 400);
        }

        $approval = PksApproval::create([
            'pks_id' => $validated['pks_id'],
            'pengguna_id' => $penggunaId,
            'status_aksi' => $newStatus,
            'catatan' => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat persetujuan berhasil dicatat.',
            'data' => $approval
        ], 201);
    }

    public function getPendingCount(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser) {
            $token = $request->bearerToken() ?: $request->query('token');
            $authUser = TokenAksesPengguna::verifikasiToken($token);
        }

        $userId = $authUser ? $authUser->pengguna_id : ($request->query('user_id') ?? $request->query('pengguna_id'));
        $userRole = null;

        if ($authUser) {
            $userRole = strtolower($authUser->role);
        } elseif ($userId) {
            $user = \App\Models\Pengguna::find($userId);
            if ($user) {
                $userRole = strtolower($user->role);
            }
        }

        $pksCount = 0;
        $adendumCount = 0;
        $revisiCount = 0;

        if ($userRole === 'petugas_jr') {
            $pksCount = \App\Models\PksDocument::where('pengguna_id', $userId)
                ->where('status_persetujuan', 'like', '%Revisi%')
                ->count();

            $adendumCount = \App\Models\Adendum::where('pengguna_id', $userId)
                ->where('status_persetujuan', 'like', '%Revisi%')
                ->count();

            $revisiCount = $pksCount + $adendumCount;
            $totalCount = $revisiCount;
        } elseif (in_array($userRole, ['pengelola_pks', 'pengelola'])) {
            // Isolasi Bidang untuk Pengelola PKS (SEC-RBAC-01)
            $pksQuery = \App\Models\PksDocument::whereIn('status_persetujuan', ['Menunggu Penyerahan', 'Pemeriksaan Pengelola']);
            $adendumQuery = \App\Models\Adendum::whereIn('status_persetujuan', ['Menunggu Penyerahan', 'Pemeriksaan Pengelola']);

            if ($authUser && !empty($authUser->bidang)) {
                $variants = self::getBidangVariants($authUser->bidang);
                if (!empty($variants)) {
                    $pksQuery->whereIn('bidang', $variants);
                    $adendumQuery->whereHas('pksDocument', fn($q) => $q->whereIn('bidang', $variants));
                }
            }

            $pksCount = $pksQuery->count();
            $adendumCount = $adendumQuery->count();
            $totalCount = $pksCount + $adendumCount;
        } elseif (in_array($userRole, ['admin_utama', 'admin'])) {
            $pksCount = \App\Models\PksDocument::whereIn('status_persetujuan', ['Menunggu Penyerahan', 'Pemeriksaan Pengelola'])->count();
            $adendumCount = \App\Models\Adendum::whereIn('status_persetujuan', ['Menunggu Penyerahan', 'Pemeriksaan Pengelola'])->count();
            $totalCount = $pksCount + $adendumCount;
        } elseif ($userRole === 'kabag') {
            $pksCount = \App\Models\PksDocument::whereIn('status_persetujuan', ['Disetujui Pengelola', 'Pemeriksaan Kabag'])->count();
            $adendumCount = \App\Models\Adendum::whereIn('status_persetujuan', ['Disetujui Pengelola', 'Pemeriksaan Kabag'])->count();
            $totalCount = $pksCount + $adendumCount;
        } elseif ($userRole === 'pimpinan') {
            $pksCount = \App\Models\PksDocument::whereIn('status_persetujuan', ['Disetujui Kabag', 'Pemeriksaan Pimpinan'])->count();
            $adendumCount = \App\Models\Adendum::whereIn('status_persetujuan', ['Disetujui Kabag', 'Pemeriksaan Pimpinan'])->count();
            $totalCount = $pksCount + $adendumCount;
        } else {
            $totalCount = 0;
        }

        return response()->json([
            'success' => true,
            'role' => $userRole,
            'pksCount' => $pksCount,
            'adendumCount' => $adendumCount,
            'revisiCount' => $revisiCount,
            'totalCount' => $totalCount,
        ]);
    }
}
