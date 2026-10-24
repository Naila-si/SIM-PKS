<?php

namespace App\Models;

/**
 * Model AdendumPersetujuan (Tabel 'adendum_persetujuan')
 * Alias modern untuk AdendumApproval
 */
class AdendumPersetujuan extends AdendumApproval
{
    protected $table = 'adendum_persetujuan';
    protected $primaryKey = 'persetujuan_id';
}
