<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Adendum;
use App\Models\PksTemplate;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpWord\TemplateProcessor;

class AdendumController extends Controller
{
    public function getAll(Request $request)
    {
        $adendums = Adendum::with(['pembuat', 'pksDocument.mitra', 'pksDocument.pengguna', 'riwayat_persetujuan.user'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $adendums
        ]);
    }

    public function index($pksId)
    {
        $adendums = Adendum::where('pks_document_id', $pksId)
            ->with(['pembuat', 'pksDocument.mitra', 'pksDocument.pengguna', 'riwayat_persetujuan.user'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $adendums
        ]);
    }

    public function show($id)
    {
        $adendum = Adendum::with(['pembuat', 'pksDocument.mitra', 'pksDocument.pengguna', 'riwayat_persetujuan.user'])->find($id);
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
            'nomorAdendum' => null,
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

        $statusPers = strtolower($adendum->statusPersetujuan ?? 'draft');
        if (!in_array($statusPers, ['draft', 'draf']) && !str_contains($statusPers, 'revisi')) {
            return response()->json(['success' => false, 'message' => 'Adendum yang sedang dalam proses persetujuan tidak dapat diubah.'], 403);
        }

        $adendum->update($request->only([
            'ruangLingkupPerubahan', 'tanggalMulai', 'tanggalBerakhir', 'statusPersetujuan', 'catatanRevisi'
        ]));

        return response()->json(['success' => true, 'data' => $adendum]);
    }

    public function destroy($id)
    {
        $adendum = Adendum::find($id);
        if (!$adendum) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $statusPers = strtolower($adendum->statusPersetujuan ?? 'draft');
        if (!in_array($statusPers, ['draft', 'draf'])) {
            return response()->json(['success' => false, 'message' => 'Hanya adendum berstatus Draft yang dapat dihapus.'], 403);
        }

        $adendum->delete();
        return response()->json(['success' => true]);
    }

    public function generateDocx($id)
    {
        $adendum = Adendum::with('pksDocument.mitra')->find($id);
        if (!$adendum) {
            return response()->json(['message' => 'Adendum tidak ditemukan'], 404);
        }

        $doc = $adendum->pksDocument;
        if (!$doc) {
            return response()->json(['message' => 'PKS Induk tidak ditemukan'], 404);
        }

        // Cari template adendum
        $template = PksTemplate::where('bidang', $doc->bidang)
                               ->where('jenis_pks', 'Adendum')
                               ->where('status_template', 'Aktif')
                               ->first();

        // Fallback jika tidak ada jenis_pks = Adendum, cari yang namanya mengandung 'Adendum'
        if (!$template) {
            $template = PksTemplate::where('bidang', $doc->bidang)
                               ->where('nama_template', 'like', '%Adendum%')
                               ->where('status_template', 'Aktif')
                               ->first();
        }

        if (!$template) {
            return response()->json(['message' => 'Template Adendum tidak ditemukan untuk bidang ' . $doc->bidang . '. Pastikan Admin sudah membuat template dengan nama mengandung "Adendum" atau jenis "Adendum"'], 404);
        }

        $templatePath = storage_path('app/public/' . $template->url_berkas);
        if (!file_exists($templatePath)) {
            return response()->json(['message' => 'File template tidak ditemukan di server'], 404);
        }

        try {
            $templateProcessor = new TemplateProcessor($templatePath);
            // Replace generic Mitra data
            $templateProcessor->setValue('nama_mitra', $doc->mitra->nama_mitra ?? '');
            $templateProcessor->setValue('alamat_mitra', $doc->mitra->alamat_mitra ?? '');
            $templateProcessor->setValue('nama_pengelola', $doc->mitra->nama_pengelola ?? '');
            $templateProcessor->setValue('nomor_pks', $doc->nomor_pks ?? '-');
            
            // Replace Adendum data
            $templateProcessor->setValue('nomor_adendum', $adendum->nomorAdendum ?? '-');
            $templateProcessor->setValue('tanggal_mulai', $adendum->tanggalMulai ?? '-');
            $templateProcessor->setValue('tanggal_berakhir', $adendum->tanggalBerakhir ?? '-');
            $templateProcessor->setValue('ruang_lingkup', $adendum->ruangLingkupPerubahan ?? '-');

            $fileName = 'Draft_Adendum_' . str_replace(' ', '_', $doc->mitra->nama_mitra ?? 'Mitra') . '_' . time() . '.docx';
            $outputPath = storage_path('app/public/adendum_drafts/' . $fileName);

            if (!file_exists(storage_path('app/public/adendum_drafts'))) {
                mkdir(storage_path('app/public/adendum_drafts'), 0755, true);
            }

            $templateProcessor->saveAs($outputPath);

            return response()->download($outputPath);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal generate document adendum: ' . $e->getMessage()], 500);
        }
    }

    public function uploadFinal(Request $request, $id)
    {
        $adendum = Adendum::find($id);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Adendum tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,docx,doc|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $file = $request->file('file');
            $fileName = 'Final_Adendum_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('adendum_finals', $fileName, 'public');

            $adendum->update([
                'urlBerkas' => 'adendum_finals/' . $fileName,
            ]);

            // Catat ke riwayat persetujuan
            $userId = $request->input('user_id') ?? $request->attributes->get('user_id');
            $pengguna = $userId ? \App\Models\Pengguna::find($userId) : null;

            \App\Models\AdendumApproval::create([
                'adendumId' => $adendum->adendumId,
                'penggunaId' => $pengguna ? $pengguna->penggunaId : ($adendum->pembuat_id ?? 1),
                'aktor' => $pengguna ? $pengguna->nama : 'Pengelola',
                'status_aksi' => 'Dokumen Final Scan Diunggah',
                'catatan' => 'Dokumen fisik adendum yang telah ditandatangani berhasil diunggah.'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen final Adendum berhasil diunggah.',
                'data' => $adendum->fresh(['pembuat', 'pksDocument.mitra', 'pksDocument.pengguna', 'riwayat_persetujuan.user'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal mengunggah berkas: ' . $e->getMessage()], 500);
        }
    }

    public function downloadFinal($id)
    {
        $adendum = Adendum::find($id);
        if (!$adendum || !$adendum->urlBerkas) {
            return response()->json(['message' => 'Dokumen final adendum belum diunggah.'], 404);
        }

        $path = storage_path('app/public/' . $adendum->urlBerkas);
        if (!file_exists($path)) {
            return response()->json(['message' => 'Berkas fisik tidak ditemukan di server.'], 404);
        }

        return response()->download($path);
    }
}
