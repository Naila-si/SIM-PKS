<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PksTemplate extends Model
{
    protected $table = 'pks_templates';
    protected $primaryKey = 'templateId';

    protected $fillable = [
        'penggunaId',
        'nama_template',
        'bidang',
        'jenis_pks',
        'versi_template',
        'status_template',
        'url_berkas',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'penggunaId', 'penggunaId');
    }
}
