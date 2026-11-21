<?php

namespace App\Traits;

use App\Models\Pengguna;

trait HandlesBidangAuthorization
{
    /**
     * Mengembalikan daftar varian penamaan bidang untuk pencocokan toleran (SW, IW, Pelayanan)
     */
    public static function getBidangVariants(?string $bidang): array
    {
        if (!$bidang || trim($bidang) === '' || trim($bidang) === 'Semua' || trim($bidang) === 'Lintas Bidang') {
            return [];
        }

        $b = trim(strtolower($bidang));

        if (str_contains($b, 'sw') || str_contains($b, 'sumbangan wajib')) {
            return [
                'SW',
                'Sumbangan Wajib (SW)',
                'Sumbangan Wajib',
                'Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ)',
            ];
        }

        if (str_contains($b, 'iw') || str_contains($b, 'iuran wajib')) {
            return [
                'IW',
                'Iuran Wajib (IW)',
                'Iuran Wajib',
            ];
        }

        if (str_contains($b, 'pelayanan')) {
            return [
                'Pelayanan',
                'Bidang Pelayanan',
            ];
        }

        return [$bidang];
    }

    /**
     * Memeriksa apakah pengguna memiliki hak otorisasi terhadap bidang target
     */
    public static function isUserAuthorizedForBidang($user, ?string $targetBidang): bool
    {
        if (!$user) {
            return false;
        }

        $role = strtolower((string)($user->role ?? ''));

        // Admin Utama, Admin, Kabag, dan Pimpinan berwenang atas semua bidang
        if (in_array($role, ['admin_utama', 'admin', 'kabag', 'pimpinan'])) {
            return true;
        }

        // Pengelola PKS wajib dibatasi ketat berdasarkan bidangnya
        if (in_array($role, ['pengelola_pks', 'pengelola'])) {
            if (empty($user->bidang) || $user->bidang === 'Lintas Bidang') {
                return true;
            }

            $userVariants = array_map('strtolower', self::getBidangVariants($user->bidang));
            $targetVariants = array_map('strtolower', self::getBidangVariants($targetBidang));

            return count(array_intersect($userVariants, $targetVariants)) > 0 || in_array(strtolower((string)$targetBidang), $userVariants);
        }

        return true;
    }

    /**
     * Resolusi berkas penyimpanan secara aman (mengutamakan storage/app/private, lalu storage/app/public)
     * Mencegah Path Traversal dengan validasi realpath
     */
    public static function resolveSecureFilePath(?string $relativePath): ?string
    {
        if (!$relativePath) {
            return null;
        }

        // Hilangkan prefix /storage/ atau storage/ jika ada
        $cleanPath = ltrim($relativePath, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        // 1. Cek pada direktori privat utama
        $privatePath = storage_path('app/private/' . $cleanPath);
        if (file_exists($privatePath)) {
            $real = realpath($privatePath);
            $appStorage = realpath(storage_path('app'));
            if ($real && $appStorage && str_starts_with($real, $appStorage)) {
                return $real;
            }
        }

        // 2. Cek fallback pada direktori public (kompatibilitas data lama)
        $publicPath = storage_path('app/public/' . $cleanPath);
        if (file_exists($publicPath)) {
            $real = realpath($publicPath);
            $appStorage = realpath(storage_path('app'));
            if ($real && $appStorage && str_starts_with($real, $appStorage)) {
                return $real;
            }
        }

        return null;
    }

    /**
     * Sanitasi nama file untuk mencegah karakter khusus dan path traversal
     */
    public static function sanitizeFileName(string $name): string
    {
        $sanitized = preg_replace('/[^A-Za-z0-9_\-]/', '_', $name);
        return trim(preg_replace('/_+/', '_', $sanitized), '_');
    }
}
