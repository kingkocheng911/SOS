<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seleksi; 
use Illuminate\Support\Facades\Validator;

class SeleksiController extends Controller
{
    /**
     * Menampilkan daftar data seleksi (Gabungan Warga & Program)
     */
    public function index()
    {
        // Mengambil data seleksi beserta relasi Warga dan Program Bantuan
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
     * Admin mendaftarkan warga ke program
     */
    public function store(Request $request)
    {
        // 1. TANGANI NAMA KOLOM (Agar tidak Error 500)
        // Frontend mungkin mengirim 'program_id' ATAU 'program_bantuan_id'.
        // Kita ambil mana yang ada.
        $programId = $request->program_bantuan_id ?? $request->program_id;

        // Masukkan kembali ke request agar validator bisa membacanya
        $request->merge(['program_bantuan_id' => $programId]);

        // 2. VALIDASI
        $validator = Validator::make($request->all(), [
            'warga_id'           => 'required|exists:wargas,id',
            'program_bantuan_id' => 'required|exists:program_bantuans,id', 
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            // 3. CEK DUPLIKASI
            // Mencegah warga mendaftar 2x di program yang sama jika status belum ditolak
            $cek = Seleksi::where('warga_id', $request->warga_id)
                          ->where('program_bantuan_id', $programId)
                          ->where('status', '!=', 3) // Anggap 3 adalah 'Ditolak'
                          ->where('status', '!=', 'Ditolak') // Jaga-jaga jika pakai string
                          ->first();

            if ($cek) {
                return response()->json([
                    'status' => false,
                    'message' => 'Warga ini sudah terdaftar di program tersebut dan sedang diproses!'
                ], 409); // 409 Conflict
            }

            // 4. SIMPAN KE DATABASE
            $seleksi = Seleksi::create([
                'warga_id'           => $request->warga_id,
                'program_bantuan_id' => $programId, 
                // Default status: 1 (Menunggu). Jika DB Anda pakai String, ubah jadi 'Menunggu Persetujuan'
                'status'             => 1, 
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Berhasil didaftarkan. Menunggu persetujuan Kades.',
                'data'    => $seleksi
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Status (Untuk Tombol Setuju/Tolak Kades)
     */
    public function update(Request $request, $id)
    {
        // 1. Cari data
        $seleksi = Seleksi::find($id);

        if (!$seleksi) {
            return response()->json(['message' => 'Data Seleksi tidak ditemukan.'], 404);
        }

        // 2. Validasi input status
        $validator = Validator::make($request->all(), [
            'status' => 'required' 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 3. Update Status
            $seleksi->update([
                'status' => $request->status
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Status berhasil diperbarui!',
                'data'    => $seleksi
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus data seleksi
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