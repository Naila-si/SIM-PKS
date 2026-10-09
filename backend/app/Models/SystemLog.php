<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $fillable = [
        'user_id',
        'bidang',
        'action',
        'loggable_type',
        'loggable_id',
        'description',
        'old_values',
        'new_values',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(Pengguna::class, 'user_id', 'penggunaId');
    }

    public function loggable()
    {
        return $this->morphTo();
    }
}
