<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.simpks' => \App\Http\Middleware\AutentikasiSimPks::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Mencegah kebocoran struktur query, credentials, dan detail database internal pada respon API (SEC-CONF-01)
        $exceptions->render(function (\Illuminate\Database\QueryException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 'gagal',
                    'message' => 'Terjadi kesalahan pemrosesan basis data.',
                    'pesan' => 'Terjadi kesalahan pemrosesan basis data.'
                ], 500);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 'gagal',
                    'message' => 'Data yang diminta tidak ditemukan.',
                    'pesan' => 'Data yang diminta tidak ditemukan.'
                ], 404);
            }
        });
    })->create();
