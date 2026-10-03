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

        // Optionally, update the main document's status based on this action
        $pks = PksDocument::find($validated['pks_id']);
        if ($pks) {
            $pks->update([
                'status_persetujuan' => $validated['status_aksi']
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Riwayat persetujuan berhasil dicatat.',
            'data' => $approval
        ], 201);
    }
}
