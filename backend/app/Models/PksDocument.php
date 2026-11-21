<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PksDocument extends Model
{
    use \App\Traits\LogsSystemActivity;

    protected $table = 'pks';
    protected $primaryKey = 'pks_id';

    protected $fillable = [
        'pks_id',
        'pksId',
        'mitra_id',
        'mitraId',
        'pengguna_id',
        'penggunaId',
        'bidang',
        'jenis_pks',
        'nomor_pks',
        'ringkasan_pks',
        'tanggal_mulai',
        'tanggal_berakhir',
        'url_berkas',
        'status_persetujuan',
        'status_pks',
        'catatan_revisi',
        'url_surat_penghentian',
        'alasan_penghentian',
        'tanggal_penghentian',
    ];

    protected $appends = [
        'pksId',
        'mitraId',
        'penggunaId',
        'statusPks',
        'urlSuratPenghentian',
        'alasanPenghentian',
        'tanggalPenghentian',
    ];

    /**
     * Accessor untuk Perhitungan Otomatis Status PKS (BUG-03)
     * Menghitung status masa berlaku: Aktif, Segera Berakhir (H-30), Berakhir, atau Tidak Dilanjutkan
     */
    public function getStatusPksAttribute()
    {
        $rawStatus = $this->attributes['status_pks'] ?? null;

        if ($rawStatus === 'Tidak Dilanjutkan') {
            return 'Tidak Dilanjutkan';
        }

        $statusPers = $this->attributes['status_persetujuan'] ?? '';
        if ($statusPers !== 'Disetujui' && $rawStatus !== 'Aktif') {
            return $rawStatus ?: 'Draf';
        }

        $tanggalBerakhir = $this->attributes['tanggal_berakhir'] ?? null;
        if (!$tanggalBerakhir) {
            return $rawStatus ?: 'Aktif';
        }

        $now = now()->startOfDay();
        $end = \Carbon\Carbon::parse($tanggalBerakhir)->startOfDay();

        if ($now->gt($end)) {
            return 'Berakhir';
        }

        $diffDays = $now->diffInDays($end, false);
        if ($diffDays <= 30 && $diffDays >= 0) {
            return 'Segera Berakhir';
        }

        return 'Aktif';
    }

    public function getUrlSuratPenghentianAttribute()
    {
        return $this->attributes['url_surat_penghentian'] ?? null;
    }

    public function getAlasanPenghentianAttribute()
    {
        return $this->attributes['alasan_penghentian'] ?? null;
    }

    public function getTanggalPenghentianAttribute()
    {
        return $this->attributes['tanggal_penghentian'] ?? null;
    }

    public function getPksIdAttribute()
    {
        return $this->attributes['pks_id'] ?? $this->attributes['pksId'] ?? null;
    }

    public function getMitraIdAttribute()
    {
        return $this->attributes['mitra_id'] ?? $this->attributes['mitraId'] ?? null;
    }

    public function getPenggunaIdAttribute()
    {
        return $this->attributes['pengguna_id'] ?? $this->attributes['penggunaId'] ?? null;
    }

    public function setMitraIdAttribute($value)
    {
        $this->attributes['mitra_id'] = $value;
    }

    public function setPenggunaIdAttribute($value)
    {
        $this->attributes['pengguna_id'] = $value;
    }

    public function setPksIdAttribute($value)
    {
        $this->attributes['pks_id'] = $value;
    }

    public function mitra()
    {
        return $this->belongsTo(Mitra::class, 'mitra_id', 'mitra_id');
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }

    public function riwayat_persetujuan()
    {
        return $this->hasMany(PksApproval::class, 'pks_id', 'pks_id')->orderBy('created_at', 'asc');
    }

    public function adendums()
    {
        return $this->hasMany(Adendum::class, 'pks_id', 'pks_id');
    }

    public function adendum()
    {
        return $this->hasMany(Adendum::class, 'pks_id', 'pks_id');
    }
}
