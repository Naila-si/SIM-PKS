<?php

$isProduction = env('APP_ENV') === 'production';

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Pengaturan CORS untuk membatasi origin yang diizinkan mengakses API SIM-PKS.
    | Pada lingkungan production, pola regex localhost dinonaktifkan secara ketat
    | (bernilai array kosong) dan hanya domain resmi dari FRONTEND_URL dan APP_URL
    | yang diizinkan mengakses sistem backend.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_filter(
        $isProduction
            ? [
                env('FRONTEND_URL'),
                env('APP_URL'),
            ]
            : [
                env('FRONTEND_URL', 'http://localhost:5173'),
                env('APP_URL', 'http://localhost'),
                'http://localhost:3000',
                'http://localhost:5173',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:5173',
            ]
    ))),

    'allowed_origins_patterns' => $isProduction
        ? []
        : [
            '#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',
        ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 86400,

    'supports_credentials' => true,

];
