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
    use HasFactory, Notifiable;

    // Nama tabel khusus di database
    protected $table = 'pengguna';

    // Kolom yang dapat diisi secara massal (Mass Assignable)
    protected $fillable = [
        'nama',
        'email',
        'password',
        'nomor_hp',
        'jabatan',
        'role',
        'wilayah',
        'samsat',
        'bidang',
        'unit_kerja',
        'status',
    ];

    // Kolom yang disembunyikan saat data diubah ke JSON
    protected $hidden = [
        'password',
    ];

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
        return $this->hasMany(SesiPengguna::class, 'pengguna_id');
    }
}
