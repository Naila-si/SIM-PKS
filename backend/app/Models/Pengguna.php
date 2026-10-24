<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Model Pengguna (Tabel 'pengguna')
 * Mengatur entitas data pengguna sistem SIM-PKS Jasa Raharja
 */
class Pengguna extends Authenticatable
{
    use HasFactory, Notifiable, \App\Traits\LogsSystemActivity;

    // Nama tabel khusus di database
    protected $table = 'pengguna';

    // Primary Key tabel 'pengguna'
    protected $primaryKey = 'pengguna_id';

    // Kolom yang dapat diisi secara massal (Mass Assignable)
    protected $fillable = [
        'nama',
        'email',
        'password',
        'nomor_hp',
        'role',
        'wilayah',
        'samsat',
        'bidang',
        'unit_kerja',
        'status',
    ];

    // Field terhitung yang otomatis disertakan pada serialisasi JSON
    protected $appends = [
        'jabatan',
        'penggunaId',
    ];

    // Kolom yang disembunyikan saat data diubah ke JSON
    protected $hidden = [
        'password',
    ];

    /**
     * Accessor untuk backward compatibility (penggunaId -> pengguna_id)
     */
    public function getPenggunaIdAttribute()
    {
        return $this->attributes['pengguna_id'] ?? $this->attributes['penggunaId'] ?? null;
    }

    /**
     * Accessor Otomatis untuk Jabatan (Label Tampilan Formal Berdasarkan Kode Role)
     */
    public function getJabatanAttribute(): string
    {
        return match ($this->role) {
            'admin_utama' => 'Administrator Utama',
            'kabag' => 'Kepala Bagian Operasional',
            'pimpinan' => 'Pimpinan Kanwil',
            'pengelola_pks' => 'Pengelola PKS',
            'petugas_jr' => 'Petugas JR',
            default => 'Petugas JR',
        };
    }

    // Casting tipe data otomatis
    protected function casts(): array
    {
        return [
            'password' => 'hashed', // Otomatis meng-hash password menggunakan Bcrypt saat disimpan
        ];
    }

    /**
     * Relasi ke Tabel PKS
     */
    public function pks()
    {
        return $this->hasMany(PksDocument::class, 'pengguna_id', 'pengguna_id');
    }

    public function pksDocuments()
    {
        return $this->pks();
    }

    /**
     * Relasi ke Tabel PKS Templates
     */
    public function pksTemplates()
    {
        return $this->hasMany(PksTemplate::class, 'pengguna_id', 'pengguna_id');
    }
}
