<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;       // Model untuk Master Data Warga
use App\Models\Pengajuan;  // Model untuk Data Transaksi Pengajuan Bansos
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class WargaController extends Controller
{
    // =================================================================
    // BAGIAN 1: ADMIN - KELOLA DATA WARGA (MASTER DATA)
    // =================================================================

    // 1. Ambil semua data warga
    public function index()
    {
        $data = User::where('role', 'warga')->latest()->get();

        // --- TAMBAHAN KECIL DISINI ---
        // Kita ubah 'name' menjadi 'nama' agar terbaca di React
        $data->transform(function($item) {
            $item->nama = $item->name; // Menyalin value name ke key nama
            return $item;
        });
        // -----------------------------
        
        return response()->json([
            'status' => true,
            'message' => 'Daftar master data warga',
            'data' => $data
        ]);
    }

    // 2. Simpan data warga manual (Admin)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string', 
            'nik'  => 'required|numeric|unique:users,nik',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'pesan' => 'Data tidak valid',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->nama,           
                'nik' => $request->nik,
                'role' => 'warga',                  
                'password' => Hash::make('123456'), 
            ]);

            return response()->json([
                'status' => true,
                'pesan' => 'Warga berhasil didaftarkan. Password default: 123456',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'pesan' => 'Gagal menyimpan data warga',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    // =================================================================
    // BAGIAN 2: WARGA - FITUR APLIKASI
    // =================================================================

    // 3. CEK STATUS BANSOS
    public function cekStatusBansos()
    {
        $user = Auth::user(); 
        $pengajuan = Pengajuan::where('user_id', $user->id)->latest()->first();

        if ($pengajuan) {
            return response()->json([
                'status' => true,
                'pesan' => 'Data pengajuan ditemukan',
                'data' => $pengajuan 
            ]);
        } else {
            return response()->json([
                'status' => false,
                'pesan' => 'Belum ada pengajuan'
            ]);
        }
    }

    // 4. TAMBAH PENGAJUAN BARU
    public function tambahPengajuan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis_bansos' => 'required',
            'alasan'       => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'pesan' => 'Mohon lengkapi formulir pengajuan',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $pengajuan = Pengajuan::create([
                'user_id'       => Auth::id(), 
                'jenis_bantuan' => $request->jenis_bansos, 
                'alasan'        => $request->alasan,
                'status'        => 'pending', 
            ]);

            return response()->json([
                'status' => true,
                'pesan' => 'Pengajuan berhasil dikirim! Menunggu seleksi admin.',
                'data'  => $pengajuan
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'pesan' => 'Gagal mengirim pengajuan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 5. UPDATE PROFIL
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $currentUser = User::findOrFail($user->id); 

        $validator = Validator::make($request->all(), [
            'alamat'  => 'required|string',
            'no_telp' => 'required|string',
            'foto'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $currentUser->alamat = $request->alamat;
            $currentUser->no_telp = $request->no_telp;

            if ($request->hasFile('foto')) {
                $path = public_path('uploads/profil');
                
                if (!File::isDirectory($path)) {
                    File::makeDirectory($path, 0777, true, true);
                }

                if ($currentUser->foto && File::exists($path . '/' . $currentUser->foto)) {
                    File::delete($path . '/' . $currentUser->foto);
                }

                $file = $request->file('foto');
                $filename = time() . '_' . $currentUser->nik . '.' . $file->getClientOriginalExtension();
                $file->move($path, $filename);
                $currentUser->foto = $filename;
            }

            $currentUser->save();

            return response()->json([
                'status' => true,
                'message' => 'Profil berhasil diperbarui!',
                'user' => $currentUser
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server Error saat update profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}