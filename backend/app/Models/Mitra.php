<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mitra extends Model
{
    use \App\Traits\LogsSystemActivity;

    protected $table = 'mitra';
    protected $primaryKey = 'mitra_id';

    protected $fillable = [
        'nama_mitra',
        'bidang',
        'nama_pengelola',
        'jabatan',
        'no_hp_pengelola',
        'email_pengelola',
        'alamat_mitra',
        'status_mitra',
    ];

    protected $appends = [
        'mitraId',
    ];

    public function getMitraIdAttribute()
    {
        return $this->attributes['mitra_id'] ?? $this->attributes['mitraId'] ?? null;
    }

    public function pks()
    {
        return $this->hasMany(PksDocument::class, 'mitra_id', 'mitra_id');
    }

    public function pksDocuments()
    {
        return $this->pks();
    }
}
