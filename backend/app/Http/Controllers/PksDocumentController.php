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
        return response()->json(PksDocument::with('mitra', 'pengguna', 'riwayat_persetujuan.user', 'adendums')->get());
    }

    public function show($id)
    {
        $doc = PksDocument::with('mitra', 'pengguna', 'riwayat_persetujuan.user', 'adendums')->find($id);
        if (!$doc) return response()->json(['message' => 'Not found'], 404);
        return response()->json($doc);
    }

    public function store(Request $request)
    {
        $mitraId = $request->input('mitra_id', $request->input('mitraId'));
        $penggunaId = $request->input('pengguna_id', $request->input('penggunaId'));
        $request->merge([
            'mitra_id' => $mitraId,
            'pengguna_id' => $penggunaId,
        ]);

        $validated = $request->validate([
            'mitra_id' => 'required|exists:mitra,mitra_id',
            'pengguna_id' => 'required|exists:pengguna,pengguna_id',
            'bidang' => 'required|string',
            'jenis_pks' => 'required|string',
            'ringkasan_pks' => 'required|string',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => [
                'required',
                'date',
                'after:tanggal_mulai',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->filled('tanggal_mulai') && $value) {
                        $mulai = \Carbon\Carbon::parse($request->tanggal_mulai);
                        $berakhir = \Carbon\Carbon::parse($value);
                        if ($mulai->diffInDays($berakhir, false) < 30) {
                            $fail('Masa berlaku PKS minimal adalah 30 hari (1 bulan) terhitung dari tanggal mulai berlaku.');
                        }
                    }
                }
            ],
        ], [
            'tanggal_berakhir.after' => 'Tanggal Berakhir harus lebih besar dari Tanggal Mulai.',
        ]);

        $validated['status_persetujuan'] = 'Draf';
        $doc = PksDocument::create($validated);
        
        return response()->json($doc, 201);
    }

    public function update(Request $request, $id)
    {
        $doc = PksDocument::with('mitra')->find($id);
        if (!$doc) return response()->json(['message' => 'PKS not found'], 404);

        // Cek apakah PKS memiliki adendum yang masih dalam proses persetujuan
        $hasPendingAdendum = $doc->adendums()
            ->whereNotIn('status_persetujuan', ['Disetujui', 'Selesai', 'Draf Adendum Disetujui'])
            ->exists();

        if ($hasPendingAdendum) {
            return response()->json([
                'success' => false,
                'message' => 'PKS tidak dapat diedit karena masih memiliki Adendum yang dalam proses persetujuan.'
            ], 422);
        }

        $authUser = $request->user();
        if ($authUser && in_array($authUser->role, ['petugas_jr', 'petugas'])) {
            if ($doc->pengguna_id && $doc->pengguna_id != $authUser->pengguna_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Petugas pembuat PKS yang berhak mengubah data dokumen ini.'
                ], 403);
            }
        }

        $validated = $request->validate([
            'bidang' => 'sometimes|string',
            'jenis_pks' => 'sometimes|string',
            'ringkasan_pks' => 'sometimes|string',
            'tanggal_mulai' => 'sometimes|date',
            'tanggal_berakhir' => 'sometimes|date',
            'mitra' => 'sometimes|array',
            'mitra.nama_perusahaan' => 'sometimes|string|nullable',
            'mitra.alamat' => 'sometimes|string|nullable',
            'mitra.penanggung_jawab' => 'sometimes|string|nullable',
            'mitra.jabatan' => 'sometimes|string|nullable',
            'mitra.telepon' => 'sometimes|string|nullable',
            'mitra.email' => 'sometimes|string|nullable',
        ]);

        // Update PKS fields
        $pksData = collect($validated)->except('mitra')->toArray();
        if (!empty($pksData)) {
            $doc->update($pksData);
        }

        // Update Mitra fields if provided
        if (isset($validated['mitra']) && $doc->mitra) {
            $doc->mitra->update([
                'nama_mitra' => $validated['mitra']['nama_perusahaan'] ?? $doc->mitra->nama_mitra,
                'alamat_mitra' => $validated['mitra']['alamat'] ?? $doc->mitra->alamat_mitra,
                'nama_pengelola' => $validated['mitra']['penanggung_jawab'] ?? $doc->mitra->nama_pengelola,
                'jabatan_pengelola' => $validated['mitra']['jabatan'] ?? $doc->mitra->jabatan_pengelola,
                'kontak_pengelola' => $validated['mitra']['telepon'] ?? $doc->mitra->kontak_pengelola,
                'email_pengelola' => $validated['mitra']['email'] ?? $doc->mitra->email_pengelola,
            ]);
        }

        return response()->json($doc, 200);
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

    public function hentikanPks(Request $request, $id)
    {
        $doc = PksDocument::find($id);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Dokumen PKS tidak ditemukan'], 404);
        }

        $request->validate([
            'alasan_penghentian' => 'required|string|max:1000',
            'surat_penghentian' => 'required|file|mimes:pdf|max:10240',
        ], [
            'alasan_penghentian.required' => 'Alasan penghentian/tidak melanjutkan PKS wajib diisi.',
            'surat_penghentian.required' => 'Surat pernyataan tidak melanjutkan PKS wajib diunggah.',
            'surat_penghentian.mimes' => 'Format surat pernyataan harus berupa file PDF.',
            'surat_penghentian.max' => 'Ukuran berkas surat pernyataan maksimal 10MB.',
        ]);

        $filePath = null;
        if ($request->hasFile('surat_penghentian')) {
            $file = $request->file('surat_penghentian');
            $fileName = 'Surat_Penghentian_' . ($doc->pks_id ?? $id) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('surat_penghentian', $fileName, 'public');
            $filePath = '/storage/' . $path;
        }

        $doc->update([
            'status_pks' => 'Tidak Dilanjutkan',
            'url_surat_penghentian' => $filePath,
            'alasan_penghentian' => $request->alasan_penghentian,
            'tanggal_penghentian' => now()->toDateString(),
        ]);

        // Cek apakah mitra masih memiliki PKS aktif lain
        $mitraId = $doc->mitra_id;
        if ($mitraId) {
            $hasActivePks = PksDocument::where('mitra_id', $mitraId)
                ->where('status_pks', 'Aktif')
                ->exists();
            if (!$hasActivePks) {
                \App\Models\Mitra::where('mitra_id', $mitraId)->update(['status_mitra' => 'Tidak Aktif']);
            }
        }

        // Catat ke system log jika ada
        try {
            \App\Models\SystemLog::create([
                'pengguna_id' => auth()->id() ?? $request->input('pengguna_id', $doc->pengguna_id ?? 1),
                'bidang' => $doc->bidang ?? 'Umum',
                'aksi' => 'Penghentian PKS',
                'loggable_type' => 'App\Models\PksDocument',
                'loggable_id' => $doc->pks_id,
                'keterangan' => 'PKS ' . ($doc->nomor_pks ?? 'No. ' . $doc->pks_id) . ' dinyatakan Tidak Dilanjutkan. Alasan: ' . $request->alasan_penghentian,
            ]);
        } catch (\Exception $e) {
            // ignore log error
        }

        return response()->json([
            'success' => true,
            'message' => 'PKS berhasil dihentikan dan dinyatakan Tidak Dilanjutkan.',
            'data' => $doc->load('mitra', 'pengguna'),
        ]);
    }
}
