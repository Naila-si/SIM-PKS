<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemLog;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Strict RBAC: Hanya admin_utama / admin yang boleh mengakses log sistem global ini
        if (!$user || !in_array($user->role, ['admin_utama', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Fitur ini khusus untuk Administrator Utama.'
            ], 403);
        }

        $query = SystemLog::with(['user:pengguna_id,nama,role,bidang']);

        // Additional filters from request (Optional)
        if ($request->has('bidang') && $request->bidang !== 'Semua Bidang') {
            $query->where('bidang', $request->bidang);
        }
        $action = $request->input('aksi', $request->input('action'));
        if ($action && $action !== 'Semua Aksi') {
            $query->where(function ($q) use ($action) {
                $q->where('aksi', $action)->orWhere('aksi', 'like', "%{$action}%");
            });
        }

        // Dukungan Pagination jika diminta (PERF-01)
        if ($request->filled('per_page') || $request->filled('page')) {
            $perPage = max(1, min((int) $request->input('per_page', 25), 100));
            $paginated = $query->orderBy('created_at', 'desc')->paginate($perPage);
            return response()->json([
                'success' => true,
                'data' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ]
            ]);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
