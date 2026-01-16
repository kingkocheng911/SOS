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
    try {
        // Mengambil riwayat penyaluran beserta relasi berantai
        $riwayat = Penyaluran::with(['seleksi.warga', 'seleksi.programBantuan'])
                    ->latest()
                    ->get();

        $siapSalur = Seleksi::with(['warga', 'programBantuan'])
                    ->where('status', 2) 
                    ->doesntHave('penyaluran') 
                    ->get();

        return response()->json([
            'status' => true,
            'riwayat' => $riwayat,
            'siap_salur' => $siapSalur
        ]);
    } catch (\Exception $e) {
        // Memberikan detail error ke konsol browser jika status 500
        return response()->json([
            'status' => false, 
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}
    public function store(Request $request)
    {
        $request->validate([
            'seleksi_id' => 'required',
            'tanggal_penyaluran' => 'required|date',
            'keterangan' => 'required|string',
        ]);

        try {
            // Simpan ke tabel penyaluran_bantuans
            $penyaluran = Penyaluran::create([
                'seleksi_id' => $request->seleksi_id,
                'tanggal_penyaluran' => $request->tanggal_penyaluran,
                'keterangan' => $request->keterangan,
            ]);

            // Update Status Seleksi jadi 'Disalurkan' (4)
            $seleksi = Seleksi::find($request->seleksi_id);
            if ($seleksi) {
                $seleksi->update(['status' => 4]); 
            }

            return response()->json([
                'status' => true,
                'message' => 'Bantuan berhasil disalurkan!',
                'data' => $penyaluran->load(['seleksi.warga', 'seleksi.programBantuan'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }
}