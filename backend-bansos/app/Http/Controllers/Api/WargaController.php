<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warga;
use Illuminate\Support\Facades\Validator;

class WargaController extends Controller
{
    // 1. Ambil semua data warga (READ)
    public function index()
    {
        $data = Warga::latest()->get();
        return response()->json([
            'status' => true,
            'message' => 'Daftar data warga',
            'data' => $data
        ]);
    }

    // 2. Simpan data warga baru (CREATE)
    public function store(Request $request)
    {
        // A. Validasi Input
        $validator = Validator::make($request->all(), [
            'nama' => 'required',
            'nik'  => 'required|numeric', // Pastikan NIK angka
            // 'kk' => 'required', // Aktifkan jika KK wajib diisi
        ]);

        // B. Cek jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'pesan' => 'Data tidak valid',
                'error' => $validator->errors()
            ], 422);
        }

        // C. Proses Simpan ke Database
        try {
            // PENTING: Menggunakan $request->all() agar semua kolom 
            // (nama, nik, kk, alamat, dll) tersimpan otomatis.
            // Syarat: Di Model Warga harus ada 'protected $guarded = [];'
            $warga = Warga::create($request->all());

            return response()->json([
                'status' => true,
                'pesan' => 'Data berhasil disimpan',
                'data' => $warga
            ], 201);

        } catch (\Exception $e) {
            // D. Tangkap Error Database (Misal: Kolom kurang, duplikat, dll)
            return response()->json([
                'status' => false,
                'pesan' => 'Gagal menyimpan ke database',
                'error_detail' => $e->getMessage() // Ini akan memberitahu error aslinya
            ], 500);
        }
    }
}