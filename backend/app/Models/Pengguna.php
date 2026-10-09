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

    // Primary Key khusus tabel 'pengguna'
    protected $primaryKey = 'penggunaId';

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
    ];

    // Kolom yang disembunyikan saat data diubah ke JSON
    protected $hidden = [
        'password',
    ];

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
     * Relasi ke Tabel Sesi Pengguna (Satu Pengguna punya banyak Sesi "Ingat Saya")
     */
    public function sesiPengguna()
    {
        return $this->hasMany(SesiPengguna::class, 'penggunaId');
    }

    /**
     * Relasi ke Tabel PKS Documents
     */
    public function pksDocuments()
    {
        return $this->hasMany(PksDocument::class, 'penggunaId', 'penggunaId');
    }

    /**
     * Relasi ke Tabel PKS Templates
     */
    public function pksTemplates()
    {
        return $this->hasMany(PksTemplate::class, 'penggunaId', 'penggunaId');
    }
}
