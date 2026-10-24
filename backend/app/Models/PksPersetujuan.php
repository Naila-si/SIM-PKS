<?php

namespace App\Models;

/**
 * Model PksPersetujuan (Tabel 'pks_persetujuan')
 * Alias modern untuk PksApproval
 */
class PksPersetujuan extends PksApproval
{
    protected $table = 'pks_persetujuan';
    protected $primaryKey = 'persetujuan_id';
}
