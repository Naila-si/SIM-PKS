<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PksApproval;
use App\Models\PksDocument;

class PksApprovalController extends Controller
{
    public function store(Request $request)
    {
        $pksId = $request->input('pks_id', $request->input('pksId'));
        $penggunaId = $request->input('pengguna_id', $request->input('user_id', $request->input('penggunaId')));
        $request->merge([
            'pks_id' => $pksId,
            'pengguna_id' => $penggunaId,
            'user_id' => $penggunaId,
        ]);

        $validated = $request->validate([
            'pks_id' => 'required|exists:pks,pks_id',
            'pengguna_id' => 'nullable|exists:pengguna,pengguna_id',
            'status_aksi' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $approval = PksApproval::create([
            'pks_id' => $validated['pks_id'],
            'pengguna_id' => $validated['pengguna_id'],
            'status_aksi' => $validated['status_aksi'],
            'catatan' => $validated['catatan'] ?? null,
        ]);

        // Get user role
        $userRole = null;
        if (!empty($validated['pengguna_id'])) {
            $pengguna = \App\Models\Pengguna::find($validated['pengguna_id']);
            if ($pengguna) {
                $userRole = $pengguna->role;
            }
        }

        // Optionally, update the main document's status based on this action
        $pks = PksDocument::find($validated['pks_id']);
        if ($pks) {
            $statusAksi = $validated['status_aksi'];
            
            if ($statusAksi === 'Sudah Diterima') {
                if ($pks->status_persetujuan === 'Menunggu Penyerahan') {
                    if (!in_array($userRole, ['pengelola_pks', 'admin_utama', 'admin', 'pengelola'])) {
                        return response()->json(['success' => false, 'message' => 'Hanya Pengelola/Admin yang bisa menerima dokumen pada tahap ini.'], 403);
                    }
                    $newStatus = 'Pemeriksaan Pengelola';
                } elseif ($pks->status_persetujuan === 'Disetujui Pengelola') {
                    if ($userRole !== 'kabag') {
                        return response()->json(['success' => false, 'message' => 'Hanya Kabag yang bisa menerima dokumen pada tahap ini.'], 403);
                    }
                    $newStatus = 'Pemeriksaan Kabag';
                } elseif ($pks->status_persetujuan === 'Disetujui Kabag') {
                    if ($userRole !== 'pimpinan') {
                        return response()->json(['success' => false, 'message' => 'Hanya Pimpinan yang bisa menerima dokumen pada tahap ini.'], 403);
                    }
                    $newStatus = 'Pemeriksaan Pimpinan';
                } else {
                    return response()->json(['success' => false, 'message' => 'Status PKS saat ini tidak valid untuk aksi ini.'], 400);
                }

                $pks->update([
                    'status_persetujuan' => $newStatus,
                ]);
                $approval->update(['status_aksi' => $newStatus]); // Update approval log as well
            } elseif ($statusAksi === 'Tandai Siap Diserahkan') {
                $pks->update([
                    'status_persetujuan' => 'Menunggu Penyerahan',
                    'catatan_revisi' => null
                ]);
                $approval->update(['status_aksi' => 'Menunggu Penyerahan']);
            } elseif ($statusAksi === 'Draf PKS Disetujui') {
                // Generate Nomor PKS P/{nomor urut}/SP/{tahun} if it doesn't have one yet
                $nomorPks = $pks->nomor_pks ?: \App\Services\NomorDokumenService::generateNextNomor();
                
                $pks->update([
                    'status_persetujuan' => 'Disetujui',
                    'status_pks' => 'Aktif',
                    'nomor_pks' => $nomorPks,
                ]);
            } else {
                // Setuju or Revisi ... (e.g. Disetujui Pengelola, Revisi Kabag)
                $pks->update([
                    'status_persetujuan' => $statusAksi,
                    'catatan_revisi' => str_contains($statusAksi, 'Revisi') ? $validated['catatan'] : $pks->catatan_revisi,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Riwayat persetujuan berhasil dicatat.',
            'data' => $approval
        ], 201);
    }

    public function getPendingCount(Request $request)
    {
        $userId = $request->query('user_id') ?? $request->query('pengguna_id') ?? $request->attributes->get('user_id');
        $userRole = null;

        if ($userId) {
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
        } elseif (in_array($userRole, ['pengelola_pks', 'admin_utama', 'admin', 'pengelola'])) {
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
