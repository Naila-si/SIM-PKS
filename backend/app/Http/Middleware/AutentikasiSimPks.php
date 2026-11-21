<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\TokenAksesPengguna;
use Illuminate\Support\Facades\Auth;

class AutentikasiSimPks
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Ambil token dari Authorization Bearer atau query parameter 'token'
        $token = $request->bearerToken();
        if (!$token && $request->filled('token')) {
            $token = $request->query('token');
        }

        if (!$token) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akses ditolak. Token autentikasi tidak ditemukan.',
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $pengguna = TokenAksesPengguna::verifikasiToken($token);

        if (!$pengguna) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Sesi login tidak sah, telah berakhir, atau akun dinonaktifkan.',
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Validasi Role jika ditentukan
        if (!empty($roles)) {
            $userRole = strtolower((string)$pengguna->role);
            $allowedRoles = array_map('strtolower', $roles);
            if (!in_array($userRole, $allowedRoles)) {
                return response()->json([
                    'status' => 'gagal',
                    'pesan' => 'Anda tidak memiliki hak akses (otorisasi) untuk fitur ini.',
                    'message' => 'Forbidden.'
                ], 403);
            }
        }

        // Ikat objek pengguna ke request dan sistem Auth Laravel
        $request->setUserResolver(fn () => $pengguna);
        Auth::setUser($pengguna);

        return $next($request);
    }
}
