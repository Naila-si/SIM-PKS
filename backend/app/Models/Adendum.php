<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsSystemActivity;

class Adendum extends Model
{
    use HasFactory, LogsSystemActivity;

    protected $table = 'adendum';
    protected $primaryKey = 'adendum_id';

    protected $fillable = [
        'adendum_id',
        'adendumId',
        'pks_id',
        'pks_document_id',
        'nomor_adendum',
        'nomorAdendum',
        'ruang_lingkup_perubahan',
        'ruangLingkupPerubahan',
        'tanggal_mulai',
        'tanggalMulai',
        'tanggal_berakhir',
        'tanggalBerakhir',
        'status_persetujuan',
        'statusPersetujuan',
        'status_adendum',
        'statusAdendum',
        'url_berkas',
        'urlBerkas',
        'catatan_revisi',
        'catatanRevisi',
        'pengguna_id',
        'pembuat_id',
    ];

    protected $appends = [
        'adendumId',
        'pks_document_id',
        'nomorAdendum',
        'ruangLingkupPerubahan',
        'tanggalMulai',
        'tanggalBerakhir',
        'statusPersetujuan',
        'statusAdendum',
        'urlBerkas',
        'catatanRevisi',
        'pembuat_id',
    ];

    public function setPksDocumentIdAttribute($value)
    {
        $this->attributes['pks_id'] = $value;
    }

    public function setNomorAdendumAttribute($value)
    {
        $this->attributes['nomor_adendum'] = $value;
    }

    public function setRuangLingkupPerubahanAttribute($value)
    {
        $this->attributes['ruang_lingkup_perubahan'] = $value;
    }

    public function setTanggalMulaiAttribute($value)
    {
        $this->attributes['tanggal_mulai'] = $value;
    }

    public function setTanggalBerakhirAttribute($value)
    {
        $this->attributes['tanggal_berakhir'] = $value;
    }

    public function setStatusPersetujuanAttribute($value)
    {
        $this->attributes['status_persetujuan'] = $value;
    }

    public function setStatusAdendumAttribute($value)
    {
        $this->attributes['status_adendum'] = $value;
    }

    public function setUrlBerkasAttribute($value)
    {
        $this->attributes['url_berkas'] = $value;
    }

    public function setCatatanRevisiAttribute($value)
    {
        $this->attributes['catatan_revisi'] = $value;
    }

    public function setPembuatIdAttribute($value)
    {
        $this->attributes['pengguna_id'] = $value;
    }

    public function setAdendumIdAttribute($value)
    {
        $this->attributes['adendum_id'] = $value;
    }

    public function getAdendumIdAttribute()
    {
        return $this->attributes['adendum_id'] ?? $this->attributes['adendumId'] ?? null;
    }

    public function getPksDocumentIdAttribute()
    {
        return $this->attributes['pks_id'] ?? $this->attributes['pks_document_id'] ?? null;
    }

    public function getNomorAdendumAttribute()
    {
        return $this->attributes['nomor_adendum'] ?? $this->attributes['nomorAdendum'] ?? null;
    }

    public function getRuangLingkupPerubahanAttribute()
    {
        return $this->attributes['ruang_lingkup_perubahan'] ?? $this->attributes['ruangLingkupPerubahan'] ?? null;
    }

    public function getTanggalMulaiAttribute()
    {
        return $this->attributes['tanggal_mulai'] ?? $this->attributes['tanggalMulai'] ?? null;
    }

    public function getTanggalBerakhirAttribute()
    {
        return $this->attributes['tanggal_berakhir'] ?? $this->attributes['tanggalBerakhir'] ?? null;
    }

    public function getStatusPersetujuanAttribute()
    {
        return $this->attributes['status_persetujuan'] ?? $this->attributes['statusPersetujuan'] ?? null;
    }

    public function getStatusAdendumAttribute()
    {
        $status = $this->attributes['status_adendum'] ?? $this->attributes['statusAdendum'] ?? null;
        $statusPers = strtolower($this->attributes['status_persetujuan'] ?? $this->attributes['statusPersetujuan'] ?? '');

        if (in_array($statusPers, ['disetujui', 'selesai', 'draf adendum disetujui']) || $status === 'Aktif' || $status === 'Segera Berakhir' || $status === 'Berakhir') {
            if (!empty($this->attributes['tanggal_berakhir'])) {
                $today = \Carbon\Carbon::today();
                $end = \Carbon\Carbon::parse($this->attributes['tanggal_berakhir']);
                if ($end->isPast()) {
                    return 'Berakhir';
                } elseif ($today->diffInDays($end, false) <= 30) {
                    return 'Segera Berakhir';
                } else {
                    return 'Aktif';
                }
            }
            return 'Aktif';
        }

        return $status ?: 'Draf';
    }

    public function getUrlBerkasAttribute()
    {
        return $this->attributes['url_berkas'] ?? $this->attributes['urlBerkas'] ?? null;
    }

    public function getCatatanRevisiAttribute()
    {
        return $this->attributes['catatan_revisi'] ?? $this->attributes['catatanRevisi'] ?? null;
    }

    public function getPembuatIdAttribute()
    {
        return $this->attributes['pengguna_id'] ?? $this->attributes['pembuat_id'] ?? null;
    }

    public function pks()
    {
        return $this->belongsTo(PksDocument::class, 'pks_id', 'pks_id');
    }

    public function pksDocument()
    {
        return $this->pks();
    }

    public function pembuat()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    public function riwayat_persetujuan()
    {
        return $this->hasMany(AdendumApproval::class, 'adendum_id', 'adendum_id')->orderBy('created_at', 'asc');
    }
}
