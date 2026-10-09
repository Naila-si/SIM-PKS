<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Pengguna;

class PksApproval extends Model
{
    use \App\Traits\LogsSystemActivity;

    protected $table = 'pks_approvals';

    protected $fillable = [
        'pks_id',
        'user_id',
        'status_aksi',
        'catatan',
    ];

    public function pksDocument()
    {
        return $this->belongsTo(PksDocument::class, 'pks_id');
    }

    public function user()
    {
        return $this->belongsTo(Pengguna::class, 'user_id', 'penggunaId');
    }
}
