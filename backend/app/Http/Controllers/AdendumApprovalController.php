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
        $adendumId = $request->input('adendum_id', $request->input('adendumId'));
        $penggunaId = $request->input('pengguna_id', $request->input('user_id', $request->input('penggunaId')));
        $request->merge([
            'adendum_id' => $adendumId,
            'pengguna_id' => $penggunaId,
            'user_id' => $penggunaId,
        ]);

        $validated = $request->validate([
            'adendum_id' => 'required|exists:adendum,adendum_id',
            'pengguna_id' => 'nullable|exists:pengguna,pengguna_id',
            'status_aksi' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $userRole = null;
        if (!empty($validated['pengguna_id'])) {
            $pengguna = Pengguna::find($validated['pengguna_id']);
            if ($pengguna) {
                $userRole = $pengguna->role;
            }
        }

        $approval = AdendumApproval::create([
            'adendum_id' => $validated['adendum_id'],
            'pengguna_id' => $validated['pengguna_id'],
            'status_aksi' => $validated['status_aksi'],
            'catatan' => $validated['catatan'] ?? null
        ]);

        $adendum = Adendum::find($validated['adendum_id']);
        if ($adendum) {
            $statusAksi = $validated['status_aksi'];
            
            if ($statusAksi === 'Sudah Diterima') {
                $statusSaatIni = $adendum->status_persetujuan ?? $adendum->statusPersetujuan;
                if ($statusSaatIni === 'Menunggu Penyerahan') {
                    $newStatus = 'Pemeriksaan Pengelola';
                } elseif ($statusSaatIni === 'Disetujui Pengelola') {
                    $newStatus = 'Pemeriksaan Kabag';
                } elseif ($statusSaatIni === 'Disetujui Kabag') {
                    $newStatus = 'Pemeriksaan Pimpinan';
                } else {
                    return response()->json(['success' => false, 'message' => 'Status Adendum saat ini tidak valid untuk aksi ini.'], 400);
                }

                $adendum->update([
                    'status_persetujuan' => $newStatus,
                ]);
                $approval->update(['status_aksi' => $newStatus]); 
            } elseif ($statusAksi === 'Tandai Siap Diserahkan') {
                $adendum->update([
                    'status_persetujuan' => 'Menunggu Penyerahan',
                    'catatan_revisi' => null
                ]);
                $approval->update([
                    'status_aksi' => 'Menunggu Penyerahan',
                    'catatan' => $validated['catatan'] ?? 'Dokumen fisik siap diserahkan oleh Petugas'
                ]);
            } elseif ($statusAksi === 'Draf Adendum Disetujui') {
                $nomorAdendum = ($adendum->nomor_adendum ?? $adendum->nomorAdendum) ?: \App\Services\NomorDokumenService::generateNextNomor();
                $adendum->update([
                    'status_persetujuan' => 'Disetujui',
                    'nomor_adendum' => $nomorAdendum,
                ]);
            } else {
                $adendum->update([
                    'status_persetujuan' => $statusAksi,
                    'catatan_revisi' => str_contains($statusAksi, 'Revisi') ? $validated['catatan'] : ($adendum->catatan_revisi ?? $adendum->catatanRevisi),
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
