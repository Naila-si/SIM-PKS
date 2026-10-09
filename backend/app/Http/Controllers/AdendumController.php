<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Adendum;
use Illuminate\Support\Facades\Validator;

class AdendumController extends Controller
{
    public function index($pksId)
    {
        $adendums = Adendum::where('pks_document_id', $pksId)
            ->with('pembuat')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $adendums
        ]);
    }

    public function show($id)
    {
        $adendum = Adendum::with(['pembuat', 'pksDocument'])->find($id);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Adendum tidak ditemukan'], 404);
        }
        return response()->json(['success' => true, 'data' => $adendum]);
    }

    public function store(Request $request, $pksId)
    {
        $validator = Validator::make($request->all(), [
            'ruangLingkupPerubahan' => 'required',
            'tanggalMulai' => 'required|date',
            'tanggalBerakhir' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 400);
        }

        $adendum = Adendum::create([
            'pks_document_id' => $pksId,
            'nomorAdendum' => 'ADD/' . date('Y') . '/' . rand(100, 999),
            'ruangLingkupPerubahan' => $request->ruangLingkupPerubahan,
            'tanggalMulai' => $request->tanggalMulai,
            'tanggalBerakhir' => $request->tanggalBerakhir,
            'statusPersetujuan' => 'Draft',
            'pembuat_id' => $request->attributes->get('user_id'),
        ]);

        return response()->json(['success' => true, 'data' => $adendum]);
    }

    public function update(Request $request, $id)
    {
        $adendum = Adendum::find($id);
        if (!$adendum) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $adendum->update($request->only([
            'ruangLingkupPerubahan', 'tanggalMulai', 'tanggalBerakhir', 'statusPersetujuan', 'catatanRevisi'
        ]));

        return response()->json(['success' => true, 'data' => $adendum]);
    }

    public function destroy($id)
    {
        $adendum = Adendum::find($id);
        if ($adendum) $adendum->delete();
        return response()->json(['success' => true]);
    }
}
