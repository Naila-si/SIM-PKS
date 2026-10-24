<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PksTemplate extends Model
{
    use \App\Traits\LogsSystemActivity;

    protected $table = 'pks_templates';
    protected $primaryKey = 'template_id';

    protected $fillable = [
        'template_id',
        'templateId',
        'pengguna_id',
        'penggunaId',
        'nama_template',
        'kategori_template',
        'bidang',
        'jenis_pks',
        'versi_template',
        'status_template',
        'url_berkas',
        'diperbarui_oleh',
    ];

    protected $appends = [
        'templateId',
        'penggunaId',
    ];

    public function setTemplateIdAttribute($value)
    {
        $this->attributes['template_id'] = $value;
    }

    public function setPenggunaIdAttribute($value)
    {
        $this->attributes['pengguna_id'] = $value;
    }

    public function getTemplateIdAttribute()
    {
        return $this->attributes['template_id'] ?? $this->attributes['templateId'] ?? null;
    }

    public function getPenggunaIdAttribute()
    {
        return $this->attributes['pengguna_id'] ?? $this->attributes['penggunaId'] ?? null;
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    public function pengubah()
    {
        return $this->belongsTo(Pengguna::class, 'diperbarui_oleh', 'pengguna_id');
    }
}
