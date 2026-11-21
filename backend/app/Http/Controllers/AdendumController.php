<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Adendum;
use App\Models\PksDocument;
use App\Models\PksTemplate;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpWord\TemplateProcessor;
use App\Traits\HandlesBidangAuthorization;

class AdendumController extends Controller
{
    use HandlesBidangAuthorization;

    public function getAll(Request $request)
    {
        $authUser = $request->user();
        $query = Adendum::with(['pembuat', 'pksDocument.mitra', 'pksDocument.pengguna', 'riwayat_persetujuan.user'])
            ->orderBy('created_at', 'desc');

        // Pembatasan Bidang untuk Pengelola PKS (SEC-RBAC-01)
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            $allowedVariants = self::getBidangVariants($authUser->bidang);
            if (!empty($allowedVariants)) {
                $query->whereHas('pksDocument', function ($q) use ($allowedVariants) {
                    $q->whereIn('bidang', $allowedVariants);
                });
            }
        }

        if ($request->filled('per_page') || $request->filled('page')) {
            $perPage = max(1, min((int) $request->input('per_page', 20), 100));
            $paginated = $query->paginate($perPage);
            return response()->json([
                'success' => true,
                'data' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ]
            ]);
        }

        $adendums = $query->get();
            
        return response()->json([
            'success' => true,
            'data' => $adendums
        ]);
    }

    public function index(Request $request, $pksId)
    {
        $authUser = $request->user();
        $parentPks = PksDocument::find($pksId);

        if ($parentPks && $authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $parentPks->bidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak akses untuk melihat adendum PKS di luar bidang ' . $authUser->bidang . '.'
                ], 403);
            }
        }

        $adendums = Adendum::where('pks_id', $pksId)
            ->with(['pembuat', 'pksDocument.mitra', 'pksDocument.pengguna', 'riwayat_persetujuan.user'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $adendums
        ]);
    }

    public function show(Request $request, $id)
    {
        $adendum = Adendum::with(['pembuat', 'pksDocument.mitra', 'pksDocument.pengguna', 'riwayat_persetujuan.user'])->find($id);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Adendum tidak ditemukan'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if ($adendum->pksDocument && !self::isUserAuthorizedForBidang($authUser, $adendum->pksDocument->bidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak akses untuk melihat adendum di luar bidang ' . $authUser->bidang . '.'
                ], 403);
            }
        }

        return response()->json(['success' => true, 'data' => $adendum]);
    }

    public function store(Request $request, $pksId)
    {
        $parentPks = PksDocument::find($pksId);
        if (!$parentPks) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen PKS induk tidak ditemukan di sistem.'
            ], 404);
        }

        $authUser = $request->user();

        // Validasi Alur Bisnis: Adendum hanya untuk PKS aktif / disetujui
        $pksStatus = strtolower((string)$parentPks->status_persetujuan);
        $pksStatusReal = strtolower((string)$parentPks->status_pks);
        if ($pksStatus !== 'disetujui' && $pksStatusReal !== 'aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Adendum hanya dapat diajukan untuk dokumen PKS yang telah Disetujui/Aktif.'
            ], 422);
        }

        // Validasi Bidang jika dibuat oleh Pengelola PKS
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $parentPks->bidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki wewenang membuat adendum untuk PKS bidang ' . $parentPks->bidang . '.'
                ], 403);
            }
        }

        $ruangLingkup = $request->input('ruang_lingkup_perubahan', $request->input('ruangLingkupPerubahan'));
        $tanggalMulai = $request->input('tanggal_mulai', $request->input('tanggalMulai'));
        $tanggalBerakhir = $request->input('tanggal_berakhir', $request->input('tanggalBerakhir'));
        $penggunaId = $authUser ? $authUser->pengguna_id : ($request->input('pengguna_id', 1));

        $validator = Validator::make([
            'ruang_lingkup_perubahan' => $ruangLingkup,
            'tanggal_mulai' => $tanggalMulai,
            'tanggal_berakhir' => $tanggalBerakhir,
        ], [
            'ruang_lingkup_perubahan' => 'required|string|max:3000',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => 'required|date|after:tanggal_mulai',
        ], [
            'ruang_lingkup_perubahan.required' => 'Ruang lingkup perubahan adendum wajib diisi.',
            'ruang_lingkup_perubahan.max' => 'Ruang lingkup perubahan maksimal 3000 karakter.',
            'tanggal_berakhir.after' => 'Tanggal Berakhir Adendum harus lebih besar dari Tanggal Mulai.',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $adendum = Adendum::create([
            'pks_id' => $parentPks->pks_id,
            'nomor_adendum' => null,
            'ruang_lingkup_perubahan' => $ruangLingkup,
            'tanggal_mulai' => $tanggalMulai,
            'tanggal_berakhir' => $tanggalBerakhir,
            'status_persetujuan' => 'Draft',
            'status_adendum' => 'Draf',
            'pengguna_id' => $penggunaId,
        ]);

        return response()->json(['success' => true, 'data' => $adendum], 201);
    }

    public function update(Request $request, $id)
    {
        $adendum = Adendum::with('pksDocument')->find($id);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Adendum tidak ditemukan'], 404);
        }

        $authUser = $request->user();
        if ($authUser && !in_array($authUser->role, ['admin_utama', 'admin'])) {
            $pembuatId = $adendum->pembuat_id ?? $adendum->pengguna_id;
            if ($pembuatId && $pembuatId != $authUser->pengguna_id) {
                return response()->json(['success' => false, 'message' => 'Hanya Petugas pembuat Adendum yang berhak mengubah draf ini.'], 403);
            }
        }

        // Pengecekan Bidang Pengelola PKS
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if ($adendum->pksDocument && !self::isUserAuthorizedForBidang($authUser, $adendum->pksDocument->bidang)) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak untuk mengubah adendum di luar bidang Anda.'], 403);
            }
        }

        $statusPers = strtolower($adendum->status_persetujuan ?? 'draft');
        if (!in_array($statusPers, ['draft', 'draf']) && !str_contains($statusPers, 'revisi')) {
            return response()->json(['success' => false, 'message' => 'Adendum yang sedang dalam proses persetujuan tidak dapat diubah.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'ruang_lingkup_perubahan' => 'sometimes|string|max:3000',
            'ruangLingkupPerubahan' => 'sometimes|string|max:3000',
            'tanggal_mulai' => 'sometimes|date',
            'tanggalMulai' => 'sometimes|date',
            'tanggal_berakhir' => 'sometimes|date',
            'tanggalBerakhir' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $updateData = [];
        if ($request->has('ruang_lingkup_perubahan')) $updateData['ruang_lingkup_perubahan'] = $request->input('ruang_lingkup_perubahan');
        if ($request->has('ruangLingkupPerubahan')) $updateData['ruang_lingkup_perubahan'] = $request->input('ruangLingkupPerubahan');
        if ($request->has('tanggal_mulai')) $updateData['tanggal_mulai'] = $request->input('tanggal_mulai');
        if ($request->has('tanggalMulai')) $updateData['tanggal_mulai'] = $request->input('tanggalMulai');
        if ($request->has('tanggal_berakhir')) $updateData['tanggal_berakhir'] = $request->input('tanggal_berakhir');
        if ($request->has('tanggalBerakhir')) $updateData['tanggal_berakhir'] = $request->input('tanggalBerakhir');

        // Proteksi VULN-06: status_persetujuan dan status_adendum TIDAK BOLEH diubah langsung via update endpoint!
        $adendum->update($updateData);

        return response()->json(['success' => true, 'data' => $adendum]);
    }

    public function destroy(Request $request, $id)
    {
        $adendum = Adendum::find($id);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        $authUser = $request->user();
        if ($authUser && !in_array($authUser->role, ['admin_utama', 'admin'])) {
            $pembuatId = $adendum->pembuat_id ?? $adendum->pengguna_id;
            if ($pembuatId && $pembuatId != $authUser->pengguna_id) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak untuk menghapus draf adendum ini.'], 403);
            }
        }

        $statusPers = strtolower($adendum->status_persetujuan ?? 'draft');
        if (!in_array($statusPers, ['draft', 'draf'])) {
            return response()->json(['success' => false, 'message' => 'Hanya adendum berstatus Draft yang dapat dihapus.'], 403);
        }

        // Hapus berkas fisik jika ada
        if ($adendum->url_berkas) {
            $berkas = self::resolveSecureFilePath($adendum->url_berkas);
            if ($berkas && file_exists($berkas)) {
                @unlink($berkas);
            }
        }

        $adendum->riwayat_persetujuan()->delete();
        $adendum->delete();

        return response()->json(['success' => true, 'message' => 'Draf adendum berhasil dihapus.']);
    }

    public function generateDocx(Request $request, $id)
    {
        $adendum = Adendum::with('pksDocument.mitra')->find($id);
        if (!$adendum) {
            return response()->json(['message' => 'Adendum tidak ditemukan'], 404);
        }

        $doc = $adendum->pksDocument;
        if (!$doc) {
            return response()->json(['message' => 'PKS Induk tidak ditemukan'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $doc->bidang)) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        // Cari template adendum
        $template = PksTemplate::where('bidang', $doc->bidang)
                               ->where('jenis_pks', 'Adendum')
                               ->where('status_template', 'Aktif')
                               ->first();

        if (!$template) {
            $variants = self::getBidangVariants($doc->bidang);
            $template = PksTemplate::whereIn('bidang', $variants)
                                   ->where('jenis_pks', 'Adendum')
                                   ->where('status_template', 'Aktif')
                                   ->first();
        }

        if (!$template) {
            $template = PksTemplate::where('bidang', $doc->bidang)
                               ->where('nama_template', 'like', '%Adendum%')
                               ->where('status_template', 'Aktif')
                               ->first();
        }

        if (!$template) {
            return response()->json(['message' => 'Template Adendum tidak ditemukan untuk bidang ' . $doc->bidang . '.'], 404);
        }

        $templatePath = self::resolveSecureFilePath($template->url_berkas);
        if (!$templatePath || !file_exists($templatePath)) {
            return response()->json(['message' => 'File template tidak ditemukan di server'], 404);
        }

        try {
            $templateProcessor = new TemplateProcessor($templatePath);
            $templateProcessor->setValue('nama_mitra', htmlspecialchars($doc->mitra->nama_mitra ?? '', ENT_QUOTES, 'UTF-8'));
            $templateProcessor->setValue('alamat_mitra', htmlspecialchars($doc->mitra->alamat_mitra ?? '', ENT_QUOTES, 'UTF-8'));
            $templateProcessor->setValue('nama_pengelola', htmlspecialchars($doc->mitra->nama_pengelola ?? '', ENT_QUOTES, 'UTF-8'));
            $templateProcessor->setValue('nomor_pks', htmlspecialchars($doc->nomor_pks ?? '-', ENT_QUOTES, 'UTF-8'));
            
            $templateProcessor->setValue('nomor_adendum', htmlspecialchars($adendum->nomor_adendum ?? $adendum->nomorAdendum ?? '-', ENT_QUOTES, 'UTF-8'));
            $templateProcessor->setValue('tanggal_mulai', $adendum->tanggal_mulai ?? $adendum->tanggalMulai ?? '-');
            $templateProcessor->setValue('tanggal_berakhir', $adendum->tanggal_berakhir ?? $adendum->tanggalBerakhir ?? '-');
            $templateProcessor->setValue('ruang_lingkup', htmlspecialchars($adendum->ruang_lingkup_perubahan ?? $adendum->ruangLingkupPerubahan ?? '-', ENT_QUOTES, 'UTF-8'));

            $cleanMitra = self::sanitizeFileName($doc->mitra->nama_mitra ?? 'Mitra');
            $fileName = 'Draft_Adendum_' . $cleanMitra . '_' . time() . '.docx';

            // Simpan ke private storage (SEC-DOC-01)
            $destinationDir = storage_path('app/private/adendum_drafts');
            if (!file_exists($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            $outputPath = $destinationDir . DIRECTORY_SEPARATOR . $fileName;

            $templateProcessor->saveAs($outputPath);
            $adendum->update(['url_berkas' => 'adendum_drafts/' . $fileName]);

            return response()->download($outputPath, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal generate document adendum: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download Draf Adendum secara aman & terautentikasi (GET /api/adendums/{id}/download-draft)
     */
    public function downloadDraft(Request $request, $id)
    {
        $adendum = Adendum::with('pksDocument.mitra')->find($id);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Adendum tidak ditemukan.'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if ($adendum->pksDocument && !self::isUserAuthorizedForBidang($authUser, $adendum->pksDocument->bidang)) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak akses untuk mengunduh berkas ini.'], 403);
            }
        }

        $url = $adendum->url_berkas ?? $adendum->urlBerkas;
        if (!$url) {
            return response()->json(['success' => false, 'message' => 'Berkas draf adendum belum dibuat.'], 404);
        }

        $filePath = self::resolveSecureFilePath($url);
        if (!$filePath || !file_exists($filePath)) {
            return response()->json(['success' => false, 'message' => 'Berkas fisik draf adendum tidak ditemukan di server.'], 404);
        }

        $cleanMitra = self::sanitizeFileName($adendum->pksDocument->mitra->nama_mitra ?? 'Mitra');
        $downloadName = 'Draft_Adendum_' . $cleanMitra . '.docx';

        return response()->download($filePath, $downloadName);
    }

    public function uploadFinal(Request $request, $id)
    {
        $adendum = Adendum::with('pksDocument')->find($id);
        if (!$adendum) {
            return response()->json(['success' => false, 'message' => 'Adendum tidak ditemukan.'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if ($adendum->pksDocument && !self::isUserAuthorizedForBidang($authUser, $adendum->pksDocument->bidang)) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak untuk mengunggah dokumen di luar bidang Anda.'], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,docx,doc|max:10240',
        ], [
            'file.required' => 'Berkas fisik dokumen final wajib diunggah.',
            'file.mimes' => 'Format berkas harus berupa PDF atau Word (DOC/DOCX).',
            'file.max' => 'Ukuran berkas maksimal adalah 10MB.',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension() ?: 'pdf';
            $fileName = 'Final_Adendum_' . $id . '_' . time() . '.' . $extension;

            // Simpan ke private storage (SEC-DOC-01)
            $destinationDir = storage_path('app/private/adendum_finals');
            if (!file_exists($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            $file->move($destinationDir, $fileName);

            $adendum->update([
                'url_berkas' => 'adendum_finals/' . $fileName,
            ]);

            // Catat ke riwayat persetujuan (Anti-Spoofing: Pengguna ID dari auth user)
            $uploaderId = $authUser ? $authUser->pengguna_id : ($adendum->pengguna_id ?? 1);

            \App\Models\AdendumApproval::create([
                'adendum_id' => $adendum->adendum_id,
                'pengguna_id' => $uploaderId,
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

    public function downloadFinal(Request $request, $id)
    {
        $adendum = Adendum::with('pksDocument')->find($id);
        if (!$adendum) {
            return response()->json(['message' => 'Adendum tidak ditemukan.'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if ($adendum->pksDocument && !self::isUserAuthorizedForBidang($authUser, $adendum->pksDocument->bidang)) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        $url = $adendum->url_berkas ?? $adendum->urlBerkas;
        if (!$url) {
            return response()->json(['message' => 'Dokumen final adendum belum diunggah.'], 404);
        }

        $path = self::resolveSecureFilePath($url);
        if (!$path || !file_exists($path)) {
            return response()->json(['message' => 'Berkas fisik tidak ditemukan di server.'], 404);
        }

        $downloadName = 'Dokumen_Final_Adendum_' . ($adendum->nomor_adendum ? self::sanitizeFileName($adendum->nomor_adendum) : $adendum->adendum_id) . '.' . pathinfo($path, PATHINFO_EXTENSION);

        return response()->download($path, $downloadName);
    }
}
