<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $table = 'log_sistem';
    protected $primaryKey = 'log_id';

    protected $fillable = [
        'log_id',
        'id',
        'pengguna_id',
        'user_id',
        'bidang',
        'aksi',
        'action',
        'loggable_type',
        'loggable_id',
        'keterangan',
        'description',
        'old_values',
        'new_values',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    protected $appends = [
        'id',
        'action',
        'description',
        'user_id',
    ];

    public function getLogIdAttribute()
    {
        return $this->attributes['log_id'] ?? null;
    }

    public function setUserIdAttribute($value)
    {
        $this->attributes['pengguna_id'] = $value;
    }

    public function setActionAttribute($value)
    {
        $this->attributes['aksi'] = $value;
    }

    public function setDescriptionAttribute($value)
    {
        $this->attributes['keterangan'] = $value;
    }

    public function getIdAttribute()
    {
        return $this->attributes['log_id'] ?? $this->attributes['id'] ?? null;
    }

    public function getActionAttribute()
    {
        return $this->attributes['aksi'] ?? $this->attributes['action'] ?? null;
    }

    public function getDescriptionAttribute()
    {
        return $this->attributes['keterangan'] ?? $this->attributes['description'] ?? null;
    }

    public function getUserIdAttribute()
    {
        return $this->attributes['pengguna_id'] ?? $this->attributes['user_id'] ?? null;
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    public function user()
    {
        return $this->pengguna();
    }

    public function loggable()
    {
        return $this->morphTo();
    }
}
