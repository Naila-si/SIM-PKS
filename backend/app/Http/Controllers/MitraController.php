<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use Illuminate\Http\Request;

class MitraController extends Controller
{
    public function index()
    {
        return response()->json(Mitra::all());
    }

    public function show($id)
    {
        $mitra = Mitra::find($id);
        if (!$mitra) return response()->json(['message' => 'Mitra tidak ditemukan'], 404);
        return response()->json($mitra);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_mitra' => 'required|string|max:255',
            'nama_pengelola' => 'required|string|max:255',
            'no_hp_pengelola' => 'required|string|max:255',
            'email_pengelola' => 'nullable|email|max:255',
            'alamat_mitra' => 'nullable|string',
            'status_mitra' => 'nullable|string|max:50',
        ]);

        if (!isset($validated['status_mitra'])) {
            $validated['status_mitra'] = 'Aktif';
        }

        $mitra = Mitra::create($validated);
        return response()->json($mitra, 201);
    }

    public function update(Request $request, $id)
    {
        $mitra = Mitra::find($id);
        if (!$mitra) return response()->json(['message' => 'Mitra tidak ditemukan'], 404);

        $validated = $request->validate([
            'nama_mitra' => 'sometimes|string|max:255',
            'nama_pengelola' => 'sometimes|string|max:255',
            'no_hp_pengelola' => 'sometimes|string|max:255',
            'email_pengelola' => 'nullable|email|max:255',
            'alamat_mitra' => 'nullable|string',
            'status_mitra' => 'sometimes|string|max:50',
        ]);

        $mitra->update($validated);
        return response()->json($mitra);
    }

    public function destroy($id)
    {
        $mitra = Mitra::find($id);
        if (!$mitra) return response()->json(['message' => 'Mitra tidak ditemukan'], 404);
        
        $mitra->delete();
        return response()->json(['message' => 'Mitra berhasil dihapus']);
    }
}
