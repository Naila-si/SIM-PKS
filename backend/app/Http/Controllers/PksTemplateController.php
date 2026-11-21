<?php

namespace App\Http\Controllers;

use App\Models\PksTemplate;
use Illuminate\Http\Request;
use App\Traits\HandlesBidangAuthorization;

class PksTemplateController extends Controller
{
    use HandlesBidangAuthorization;

    public function index(Request $request)
    {
        $query = PksTemplate::with(['pengguna', 'pengubah']);

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            $allowedVariants = self::getBidangVariants($authUser->bidang);
            if (!empty($allowedVariants)) {
                $query->whereIn('bidang', $allowedVariants);
            }
        } elseif ($request->has('bidang') && $request->bidang !== 'Semua' && $request->bidang !== 'Semua Bidang') {
            $variants = self::getBidangVariants($request->bidang);
            $query->whereIn('bidang', $variants);
        }

        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        $template = PksTemplate::with(['pengguna', 'pengubah'])->find($id);
        if (!$template) {
            return response()->json(['message' => 'Template tidak ditemukan'], 404);
        }

        $authUser = $request->user();
        if ($authUser && in_array(strtolower($authUser->role), ['pengelola_pks', 'pengelola']) && !empty($authUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($authUser, $template->bidang)) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        return response()->json($template);
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        $userRole = strtolower((string)($currentUser->role ?? ''));

        // RBAC: Hanya Admin dan Pengelola PKS yang berhak menambah template (SEC-RBAC-02)
        if (!in_array($userRole, ['admin_utama', 'admin', 'pengelola_pks', 'pengelola'])) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Hanya Administrator Utama dan Pengelola PKS yang berwenang mengelola template dokumen.'
            ], 403);
        }

        $request->validate([
            'nama_template' => 'required|string|max:255',
            'bidang' => 'required|string|max:255',
            'jenis_pks' => 'required|string|max:255',
            'kategori_template' => 'nullable|string|in:PKS,Adendum',
            'file_template' => 'required|file|mimes:docx,doc|max:10240',
        ], [
            'file_template.required' => 'Berkas template dokumen wajib diunggah.',
            'file_template.mimes' => 'Format berkas template harus berupa Word (.docx / .doc).',
            'file_template.max' => 'Ukuran berkas template maksimal 10MB.',
        ]);

        $targetBidang = $request->bidang;

        // Proteksi Bidang untuk Pengelola PKS
        if (in_array($userRole, ['pengelola_pks', 'pengelola']) && !empty($currentUser->bidang)) {
            $targetBidang = $currentUser->bidang;
        }

        $file = $request->file('file_template');
        $extension = $file->getClientOriginalExtension() ?: 'docx';
        $fileName = self::sanitizeFileName(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;

        // Simpan ke private storage (SEC-DOC-01)
        $destinationDir = storage_path('app/private/templates');
        if (!file_exists($destinationDir)) {
            mkdir($destinationDir, 0755, true);
        }
        $file->move($destinationDir, $fileName);
        $path = 'templates/' . $fileName;
        
        PksTemplate::where('bidang', $targetBidang)
                    ->where('jenis_pks', $request->jenis_pks)
                    ->where('kategori_template', $request->input('kategori_template', 'PKS'))
                    ->update(['status_template' => 'Tidak Aktif']);

        $template = PksTemplate::create([
            'pengguna_id' => $currentUser ? ($currentUser->pengguna_id ?? $currentUser->id) : 1, 
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
        if (!$template) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $currentUser = $request->user();
        $userRole = strtolower((string)($currentUser->role ?? ''));

        if (!in_array($userRole, ['admin_utama', 'admin', 'pengelola_pks', 'pengelola'])) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        // Pengelola PKS hanya dapat mengubah template pada bidangnya
        if (in_array($userRole, ['pengelola_pks', 'pengelola']) && !empty($currentUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($currentUser, $template->bidang)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak untuk mengubah template di luar bidang Anda.'
                ], 403);
            }
        }

        $dataToUpdate = $request->only(['status_template', 'nama_template']);
        $dataToUpdate['diperbarui_oleh'] = $currentUser ? $currentUser->pengguna_id : 1;

        if ($request->hasFile('file_template')) {
            $file = $request->file('file_template');
            $extension = $file->getClientOriginalExtension() ?: 'docx';
            $fileName = self::sanitizeFileName(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;
            
            $destinationDir = storage_path('app/private/templates');
            if (!file_exists($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            $file->move($destinationDir, $fileName);
            $dataToUpdate['url_berkas'] = 'templates/' . $fileName;
            $dataToUpdate['versi_template'] = ($template->versi_template ?? 1) + 1;
        }

        $template->update($dataToUpdate);
        return response()->json($template);
    }

    public function destroy(Request $request, $id)
    {
        $template = PksTemplate::find($id);
        if (!$template) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $currentUser = $request->user();
        $userRole = strtolower((string)($currentUser->role ?? ''));

        if (!in_array($userRole, ['admin_utama', 'admin', 'pengelola_pks', 'pengelola'])) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        if (in_array($userRole, ['pengelola_pks', 'pengelola']) && !empty($currentUser->bidang)) {
            if (!self::isUserAuthorizedForBidang($currentUser, $template->bidang)) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }
        }

        // Hapus berkas fisik jika ada
        if ($template->url_berkas) {
            $filePath = self::resolveSecureFilePath($template->url_berkas);
            if ($filePath && file_exists($filePath)) {
                @unlink($filePath);
            }
        }
        
        $template->delete();
        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Download template PKS secara aman & terautentikasi (GET /api/pks-templates/{id}/download)
     */
    public function downloadTemplate(Request $request, $id)
    {
        $template = PksTemplate::find($id);
        if (!$template) {
            return response()->json(['success' => false, 'message' => 'Template tidak ditemukan.'], 404);
        }

        $filePath = self::resolveSecureFilePath($template->url_berkas);
        if (!$filePath || !file_exists($filePath)) {
            return response()->json(['success' => false, 'message' => 'Berkas template fisik tidak ditemukan di server.'], 404);
        }

        $downloadName = self::sanitizeFileName($template->nama_template) . '.' . pathinfo($filePath, PATHINFO_EXTENSION);
        return response()->download($filePath, $downloadName);
    }
}
