<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PksApproval;
use App\Models\PksDocument;

class PksApprovalController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pks_id' => 'required|exists:pks_documents,pksId',
            'user_id' => 'nullable|exists:pengguna,penggunaId',
            'status_aksi' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $approval = PksApproval::create($validated);

        // Get user role
        $userRole = null;
        if (!empty($validated['user_id'])) {
            $pengguna = \App\Models\Pengguna::find($validated['user_id']);
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

                // Lock check
                if ($pks->locked_by && $pks->locked_by != $validated['user_id']) {
                    return response()->json(['success' => false, 'message' => 'Dokumen ini sudah diambil/di-lock oleh pihak lain.'], 403);
                }

                $pks->update([
                    'status_persetujuan' => $newStatus,
                    'locked_by' => $validated['user_id']
                ]);
                $approval->update(['status_aksi' => $newStatus]); // Update approval log as well
            } elseif ($statusAksi === 'Tandai Siap Diserahkan') {
                $pks->update([
                    'status_persetujuan' => 'Menunggu Penyerahan',
                    'locked_by' => null,
                    'catatan_revisi' => null
                ]);
                $approval->update(['status_aksi' => 'Menunggu Penyerahan']);
            } elseif ($statusAksi === 'Draf PKS Disetujui') {
                $pks->update([
                    'status_persetujuan' => 'Disetujui',
                    'status_pks' => 'Aktif',
                    'locked_by' => null
                ]);
            } else {
                // Setuju or Revisi ... (e.g. Disetujui Pengelola, Revisi Kabag)
                $pks->update([
                    'status_persetujuan' => $statusAksi,
                    'catatan_revisi' => str_contains($statusAksi, 'Revisi') ? $validated['catatan'] : $pks->catatan_revisi,
                    'locked_by' => null // Unlock it for the next role or for the Petugas to fix
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Riwayat persetujuan berhasil dicatat.',
            'data' => $approval
        ], 201);
    }
}
