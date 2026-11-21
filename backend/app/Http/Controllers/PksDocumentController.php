<?php

namespace App\Http\Controllers;

use App\Models\PksDocument;
use App\Models\PksTemplate;
use Illuminate\Http\Request;
use PhpOffice\PhpWord\TemplateProcessor;
use App\Traits\HandlesBidangAuthorization;

class PksDocumentController extends Controller
{
    use HandlesBidangAuthorization;

    public function index(Request $request)
    {
        $authUser = $request->user();
        $query = PksDocument::with('mitra', 'pengguna', 'riwayat_persetujuan.user', 'adendums')
            ->orderBy('created_at', 'desc');

        // Pembatasan Ketat Bidang untuk Pengelola PKS (SEC-RBAC-01)
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            $allowedVariants = self::getBidangVariants($authUser->bidang);
            if (!empty($allowedVariants)) {
                $query->whereIn('bidang', $allowedVariants);
            }
        } elseif ($request->filled('bidang') && $request->bidang !== 'Semua' && $request->bidang !== 'Semua Bidang') {
            $variants = self::getBidangVariants($request->bidang);
            $query->whereIn('bidang', $variants);
        }

        // Dukungan Pagination jika diminta (PERF-01)
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

        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        $doc = PksDocument::with('mitra', 'pengguna', 'riwayat_persetujuan.user', 'adendums')->find($id);
        if (!$doc) {
            return response()->json(['message' => 'Not found'], 404);
        }

        // Verifikasi Otorisasi Bidang untuk Pengelola PKS (SEC-RBAC-01)
        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $doc->bidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak akses untuk melihat dokumen PKS di luar bidang ' . $authUser->bidang . '.'
                ], 403);
            }
        }

        return response()->json($doc);
    }

    public function store(Request $request)
    {
        $authUser = $request->user();
        $mitraId = $request->input('mitra_id', $request->input('mitraId'));
        $penggunaId = $authUser ? $authUser->pengguna_id : ($request->input('pengguna_id', $request->input('penggunaId')));
        $request->merge([
            'mitra_id' => $mitraId,
            'pengguna_id' => $penggunaId,
        ]);

        $validated = $request->validate([
            'mitra_id' => 'required|exists:mitra,mitra_id',
            'pengguna_id' => 'required|exists:pengguna,pengguna_id',
            'bidang' => 'required|string|max:100',
            'jenis_pks' => 'required|string|max:150',
            'ringkasan_pks' => 'required|string|max:5000',
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

        // Jika Pengelola PKS membuat dokumen, pastikan bidang sesuai
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $validated['bidang'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengelola PKS hanya dapat membuat dokumen PKS untuk bidang ' . $authUser->bidang . '.'
                ], 403);
            }
        }

        $validated['status_persetujuan'] = 'Draf';
        $doc = PksDocument::create($validated);
        
        return response()->json($doc, 201);
    }

    public function update(Request $request, $id)
    {
        $doc = PksDocument::with('mitra')->find($id);
        if (!$doc) {
            return response()->json(['message' => 'PKS not found'], 404);
        }

        $authUser = $request->user();
        $userRole = strtolower((string)($authUser->role ?? ''));

        // Cek Otorisasi Kepemilikan & Bidang
        if ($authUser && in_array($userRole, ['petugas_jr', 'petugas'])) {
            if ($doc->pengguna_id && $doc->pengguna_id != $authUser->pengguna_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Petugas pembuat PKS yang berhak mengubah data dokumen ini.'
                ], 403);
            }
        } elseif ($authUser && in_array($userRole, ['pengelola_pks', 'pengelola'])) {
            if (!self::isUserAuthorizedForBidang($authUser, $doc->bidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak untuk mengubah data PKS di luar bidang ' . $authUser->bidang . '.'
                ], 403);
            }
        }

        // Proteksi Integritas: PKS yang sudah disetujui/sedang dalam proses pemeriksaan tidak boleh diedit via update (SEC-INTEG-01)
        $statusPers = strtolower($doc->status_persetujuan ?? 'draf');
        if (!in_array($statusPers, ['draft', 'draf']) && !str_contains($statusPers, 'revisi')) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen PKS yang sedang dalam proses pemeriksaan atau telah disetujui tidak dapat diubah secara langsung. Perubahan klausul/masa berlaku harus melalui alur Adendum.'
            ], 422);
        }

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

        $validated = $request->validate([
            'bidang' => 'sometimes|string|max:100',
            'jenis_pks' => 'sometimes|string|max:150',
            'ringkasan_pks' => 'sometimes|string|max:5000',
            'tanggal_mulai' => 'sometimes|date',
            'tanggal_berakhir' => 'sometimes|date',
            'mitra' => 'sometimes|array',
            'mitra.nama_perusahaan' => 'sometimes|string|nullable|max:255',
            'mitra.alamat' => 'sometimes|string|nullable|max:500',
            'mitra.penanggung_jawab' => 'sometimes|string|nullable|max:255',
            'mitra.jabatan' => 'sometimes|string|nullable|max:150',
            'mitra.telepon' => 'sometimes|string|nullable|max:50',
            'mitra.email' => 'sometimes|string|nullable|email|max:255',
        ]);

        // Update PKS fields (proteksi status_persetujuan dan status_pks agar tidak tertimpa)
        $pksData = collect($validated)->except(['mitra', 'status_persetujuan', 'status_pks'])->toArray();
        if (!empty($pksData)) {
            $doc->update($pksData);
        }

        // Update Mitra fields jika disertakan
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

    public function destroy(Request $request, $id)
    {
        $doc = PksDocument::find($id);
        if (!$doc) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen PKS tidak ditemukan.'
            ], 404);
        }

        $authUser = $request->user();
        if ($authUser && !in_array($authUser->role, ['admin_utama', 'admin'])) {
            if ($doc->pengguna_id && $doc->pengguna_id != $authUser->pengguna_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak untuk menghapus dokumen PKS ini.'
                ], 403);
            }
        }

        $statusPers = strtolower($doc->status_persetujuan ?? 'draf');
        if (!in_array($statusPers, ['draft', 'draf'])) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya dokumen PKS berstatus Draf yang dapat dihapus.'
            ], 422);
        }

        // Hapus berkas draf jika ada di private/public storage
        if ($doc->url_berkas) {
            $berkasPath = self::resolveSecureFilePath($doc->url_berkas);
            if ($berkasPath && file_exists($berkasPath)) {
                @unlink($berkasPath);
            }
        }

        if ($doc->url_surat_penghentian) {
            $suratPath = self::resolveSecureFilePath($doc->url_surat_penghentian);
            if ($suratPath && file_exists($suratPath)) {
                @unlink($suratPath);
            }
        }

        // Hapus relasi adendum dan riwayat persetujuan
        $doc->adendums()->delete();
        $doc->riwayat_persetujuan()->delete();
        $doc->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dokumen PKS berhasil dihapus.'
        ], 200);
    }

    public function generateDocx(Request $request, $id)
    {
        $doc = PksDocument::with('mitra')->findOrFail($id);
        
        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $doc->bidang)) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        $template = PksTemplate::where('bidang', $doc->bidang)
                               ->where('jenis_pks', $doc->jenis_pks)
                               ->where('status_template', 'Aktif')
                               ->first();

        // Fallback jika tidak ditemukan dengan nama bidang eksak
        if (!$template) {
            $variants = self::getBidangVariants($doc->bidang);
            $template = PksTemplate::whereIn('bidang', $variants)
                                   ->where('jenis_pks', $doc->jenis_pks)
                                   ->where('status_template', 'Aktif')
                                   ->first();
        }

        if (!$template) {
            return response()->json(['message' => 'Template tidak ditemukan untuk bidang dan jenis PKS ini'], 404);
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
            $templateProcessor->setValue('tanggal_mulai', $doc->tanggal_mulai);
            $templateProcessor->setValue('tanggal_berakhir', $doc->tanggal_berakhir);
            
            $cleanMitraName = self::sanitizeFileName($doc->mitra->nama_mitra ?? 'Mitra');
            $fileName = 'Draft_PKS_' . $cleanMitraName . '_' . time() . '.docx';

            // Simpan ke private storage (SEC-DOC-01)
            $outputDir = storage_path('app/private/pks_drafts');
            if (!file_exists($outputDir)) {
                mkdir($outputDir, 0755, true);
            }
            $outputPath = $outputDir . DIRECTORY_SEPARATOR . $fileName;
            
            $templateProcessor->saveAs($outputPath);
            
            $doc->update(['url_berkas' => 'pks_drafts/' . $fileName]);
            
            return response()->download($outputPath, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal generate document: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download Draf PKS secara aman & terautentikasi (GET /api/pks/{id}/download-draft)
     */
    public function downloadDraft(Request $request, $id)
    {
        $doc = PksDocument::find($id);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Dokumen PKS tidak ditemukan.'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $doc->bidang)) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak akses untuk mengunduh dokumen di luar bidang Anda.'], 403);
            }
        }

        $url = $doc->url_berkas;
        if (!$url) {
            return response()->json(['success' => false, 'message' => 'Berkas draf PKS belum dibuat. Silakan generate draf terlebih dahulu.'], 404);
        }

        $filePath = self::resolveSecureFilePath($url);
        if (!$filePath || !file_exists($filePath)) {
            return response()->json(['success' => false, 'message' => 'Berkas fisik draf PKS tidak ditemukan di server.'], 404);
        }

        $cleanMitra = self::sanitizeFileName($doc->mitra->nama_mitra ?? 'Mitra');
        $ext = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'docx';
        $downloadName = 'Draft_PKS_' . $cleanMitra . '.' . $ext;

        return response()->download($filePath, $downloadName);
    }

    public function hentikanPks(Request $request, $id)
    {
        $doc = PksDocument::find($id);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Dokumen PKS tidak ditemukan'], 404);
        }

        $authUser = $request->user();
        $userRole = strtolower((string)($authUser->role ?? ''));

        // Otorisasi Penghentian PKS (SEC-RBAC-03)
        $isAdmin = in_array($userRole, ['admin_utama', 'admin']);
        $isCreator = ($authUser && $doc->pengguna_id && $authUser->pengguna_id == $doc->pengguna_id);
        $isAuthorizedPengelola = in_array($userRole, ['pengelola_pks', 'pengelola']) && self::isUserAuthorizedForBidang($authUser, $doc->bidang);

        if (!$isAdmin && !$isCreator && !$isAuthorizedPengelola) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak otorisasi untuk menghentikan dokumen PKS ini.'
            ], 403);
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
            $fileName = 'Surat_Penghentian_' . ($doc->pks_id ?? $id) . '_' . time() . '.pdf';
            
            // Simpan ke private storage (SEC-DOC-01)
            $destinationDir = storage_path('app/private/surat_penghentian');
            if (!file_exists($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            $file->move($destinationDir, $fileName);
            $filePath = 'surat_penghentian/' . $fileName;
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
                ->where('pks_id', '!=', $doc->pks_id)
                ->exists();
            if (!$hasActivePks) {
                \App\Models\Mitra::where('mitra_id', $mitraId)->update(['status_mitra' => 'Tidak Aktif']);
            }
        }

        // Catat ke system log (Anti-Spoofing: Pengguna ID diambil dari auth user terverifikasi)
        try {
            \App\Models\SystemLog::create([
                'pengguna_id' => $authUser ? $authUser->pengguna_id : 1,
                'bidang' => $doc->bidang ?? 'Umum',
                'aksi' => 'Penghentian PKS',
                'loggable_type' => 'App\Models\PksDocument',
                'loggable_id' => $doc->pks_id,
                'keterangan' => 'PKS ' . ($doc->nomor_pks ?? 'No. ' . $doc->pks_id) . ' dinyatakan Tidak Dilanjutkan. Alasan: ' . $request->alasan_penghentian,
            ]);
        } catch (\Exception $e) {
            // Abaikan kegagalan log
        }

        return response()->json([
            'success' => true,
            'message' => 'PKS berhasil dihentikan dan dinyatakan Tidak Dilanjutkan.',
            'data' => $doc->load('mitra', 'pengguna'),
        ]);
    }

    /**
     * Download Surat Penghentian PKS secara aman & terautentikasi (GET /api/pks/{id}/download-surat-penghentian)
     */
    public function downloadSuratPenghentian(Request $request, $id)
    {
        $doc = PksDocument::find($id);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Dokumen PKS tidak ditemukan.'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $doc->bidang)) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak akses untuk mengunduh berkas ini.'], 403);
            }
        }

        $url = $doc->url_surat_penghentian;
        if (!$url) {
            return response()->json(['success' => false, 'message' => 'Surat pernyataan penghentian belum diunggah untuk PKS ini.'], 404);
        }

        $filePath = self::resolveSecureFilePath($url);
        if (!$filePath || !file_exists($filePath)) {
            return response()->json(['success' => false, 'message' => 'Berkas fisik surat penghentian tidak ditemukan di server.'], 404);
        }

        $downloadName = 'Surat_Penghentian_PKS_' . ($doc->pks_id) . '.pdf';
        return response()->download($filePath, $downloadName);
    }
}
