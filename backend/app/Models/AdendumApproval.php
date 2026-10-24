<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdendumApproval extends Model
{
    protected $table = 'adendum_persetujuan';
    protected $primaryKey = 'persetujuan_id';

    protected $fillable = [
        'persetujuan_id',
        'approvalId',
        'adendum_id',
        'adendumId',
        'pengguna_id',
        'penggunaId',
        'user_id',
        'status_aksi',
        'catatan'
    ];

    protected $appends = [
        'approvalId',
        'adendumId',
        'penggunaId',
    ];

    public function getPersetujuanIdAttribute()
    {
        return $this->attributes['persetujuan_id'] ?? null;
    }

    public function setApprovalIdAttribute($value)
    {
        $this->attributes['persetujuan_id'] = $value;
    }

    public function setAdendumIdAttribute($value)
    {
        $this->attributes['adendum_id'] = $value;
    }

    public function setPenggunaIdAttribute($value)
    {
        $this->attributes['pengguna_id'] = $value;
    }

    public function setUserIdAttribute($value)
    {
        $this->attributes['pengguna_id'] = $value;
    }

    public function getApprovalIdAttribute()
    {
        return $this->attributes['persetujuan_id'] ?? $this->attributes['approvalId'] ?? null;
    }

    public function getAdendumIdAttribute()
    {
        return $this->attributes['adendum_id'] ?? $this->attributes['adendumId'] ?? null;
    }

    public function getPenggunaIdAttribute()
    {
        return $this->attributes['pengguna_id'] ?? $this->attributes['penggunaId'] ?? null;
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    public function user()
    {
        return $this->pengguna();
    }

    public function adendum()
    {
        return $this->belongsTo(Adendum::class, 'adendum_id', 'adendum_id');
    }
}
