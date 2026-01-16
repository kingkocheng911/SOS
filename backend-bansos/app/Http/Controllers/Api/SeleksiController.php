<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seleksi;
use App\Models\User;
use App\Models\Warga; // TAMBAHKAN MODEL INI
use App\Models\ProgramBantuan; 
use App\Models\Notifikasi; // TAMBAHKAN MODEL INI
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SeleksiController extends Controller
{
    /**
     * 1. DAFTAR DATA SELEKSI (HISTORY)
     */
    public function index()
    {
        $data = Seleksi::with(['warga', 'programBantuan'])
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'status' => true,
            'message' => 'Daftar seleksi berhasil diambil',
            'data' => $data
        ]);
    }

    /**
     * 2. FITUR SELEKSI OTOMATIS
     */
    public function filterKandidat(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'program_id' => 'required|exists:program_bantuans,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Program ID tidak valid'], 400);
            }

            $programId = $request->program_id;
            $program = ProgramBantuan::find($programId);

            if (!$program) {
                return response()->json(['status' => false, 'message' => 'Program tidak ditemukan'], 404);
            }

            $query = User::where('role', 'warga');

            if (!empty($program->maksimal_penghasilan)) {
                $query->where('gaji', '<=', $program->maksimal_penghasilan);
            }

            if (!empty($program->minimal_tanggungan)) {
                $query->where('tanggungan', '>=', $program->minimal_tanggungan);
            }

            $query->whereDoesntHave('seleksi', function($q) use ($programId) {
                $q->where('program_bantuan_id', $programId);
            });

            $kandidat = $query->get();

            $kandidat->transform(function($item) {
                $item->nama = $item->name; 
                return $item;
            });

            return response()->json([
                'status' => true,
                'message' => 'Filter otomatis berhasil dijalankan',
                'data' => $kandidat
            ]);

        } catch (\Exception $e) {
            Log::error("Error Filter: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan server.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 3. SIMPAN PENDAFTARAN (STORE)
     * Ditambahkan: Notifikasi pendaftaran berhasil dikirim.
     */
    public function store(Request $request)
    {
        $programId = $request->program_bantuan_id ?? $request->program_id;
        $request->merge(['program_bantuan_id' => $programId]);

        $validator = Validator::make($request->all(), [
            'warga_id'           => 'required|exists:users,id',
            'program_bantuan_id' => 'required|exists:program_bantuans,id', 
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            // PERBAIKAN LOGIKA: Cari data di tabel wargas berdasarkan user_id yang dikirim
            $wargaRecord = Warga::where('user_id', $request->warga_id)->first();

            if (!$wargaRecord) {
                return response()->json([
                    'status' => false,
                    'message' => 'Profil Warga tidak ditemukan. Silakan isi profil terlebih dahulu.'
                ], 422);
            }

            // Gunakan ID dari tabel wargas untuk pengecekan seleksi
            $cek = Seleksi::where('warga_id', $wargaRecord->id)
                          ->where('program_bantuan_id', $programId)
                          ->first();

            if ($cek) {
                return response()->json([
                    'status' => false, 
                    'message' => 'Warga ini sudah terdaftar di program ini.'
                ], 409);
            }

            $seleksi = Seleksi::create([
                'warga_id'           => $wargaRecord->id, // Menggunakan ID asli dari tabel wargas
                'program_bantuan_id' => $programId, 
                'status'             => 1,
            ]);

            // --- TAMBAHKAN NOTIFIKASI DISINI ---
            $namaProgram = ProgramBantuan::find($programId)->nama_program ?? 'Program Bantuan';
            Notifikasi::create([
                'user_id' => $request->warga_id, // Tetap gunakan user_id agar notif muncul di akun warga
                'pesan'   => "Pendaftaran Anda untuk " . $namaProgram . " telah berhasil dikirim dan sedang menunggu tinjauan Kades.",
                'is_read' => false
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Warga berhasil didaftarkan.',
                'data'    => $seleksi
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 4. UPDATE STATUS
     * Ditambahkan: Notifikasi perubahan status (Disetujui/Ditolak).
     */
    public function update(Request $request, $id)
    {
        // Gunakan with untuk mengambil info program agar bisa dimasukkan ke pesan notif
        $seleksi = Seleksi::with('programBantuan')->find($id);

        if (!$seleksi) {
            return response()->json(['message' => 'Data seleksi tidak ditemukan.'], 404);
        }

        try {
            $seleksi->update([
                'status' => $request->status 
            ]);

            // --- LOGIKA NOTIFIKASI OTOMATIS ---
            $statusTeks = $request->status == 2 ? 'DISETUJUI' : 'DITOLAK';
            $namaProgram = $seleksi->programBantuan->nama_program ?? 'Program Bantuan';
            
            // Cari user_id dari tabel warga untuk mengirim notif
            $warga = Warga::find($seleksi->warga_id);
            if ($warga) {
                Notifikasi::create([
                    'user_id' => $warga->user_id,
                    'pesan'   => "Pembaruan: Pengajuan Anda untuk " . $namaProgram . " telah " . $statusTeks . " oleh Kepala Desa.",
                    'is_read' => false
                ]);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Status seleksi diperbarui dan notifikasi dikirim!',
                'data'    => $seleksi
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 5. HAPUS DATA
     */
    public function destroy($id)
    {
        $seleksi = Seleksi::find($id);
        if ($seleksi) {
            $seleksi->delete();
            return response()->json(['status' => true, 'message' => 'Data seleksi dihapus']);
        }
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }
}