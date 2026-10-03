<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PksDocument extends Model
{
    protected $table = 'pks_documents';
    protected $primaryKey = 'pksId';

    protected $fillable = [
        'mitraId',
        'penggunaId',
        'bidang',
        'jenis_pks',
        'nomor_pks',
        'ringkasan_pks',
        'tanggal_mulai',
        'tanggal_berakhir',
        'url_berkas',
        'status_persetujuan',
        'status_pks',
        'catatan_revisi',
    ];

    public function mitra()
    {
        return $this->belongsTo(Mitra::class, 'mitraId', 'mitraId');
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'penggunaId', 'penggunaId');
    }

    public function riwayat_persetujuan()
    {
        return $this->hasMany(PksApproval::class, 'pks_id', 'pksId')->orderBy('created_at', 'asc');
    }
}
