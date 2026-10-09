<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsSystemActivity;

class Adendum extends Model
{
    use HasFactory, LogsSystemActivity;

    protected $primaryKey = 'adendumId';

    protected $fillable = [
        'pks_document_id',
        'nomorAdendum',
        'ruangLingkupPerubahan',
        'tanggalMulai',
        'tanggalBerakhir',
        'statusPersetujuan',
        'urlBerkas',
        'catatanRevisi',
        'pembuat_id'
    ];

    public function pksDocument()
    {
        return $this->belongsTo(PksDocument::class, 'pks_document_id', 'pksId');
    }

    public function pembuat()
    {
        return $this->belongsTo(Pengguna::class, 'pembuat_id', 'penggunaId');
    }
}
