<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdendumApproval extends Model
{
    protected $table = 'adendum_approvals';
    protected $primaryKey = 'approvalId';

    protected $fillable = [
        'adendumId',
        'penggunaId',
        'aktor',
        'status_aksi',
        'catatan'
    ];

    public function user()
    {
        return $this->belongsTo(Pengguna::class, 'penggunaId', 'penggunaId');
    }

    public function adendum()
    {
        return $this->belongsTo(Adendum::class, 'adendumId', 'adendumId');
    }
}
