<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdendumApproval;
use App\Models\Adendum;
use App\Models\Pengguna;

class AdendumApprovalController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'adendum_id' => 'required|exists:adendums,adendumId',
            'user_id' => 'nullable|exists:pengguna,penggunaId',
            'status_aksi' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $userRole = null;
        $userName = 'Sistem';
        if (!empty($validated['user_id'])) {
            $pengguna = Pengguna::find($validated['user_id']);
            if ($pengguna) {
                $userRole = $pengguna->role;
                $userName = $pengguna->nama;
            }
        }

        $approval = AdendumApproval::create([
            'adendumId' => $validated['adendum_id'],
            'penggunaId' => $validated['user_id'],
            'aktor' => $userName,
            'status_aksi' => $validated['status_aksi'],
            'catatan' => $validated['catatan']
        ]);

        $adendum = Adendum::find($validated['adendum_id']);
        if ($adendum) {
            $statusAksi = $validated['status_aksi'];
            
            if ($statusAksi === 'Sudah Diterima') {
                if ($adendum->statusPersetujuan === 'Menunggu Penyerahan') {
                    $newStatus = 'Pemeriksaan Pengelola';
                } elseif ($adendum->statusPersetujuan === 'Disetujui Pengelola') {
                    $newStatus = 'Pemeriksaan Kabag';
                } elseif ($adendum->statusPersetujuan === 'Disetujui Kabag') {
                    $newStatus = 'Pemeriksaan Pimpinan';
                } else {
                    return response()->json(['success' => false, 'message' => 'Status Adendum saat ini tidak valid untuk aksi ini.'], 400);
                }

                $adendum->update([
                    'statusPersetujuan' => $newStatus,
                ]);
                $approval->update(['status_aksi' => $newStatus]); 
            } elseif ($statusAksi === 'Tandai Siap Diserahkan') {
                $adendum->update([
                    'statusPersetujuan' => 'Menunggu Penyerahan',
                    'catatanRevisi' => null
                ]);
                $approval->update([
                    'status_aksi' => 'Menunggu Penyerahan',
                    'catatan' => $validated['catatan'] ?? 'Dokumen fisik siap diserahkan oleh Petugas'
                ]);
            } elseif ($statusAksi === 'Draf Adendum Disetujui') {
                $nomorAdendum = $adendum->nomorAdendum ?: \App\Services\NomorDokumenService::generateNextNomor();
                $adendum->update([
                    'statusPersetujuan' => 'Disetujui',
                    'nomorAdendum' => $nomorAdendum,
                ]);
            } else {
                $adendum->update([
                    'statusPersetujuan' => $statusAksi,
                    'catatanRevisi' => str_contains($statusAksi, 'Revisi') ? $validated['catatan'] : $adendum->catatanRevisi,
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
