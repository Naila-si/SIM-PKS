<?php

namespace App\Models;

/**
 * Model LogSistem (Tabel 'log_sistem')
 * Alias modern untuk SystemLog
 */
class LogSistem extends SystemLog
{
    protected $table = 'log_sistem';
    protected $primaryKey = 'log_id';
}
