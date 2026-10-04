<?php

namespace App\Http\Controllers;

use App\Models\PksTemplate;
use Illuminate\Http\Request;

class PksTemplateController extends Controller
{
    public function index()
    {
        return response()->json(PksTemplate::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_template' => 'required|string|max:255',
            'bidang' => 'required|string|max:255',
            'jenis_pks' => 'required|string|max:255',
            'file_template' => 'required|file|mimes:docx,doc|max:10240',
        ]);

        $path = $request->file('file_template')->store('templates', 'public');
        
        PksTemplate::where('bidang', $request->bidang)
                    ->where('jenis_pks', $request->jenis_pks)
                    ->update(['status_template' => 'Tidak Aktif']);

        $template = PksTemplate::create([
            'penggunaId' => $request->input('penggunaId', 1), 
            'nama_template' => $request->nama_template,
            'bidang' => $request->bidang,
            'jenis_pks' => $request->jenis_pks,
            'versi_template' => PksTemplate::where('bidang', $request->bidang)->where('jenis_pks', $request->jenis_pks)->count() + 1,
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
