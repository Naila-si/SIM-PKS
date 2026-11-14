<?php

namespace App\Http\Controllers;

use App\Models\PksTemplate;
use Illuminate\Http\Request;

class PksTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = PksTemplate::with(['pengguna', 'pengubah']);

        // Jika ada filter bidang dari request atau user Pengelola
        if ($request->has('bidang') && $request->bidang !== 'Semua') {
            $query->where('bidang', $request->bidang);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_template' => 'required|string|max:255',
            'bidang' => 'required|string|max:255',
            'jenis_pks' => 'required|string|max:255',
            'kategori_template' => 'nullable|string|in:PKS,Adendum',
            'file_template' => 'required|file|mimes:docx,doc|max:10240',
        ]);

        $targetBidang = $request->bidang;
        $currentUser = $request->user();

        // Proteksi jika Pengelola PKS mencoba mengunggah untuk bidang lain
        if ($currentUser && in_array(strtolower($currentUser->role), ['pengelola_pks', 'pengelola']) && !empty($currentUser->bidang)) {
            $targetBidang = $currentUser->bidang;
        }

        $path = $request->file('file_template')->store('templates', 'public');
        
        PksTemplate::where('bidang', $targetBidang)
                    ->where('jenis_pks', $request->jenis_pks)
                    ->where('kategori_template', $request->input('kategori_template', 'PKS'))
                    ->update(['status_template' => 'Tidak Aktif']);

        $template = PksTemplate::create([
            'pengguna_id' => $currentUser ? ($currentUser->pengguna_id ?? $currentUser->id) : $request->input('pengguna_id', $request->input('penggunaId', 1)), 
            'nama_template' => $request->nama_template,
            'kategori_template' => $request->input('kategori_template', 'PKS'),
            'bidang' => $targetBidang,
            'jenis_pks' => $request->jenis_pks,
            'versi_template' => 1,
            'status_template' => 'Aktif',
            'url_berkas' => $path,
        ]);

        return response()->json($template, 201);
    }

    public function update(Request $request, $id)
    {
        $template = PksTemplate::find($id);
        if (!$template) return response()->json(['message' => 'Not found'], 404);

        $dataToUpdate = $request->only(['status_template', 'nama_template']);
        
        // Simpan siapa yang memperbarui
        $updater = $request->input('pengguna_id', $request->input('penggunaId'));
        if ($updater) {
            $dataToUpdate['diperbarui_oleh'] = $updater;
        }

        if ($request->hasFile('file_template')) {
            $path = $request->file('file_template')->store('templates', 'public');
            $dataToUpdate['url_berkas'] = $path;
            $dataToUpdate['versi_template'] = ($template->versi_template ?? 1) + 1;
        }

        $template->update($dataToUpdate);
        return response()->json($template);
    }

    public function destroy($id)
    {
        $template = PksTemplate::find($id);
        if (!$template) return response()->json(['message' => 'Not found'], 404);
        
        $template->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
