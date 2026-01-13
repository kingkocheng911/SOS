<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Penyaluran;
use App\Models\Seleksi;

class PenyaluranController extends Controller
{
    public function index()
    {
        // 1. Ambil Data Riwayat
        $riwayat = Penyaluran::with(['seleksi.warga', 'seleksi.programBantuan'])
                    ->latest()
                    ->get();

        // 2. Ambil Data untuk Dropdown (Data yang SIAP DISALURKAN)
        // PERBAIKAN: Menggunakan whereIn untuk mengantisipasi perbedaan huruf besar/kecil di database
        $siapSalur = Seleksi::with(['warga', 'programBantuan'])
                    ->whereIn('status', ['Disetujui', 'disetujui', 'DISETUJUI']) 
                    // Opsional: Tambahkan ini untuk memastikan data yang diambil belum ada di tabel penyaluran (double check)
                    ->doesntHave('penyaluran') 
                    ->get();

        // DEBUGGING: Jika dropdown masih kosong, coba 'uncomment' baris di bawah ini 
        // dan 'comment' query $siapSalur di atas untuk melihat apakah data masuk tanpa filter.
        // $siapSalur = Seleksi::with(['warga', 'programBantuan'])->get();

        return response()->json([
            'status' => true,
            'riwayat' => $riwayat,
            'siap_salur' => $siapSalur
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'seleksi_id' => 'required',
            'tanggal_penyaluran' => 'required',
            'keterangan' => 'required',
        ]);

        try {
            // 1. Simpan ke Tabel Penyaluran
            $penyaluran = Penyaluran::create([
                'seleksi_id' => $request->seleksi_id,
                'tanggal_penyaluran' => $request->tanggal_penyaluran,
                'keterangan' => $request->keterangan,
            ]);

            // 2. Update Status di Tabel Seleksi jadi 'Disalurkan'
            // Supaya nama warga hilang dari dropdown setelah disalurkan
            $seleksi = Seleksi::find($request->seleksi_id);
            if ($seleksi) {
                $seleksi->update(['status' => 'Disalurkan']);
            }

            return response()->json([
                'status' => true,
                'message' => 'Berhasil disalurkan!',
                'data' => $penyaluran
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }
}