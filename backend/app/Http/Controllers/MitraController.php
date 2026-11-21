<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use Illuminate\Http\Request;

class MitraController extends Controller
{
    public function index(Request $request)
    {
        $inReviewStatuses = [
            'Menunggu Penyerahan',
            'Pemeriksaan Pengelola',
            'Disetujui Pengelola',
            'Pemeriksaan Kabag',
            'Disetujui Kabag',
            'Pemeriksaan Pimpinan'
        ];

        $query = Mitra::withCount([
            'pksDocuments as totalPks',
            'pksDocuments as pksAktif' => function ($q) {
                $q->where('status_pks', 'Aktif');
            },
            'pksDocuments as pksBerakhir' => function ($q) {
                $q->where('status_pks', 'Berakhir');
            },
            'pksDocuments as pksSedangPersetujuan' => function ($q) use ($inReviewStatuses) {
                $q->where(function ($sub) use ($inReviewStatuses) {
                    $sub->whereIn('status_persetujuan', $inReviewStatuses)
                        ->orWhereHas('adendums', function ($aq) use ($inReviewStatuses) {
                            $aq->whereIn('status_persetujuan', $inReviewStatuses);
                        });
                });
            }
        ]);

        if ($request->filled('bidang')) {
            $query->where('bidang', $request->bidang);
        }

        // Dukungan Pagination jika diminta (PERF-01)
        if ($request->filled('per_page') || $request->filled('page')) {
            $perPage = max(1, min((int) $request->input('per_page', 20), 100));
            $paginated = $query->paginate($perPage);
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

        return response()->json($query->get());
    }

    public function show($id)
    {
        $inReviewStatuses = [
            'Menunggu Penyerahan',
            'Pemeriksaan Pengelola',
            'Disetujui Pengelola',
            'Pemeriksaan Kabag',
            'Disetujui Kabag',
            'Pemeriksaan Pimpinan'
        ];

        $mitra = Mitra::withCount([
            'pksDocuments as totalPks',
            'pksDocuments as pksAktif' => function ($query) {
                $query->where('status_pks', 'Aktif');
            },
            'pksDocuments as pksBerakhir' => function ($query) {
                $query->where('status_pks', 'Berakhir');
            },
            'pksDocuments as pksSedangPersetujuan' => function ($q) use ($inReviewStatuses) {
                $q->where(function ($sub) use ($inReviewStatuses) {
                    $sub->whereIn('status_persetujuan', $inReviewStatuses)
                        ->orWhereHas('adendums', function ($aq) use ($inReviewStatuses) {
                            $aq->whereIn('status_persetujuan', $inReviewStatuses);
                        });
                });
            }
        ])->find($id);

        if (!$mitra) return response()->json(['message' => 'Mitra tidak ditemukan'], 404);
        return response()->json($mitra);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_mitra' => 'required|string|max:255',
            'bidang' => 'nullable|string|max:100',
            'nama_pengelola' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:150',
            'no_hp_pengelola' => 'required|string|max:255',
            'email_pengelola' => 'nullable|email|max:255',
            'alamat_mitra' => 'nullable|string',
            'status_mitra' => 'nullable|string|max:50',
        ]);

        if (!isset($validated['status_mitra'])) {
            $validated['status_mitra'] = 'Aktif';
        }

        $mitra = Mitra::create($validated);
        return response()->json($mitra, 201);
    }

    public function update(Request $request, $id)
    {
        $mitra = Mitra::find($id);
        if (!$mitra) return response()->json(['message' => 'Mitra tidak ditemukan'], 404);

        // Validasi: Jika sedang ada draf PKS/Adendum dalam proses persetujuan aktif, data perusahaan tidak boleh diubah
        if ($request->hasAny(['nama_mitra', 'bidang', 'nama_pengelola', 'jabatan', 'no_hp_pengelola', 'email_pengelola', 'alamat_mitra'])) {
            $inReviewStatuses = [
                'Menunggu Penyerahan',
                'Pemeriksaan Pengelola',
                'Disetujui Pengelola',
                'Pemeriksaan Kabag',
                'Disetujui Kabag',
                'Pemeriksaan Pimpinan'
            ];

            $hasInReview = $mitra->pksDocuments()
                ->where(function ($q) use ($inReviewStatuses) {
                    $q->whereIn('status_persetujuan', $inReviewStatuses)
                      ->orWhereHas('adendums', function ($aq) use ($inReviewStatuses) {
                          $aq->whereIn('status_persetujuan', $inReviewStatuses);
                      });
                })->exists();

            if ($hasInReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data perusahaan tidak dapat diubah karena draf PKS sedang dalam proses persetujuan aktif.'
                ], 422);
            }
        }

        $validated = $request->validate([
            'nama_mitra' => 'sometimes|string|max:255',
            'bidang' => 'nullable|string|max:100',
            'nama_pengelola' => 'sometimes|string|max:255',
            'jabatan' => 'nullable|string|max:150',
            'no_hp_pengelola' => 'sometimes|string|max:255',
            'email_pengelola' => 'nullable|email|max:255',
            'alamat_mitra' => 'nullable|string',
            'status_mitra' => 'sometimes|string|max:50',
        ]);

        $mitra->update($validated);
        return response()->json($mitra);
    }

    public function destroy(Request $request, $id)
    {
        $authUser = $request->user();
        if ($authUser && !in_array(strtolower($authUser->role), ['admin_utama', 'admin', 'pengelola_pks', 'pengelola'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki wewenang untuk menghapus data mitra/perusahaan.'
            ], 403);
        }

        $mitra = Mitra::find($id);
        if (!$mitra) return response()->json(['message' => 'Mitra tidak ditemukan'], 404);

        // BUG-02: Cegah penghapusan mitra jika masih memiliki dokumen PKS terkait
        if ($mitra->pksDocuments()->exists()) {
            $count = $mitra->pksDocuments()->count();
            return response()->json([
                'success' => false,
                'message' => "Mitra {$mitra->nama_mitra} tidak dapat dihapus karena masih memiliki {$count} dokumen PKS terkait. Hapus atau alihkan dokumen PKS terlebih dahulu."
            ], 422);
        }

        $mitra->delete();
        return response()->json(['success' => true, 'message' => 'Mitra berhasil dihapus']);
    }
}
