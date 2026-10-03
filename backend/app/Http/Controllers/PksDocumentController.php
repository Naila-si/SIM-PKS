<?php

namespace App\Http\Controllers;

use App\Models\PksDocument;
use App\Models\PksTemplate;
use Illuminate\Http\Request;
use PhpOffice\PhpWord\TemplateProcessor;

class PksDocumentController extends Controller
{
    public function index()
    {
        return response()->json(PksDocument::with('mitra', 'pengguna', 'riwayat_persetujuan.user')->get());
    }

    public function show($id)
    {
        $doc = PksDocument::with('mitra', 'pengguna', 'riwayat_persetujuan.user')->find($id);
        if (!$doc) return response()->json(['message' => 'Not found'], 404);
        return response()->json($doc);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mitraId' => 'required|exists:mitra,mitraId',
            'penggunaId' => 'required|exists:pengguna,penggunaId',
            'bidang' => 'required|string',
            'jenis_pks' => 'required|string',
            'ringkasan_pks' => 'required|string',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => 'required|date',
        ]);

        $validated['status_persetujuan'] = 'Draf';
        $doc = PksDocument::create($validated);
        
        return response()->json($doc, 201);
    }

    public function generateDocx($id)
    {
        $doc = PksDocument::with('mitra')->findOrFail($id);
        
        $template = PksTemplate::where('bidang', $doc->bidang)
                               ->where('jenis_pks', $doc->jenis_pks)
                               ->where('status_template', 'Aktif')
                               ->first();
        if (!$template) {
            return response()->json(['message' => 'Template tidak ditemukan untuk bidang dan jenis PKS ini'], 404);
        }

        $templatePath = storage_path('app/public/' . $template->url_berkas);
        if (!file_exists($templatePath)) {
            return response()->json(['message' => 'File template tidak ditemukan di server'], 404);
        }
        
        try {
            $templateProcessor = new TemplateProcessor($templatePath);
            $templateProcessor->setValue('nama_mitra', $doc->mitra->nama_mitra ?? '');
            $templateProcessor->setValue('alamat_mitra', $doc->mitra->alamat_mitra ?? '');
            $templateProcessor->setValue('nama_pengelola', $doc->mitra->nama_pengelola ?? '');
            $templateProcessor->setValue('nomor_pks', $doc->nomor_pks ?? '-');
            $templateProcessor->setValue('tanggal_mulai', $doc->tanggal_mulai);
            $templateProcessor->setValue('tanggal_berakhir', $doc->tanggal_berakhir);
            
            $fileName = 'Draft_PKS_' . str_replace(' ', '_', $doc->mitra->nama_mitra) . '_' . time() . '.docx';
            $outputPath = storage_path('app/public/pks_drafts/' . $fileName);
            
            if (!file_exists(storage_path('app/public/pks_drafts'))) {
                mkdir(storage_path('app/public/pks_drafts'), 0755, true);
            }
            
            $templateProcessor->saveAs($outputPath);
            
            $doc->update(['url_berkas' => 'pks_drafts/' . $fileName]);
            
            return response()->download($outputPath);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal generate document: ' . $e->getMessage()], 500);
        }
    }
}
