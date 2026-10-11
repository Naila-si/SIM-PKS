<?php

namespace App\Services;

use App\Models\PksDocument;
use App\Models\Adendum;

class NomorDokumenService
{
    /**
     * Generate the next shared sequential document number: P/{nomor_urut}/SP/{tahun}
     */
    public static function generateNextNomor($year = null)
    {
        $year = $year ?: date('Y');
        $pattern = "/^P\/(\d+)\/SP\/{$year}$/";
        $maxUrut = 0;

        // Check in PKS documents
        $pksNumbers = PksDocument::whereNotNull('nomor_pks')->pluck('nomor_pks');
        foreach ($pksNumbers as $num) {
            if (preg_match($pattern, trim($num), $matches)) {
                $maxUrut = max($maxUrut, (int)$matches[1]);
            }
        }

        // Check in Adendums
        $adendumNumbers = Adendum::whereNotNull('nomorAdendum')->pluck('nomorAdendum');
        foreach ($adendumNumbers as $num) {
            if (preg_match($pattern, trim($num), $matches)) {
                $maxUrut = max($maxUrut, (int)$matches[1]);
            }
        }

        $nextUrut = $maxUrut + 1;
        return "P/{$nextUrut}/SP/{$year}";
    }
}
