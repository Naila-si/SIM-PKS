<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemLog;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $token = $request->bearerToken();
        
        // Ekstrak ID Pengguna dari format token statis 'sim-pks-token-{id}-{time}'
        $userId = null;
        if ($token && preg_match('/sim-pks-token-(\d+)-/', $token, $matches)) {
            $userId = $matches[1];
        }
        
        $user = $userId ? \App\Models\Pengguna::find($userId) : null;
        
        // Strict RBAC: Hanya admin_utama yang boleh mengakses log sistem global ini
        if (!$user || $user->role !== 'admin_utama') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Fitur ini khusus untuk Administrator Utama.'
            ], 403);
        }

        $query = SystemLog::with(['user:penggunaId,nama,role,bidang']);

        // Additional filters from request (Optional)
        if ($request->has('bidang') && $request->bidang !== 'Semua Bidang') {
            $query->where('bidang', $request->bidang);
        }
        if ($request->has('action') && $request->action !== 'Semua Aksi') {
            $query->where('action', $request->action);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
