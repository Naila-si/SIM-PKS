<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mitra extends Model
{
    protected $table = 'mitra';
    protected $primaryKey = 'mitraId';

    protected $fillable = [
        'nama_mitra',
        'nama_pengelola',
        'no_hp_pengelola',
        'email_pengelola',
        'alamat_mitra',
        'status_mitra',
    ];

    public function pksDocuments()
    {
        return $this->hasMany(PksDocument::class, 'mitraId', 'mitraId');
    }
}
