<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model SesiPengguna (Tabel 'sesi_pengguna')
 * Mengatur token pengingat "Ingat Saya" (Remember Token) dan sesi login aktif di database
 */
class SesiPengguna extends Model
{
    use HasFactory;

    // Nama tabel di database
    protected $table = 'sesi_pengguna';

    // Kolom yang dapat diisi
    protected $fillable = [
        'pengguna_id',
        'token_ingat_saya',
        'ip_address',
        'user_agent',
        'kadaluarsa_pada',
    ];

    // Tipe data kolom tanggal
    protected $casts = [
        'kadaluarsa_pada' => 'datetime',
    ];

    /**
     * Relasi ke Model Pengguna (Pemilik Sesi)
     */
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}
