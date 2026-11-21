<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TokenAksesPengguna extends Model
{
    protected $table = 'token_akses_pengguna';

    protected $fillable = [
        'pengguna_id',
        'nama',
        'token_hash',
        'abilities',
        'terakhir_digunakan_pada',
        'kadaluarsa_pada',
    ];

    protected $casts = [
        'terakhir_digunakan_pada' => 'datetime',
        'kadaluarsa_pada' => 'datetime',
        'abilities' => 'array',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    /**
     * Buat token akses kriptografis baru untuk pengguna
     */
    public static function buatToken(Pengguna $pengguna, string $nama = 'web-auth', ?int $durasiHari = 30): string
    {
        $plainToken = Str::random(64);
        $tokenHash = hash('sha256', $plainToken);

        static::create([
            'pengguna_id' => $pengguna->pengguna_id ?? $pengguna->penggunaId,
            'nama' => $nama,
            'token_hash' => $tokenHash,
            'kadaluarsa_pada' => $durasiHari ? now()->addDays($durasiHari) : null,
        ]);

        return $plainToken;
    }

    /**
     * Verifikasi token akses kriptografis dan kembalikan Pengguna jika valid
     */
    public static function verifikasiToken(?string $plainToken): ?Pengguna
    {
        if (empty($plainToken) || strlen($plainToken) < 16) {
            return null;
        }

        $tokenHash = hash('sha256', $plainToken);

        $record = static::with('pengguna')
            ->where('token_hash', $tokenHash)
            ->first();

        if (!$record) {
            return null;
        }

        if ($record->kadaluarsa_pada && $record->kadaluarsa_pada->isPast()) {
            $record->delete();
            return null;
        }

        $pengguna = $record->pengguna;
        if (!$pengguna || $pengguna->status !== 'Aktif') {
            return null;
        }

        // Update waktu terakhir digunakan
        $record->update(['terakhir_digunakan_pada' => now()]);

        return $pengguna;
    }

    /**
     * Cabut (revoke) token akses tertentu
     */
    public static function cabutToken(?string $plainToken): bool
    {
        if (empty($plainToken)) {
            return false;
        }

        $tokenHash = hash('sha256', $plainToken);
        return (bool) static::where('token_hash', $tokenHash)->delete();
    }

    /**
     * Cabut seluruh token akses milik pengguna tertentu
     */
    public static function cabutSemuaToken(int $penggunaId): int
    {
        return static::where('pengguna_id', $penggunaId)->delete();
    }
}
