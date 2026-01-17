<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seleksi;
use App\Models\User;
use App\Models\Warga; 
use App\Models\ProgramBantuan; 
use App\Models\Notifikasi; 
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SeleksiController extends Controller
{
    /**
     * 1. DAFTAR DATA SELEKSI (PERSETUJUAN KADES)
     * Menggunakan pengecekan manual agar tidak crash jika ada data relasi yang hilang.
     */
    public function index()
    {
        try {
            $seleksis = Seleksi::all();
            $result = [];

            foreach ($seleksis as $s) {
                // Ambil data profil warga
                $warga = Warga::find($s->warga_id);
                if (!$warga) continue;

                // Ambil data user terkait
                $user = User::find($warga->user_id);
                if (!$user || $user->role !== 'warga') continue;

                // Ambil data program
                $program = ProgramBantuan::find($s->program_bantuan_id);

                $result[] = [
                    'id' => $s->id,
                    'nama_warga' => $user->name ?? 'Anonim',
                    'nik' => $user->nik ?? '-',
                    'nama_program' => $program->nama_program ?? 'Program Dihapus',
                    'status' => $s->status,
                    'created_at' => $s->created_at ? $s->created_at->format('d/m/Y') : '-'
                ];
            }

            return response()->json([
                'status' => true,
                'message' => 'Berhasil mengambil data seleksi',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error("Seleksi Index Error: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal memuat data: ' . $e->getMessage()
            ], 500);
        }

        $result[] = [
            'id' => $s->id,
            'nama_warga' => $user->name ?? 'User Tidak Ditemukan',
            'nik' => $user->nik ?? '-',
            'nama_program' => $program->nama_program ?? 'Program Dihapus',
            'status' => $s->status,
            'created_at' => $s->created_at ? $s->created_at->format('Y-m-d') : null 
        ];
    }

    /**
     * 2. FILTER KANDIDAT OTOMATIS (Sisi Admin)
     * MEMPERBAIKI ERROR 500: Mengganti query relasi yang bermasalah dengan logic yang lebih stabil.
     */
    public function filterKandidat(Request $request)
    {
        try {
            $program = ProgramBantuan::find($request->program_id);
            if (!$program) {
                return response()->json(['status' => false, 'message' => 'Program tidak ditemukan'], 404);
            }
            
            // Ambil semua user role warga
            $query = User::where('role', 'warga');

            // Filter Gaji (Pastikan kolom gaji ada di tabel users)
            if ($program->maksimal_penghasilan > 0) {
                $query->where('gaji', '<=', $program->maksimal_penghasilan);
            }

            // Filter Tanggungan (Pastikan kolom tanggungan ada di tabel users)
            if ($program->minimal_tanggungan > 0) {
                $query->where('tanggungan', '>=', $program->minimal_tanggungan);
            }

            $users = $query->get();
            $result = [];

            foreach ($users as $u) {
                // Cari data profil warga untuk memastikan mereka terdaftar sebagai warga aktif
                $warga = Warga::where('user_id', $u->id)->first();
                if (!$warga) continue;

                // Cek apakah warga ini sudah pernah mendaftar di program ini sebelumnya
                $sudahDaftar = Seleksi::where('warga_id', $warga->id)
                                     ->where('program_bantuan_id', $program->id)
                                     ->exists();

                if (!$sudahDaftar) {
                    $result[] = [
                        'id' => $u->id,
                        'nama' => $u->name,
                        'nik' => $u->nik,
                        'pekerjaan' => $u->pekerjaan ?? '-',
                        'gaji' => $u->gaji ?? 0
                    ];
                }
            }

            return response()->json([
                'status' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error("Filter Kandidat Error: " . $e->getMessage());
            return response()->json([
                'status' => false, 
                'message' => 'Kesalahan Server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 3. SIMPAN PENDAFTARAN (STORE)
     * VERSI TERBARU: Fleksibel menangkap ID User maupun ID Warga untuk mencegah Error 422.
     */
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'warga_id' => 'required',
        'program_id' => 'required'
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    try {
        // Cari profil warga berdasarkan ID User (karena React kirim user_id)
        $warga = Warga::where('user_id', $request->warga_id)->first();
        
        if (!$warga) {
            // Jika tidak ketemu, coba cari berdasarkan ID Warga langsung
            $warga = Warga::find($request->warga_id);
        }
        
        if (!$warga) {
            return response()->json(['status' => false, 'message' => 'Profil Warga tidak ditemukan.'], 422);
        }

        // SIMPAN: Hapus bagian 'alasan' agar tidak error SQL
        $seleksi = Seleksi::updateOrCreate(
            [
                'warga_id' => $warga->id, 
                'program_bantuan_id' => $request->program_id
            ],
            [
                'status' => 1 // Hanya status saja, karena kolom 'alasan' tidak ada di DB
            ]
        );

        return response()->json(['status' => true, 'message' => 'Berhasil mendaftarkan warga'], 201);

    } catch (\Exception $e) {
        return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
    }
}
    /**
     * 4. UPDATE STATUS (DISETUJUI/DITOLAK)
     */
    public function update(Request $request, $id)
    {
        try {
            $seleksi = Seleksi::findOrFail($id);
            $seleksi->update(['status' => $request->status]);

            // Kirim Notifikasi ke Warga
            $statusTeks = $request->status == 2 ? 'DISETUJUI' : 'DITOLAK';
            $warga = Warga::find($seleksi->warga_id);
            
            if ($warga) {
                Notifikasi::create([
                    'user_id' => $warga->user_id,
                    'pesan' => "Update Bantuan: Pengajuan Anda telah " . $statusTeks . " oleh Kepala Desa.",
                    'is_read' => false
                ]);
            }

            return response()->json(['status' => true, 'message' => 'Status berhasil diperbarui']);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 5. HAPUS DATA
     */
    public function destroy($id)
    {
        try {
            Seleksi::destroy($id);
            return response()->json(['status' => true, 'message' => 'Data berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }
}