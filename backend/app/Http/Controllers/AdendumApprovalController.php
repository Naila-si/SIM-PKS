<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdendumApproval;
use App\Models\Adendum;
use App\Models\TokenAksesPengguna;
use App\Traits\HandlesBidangAuthorization;

class AdendumApprovalController extends Controller
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

        $adendumId = $request->input('adendum_id', $request->input('adendumId'));
        $request->merge([
            'adendum_id' => $adendumId,
        ]);

        $validated = $request->validate([
            'adendum_id' => 'required|exists:adendum,adendum_id',
            'status_aksi' => 'required|string|max:100',
            'catatan' => 'nullable|string|max:2000',
        ]);

        $adendum = Adendum::with('pksDocument')->find($validated['adendum_id']);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Adendum tidak ditemukan.'], 404);
        }

        $parentBidang = $adendum->pksDocument?->bidang;
        $statusAksi = $validated['status_aksi'];
        $statusSaatIni = $adendum->status_persetujuan ?? 'Draft';
        $isAdmin = in_array($userRole, ['admin_utama', 'admin']);

        // Strict Whitelist Aksi Persetujuan (Mencegah State Tampering SEC-TAMPER-01)
        $allowedActions = [
            'Tandai Siap Diserahkan',
            'Sudah Diterima',
            'Disetujui Pengelola',
            'Revisi Pengelola',
            'Disetujui Kabag',
            'Revisi Kabag',
            'Draf Adendum Disetujui',
            'Disetujui',
            'Revisi Pimpinan',
        ];

        if (!in_array($statusAksi, $allowedActions)) {
            return response()->json([
                'success' => false,
                'message' => 'Aksi persetujuan adendum tidak valid atau berada di luar alur kerja sistem.'
            ], 422);
        }

        // Otorisasi dan Validasi Alur Persetujuan Adendum
        if ($statusAksi === 'Tandai Siap Diserahkan') {
            $isCreator = ($adendum->pembuat_id == $penggunaId || $adendum->pengguna_id == $penggunaId);
            if (!$isCreator && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Petugas pembuat Adendum yang berhak menandai dokumen siap diserahkan.'
                ], 403);
            }
            $newStatus = 'Menunggu Penyerahan';
            $adendum->update([
                'status_persetujuan' => 'Menunggu Penyerahan',
                'catatan_revisi' => null
            ]);
        } elseif ($statusAksi === 'Sudah Diterima') {
            if ($statusSaatIni === 'Menunggu Penyerahan') {
                if (!in_array($userRole, ['pengelola_pks', 'pengelola']) && !$isAdmin) {
                    return response()->json(['success' => false, 'message' => 'Hanya Pengelola PKS / Admin yang berwenang menerima dokumen pada tahap ini.'], 403);
                }
                // Verifikasi Bidang Pengelola PKS (SEC-RBAC-01)
                if (!$isAdmin && in_array($userRole, ['pengelola_pks', 'pengelola']) && !self::isUserAuthorizedForBidang($authUser, $parentBidang)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Pengelola PKS hanya berwenang menerima dokumen Adendum pada bidang ' . $authUser->bidang . '.'
                    ], 403);
                }
                $newStatus = 'Pemeriksaan Pengelola';
            } elseif ($statusSaatIni === 'Disetujui Pengelola') {
                if ($userRole !== 'kabag' && !$isAdmin) {
                    return response()->json(['success' => false, 'message' => 'Hanya Kepala Bagian (Kabag) yang berwenang menerima dokumen pada tahap ini.'], 403);
                }
                $newStatus = 'Pemeriksaan Kabag';
            } elseif ($statusSaatIni === 'Disetujui Kabag') {
                if ($userRole !== 'pimpinan' && !$isAdmin) {
                    return response()->json(['success' => false, 'message' => 'Hanya Pimpinan yang berwenang menerima dokumen pada tahap ini.'], 403);
                }
                $newStatus = 'Pemeriksaan Pimpinan';
            } else {
                return response()->json(['success' => false, 'message' => 'Status Adendum saat ini tidak valid untuk aksi penerimaan fisik.'], 400);
            }

            $adendum->update(['status_persetujuan' => $newStatus]);
        } elseif (in_array($statusAksi, ['Disetujui Pengelola', 'Revisi Pengelola'])) {
            if (!in_array($userRole, ['pengelola_pks', 'pengelola']) && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Pengelola PKS yang berhak memberikan persetujuan/revisi pada tahap ini.'], 403);
            }
            // Verifikasi Bidang Pengelola PKS (SEC-RBAC-01)
            if (!$isAdmin && in_array($userRole, ['pengelola_pks', 'pengelola']) && !self::isUserAuthorizedForBidang($authUser, $parentBidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengelola PKS hanya berwenang memeriksa dan menyetujui Adendum pada bidang ' . $authUser->bidang . '.'
                ], 403);
            }
            if ($statusSaatIni !== 'Pemeriksaan Pengelola') {
                return response()->json(['success' => false, 'message' => 'Status Adendum saat ini tidak valid untuk aksi persetujuan Pengelola.'], 400);
            }
            $newStatus = $statusAksi;
            $adendum->update([
                'status_persetujuan' => $newStatus,
                'catatan_revisi' => str_contains($statusAksi, 'Revisi') ? ($validated['catatan'] ?? null) : $adendum->catatan_revisi,
            ]);
        } elseif (in_array($statusAksi, ['Disetujui Kabag', 'Revisi Kabag'])) {
            if ($userRole !== 'kabag' && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Kepala Bagian yang berhak memberikan persetujuan/revisi pada tahap ini.'], 403);
            }
            if ($statusSaatIni !== 'Pemeriksaan Kabag') {
                return response()->json(['success' => false, 'message' => 'Status Adendum saat ini tidak valid untuk aksi persetujuan Kabag.'], 400);
            }
            $newStatus = $statusAksi;
            $adendum->update([
                'status_persetujuan' => $newStatus,
                'catatan_revisi' => str_contains($statusAksi, 'Revisi') ? ($validated['catatan'] ?? null) : $adendum->catatan_revisi,
            ]);
        } elseif ($statusAksi === 'Draf Adendum Disetujui' || $statusAksi === 'Disetujui') {
            if ($userRole !== 'pimpinan' && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Pimpinan yang berhak menyetujui draf final Adendum.'], 403);
            }
            if ($statusSaatIni !== 'Pemeriksaan Pimpinan') {
                return response()->json(['success' => false, 'message' => 'Status Adendum saat ini tidak valid untuk persetujuan akhir Pimpinan.'], 400);
            }
            $nomorAdendum = ($adendum->nomor_adendum ?? $adendum->nomorAdendum) ?: \App\Services\NomorDokumenService::generateNextNomor();
            $newStatus = 'Disetujui';
            $adendum->update([
                'status_persetujuan' => 'Disetujui',
                'status_adendum' => 'Aktif',
                'nomor_adendum' => $nomorAdendum,
                'catatan_revisi' => null,
            ]);
        } elseif ($statusAksi === 'Revisi Pimpinan') {
            if ($userRole !== 'pimpinan' && !$isAdmin) {
                return response()->json(['success' => false, 'message' => 'Hanya Pimpinan yang berhak meminta revisi pada tahap ini.'], 403);
            }
            if ($statusSaatIni !== 'Pemeriksaan Pimpinan') {
                return response()->json(['success' => false, 'message' => 'Status Adendum saat ini tidak valid untuk revisi Pimpinan.'], 400);
            }
            $newStatus = $statusAksi;
            $adendum->update([
                'status_persetujuan' => $newStatus,
                'catatan_revisi' => $validated['catatan'] ?? null,
            ]);
        } else {
            return response()->json(['success' => false, 'message' => 'Aksi persetujuan tidak valid.'], 400);
        }

        $approval = AdendumApproval::create([
            'adendum_id' => $validated['adendum_id'],
            'pengguna_id' => $penggunaId,
            'status_aksi' => $newStatus,
            'catatan' => $validated['catatan'] ?? null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat persetujuan berhasil dicatat.',
            'data' => $approval
        ], 201);
    }
}
