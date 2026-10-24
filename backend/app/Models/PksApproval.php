<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Pengguna;

class PksApproval extends Model
{
    use \App\Traits\LogsSystemActivity;

    protected $table = 'pks_persetujuan';
    protected $primaryKey = 'persetujuan_id';

    protected $fillable = [
        'persetujuan_id',
        'id',
        'pks_id',
        'pksId',
        'pengguna_id',
        'user_id',
        'status_aksi',
        'catatan',
    ];

    protected $appends = [
        'user_id',
        'id',
    ];

    public function getPersetujuanIdAttribute()
    {
        return $this->attributes['persetujuan_id'] ?? null;
    }

    public function setUserIdAttribute($value)
    {
        $this->attributes['pengguna_id'] = $value;
    }

    public function setPksIdAttribute($value)
    {
        $this->attributes['pks_id'] = $value;
    }

    public function getUserIdAttribute()
    {
        return $this->attributes['pengguna_id'] ?? $this->attributes['user_id'] ?? null;
    }

    public function getIdAttribute()
    {
        return $this->attributes['persetujuan_id'] ?? $this->attributes['id'] ?? null;
    }

    public function pks()
    {
        return $this->belongsTo(PksDocument::class, 'pks_id', 'pks_id');
    }

    public function pksDocument()
    {
        return $this->pks();
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    public function user()
    {
        return $this->pengguna();
    }
}
