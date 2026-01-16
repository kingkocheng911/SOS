<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Warga;
use App\Models\Penyaluran; 
use App\Models\Seleksi; 
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB; 

class WargaController extends Controller
{
    // =================================================================
    // BAGIAN 1: ADMIN - KELOLA DATA WARGA
    // =================================================================

   public function syncAllWarga()
    {
        $users = User::where('role', 'warga')->get();
        
        $laporan = []; // Untuk menampung hasil debug

        foreach ($users as $user) {
            // Coba deteksi nama kolom HP yang benar di tabel users
            // Kadang programmer menamakannya: no_telp, no_hp, phone, atau nomor_hp
            $hp_dari_user = $user->no_telp ?? $user->no_hp ?? $user->phone ?? $user->nomor_hp ?? null;
            
            // Cek data alamat
            $alamat_dari_user = $user->alamat;

            // Simpan ke array laporan untuk dicek nanti
            $laporan[] = [
                'nama' => $user->name,
                'sumber_hp_di_user' => $hp_dari_user ? $hp_dari_user : 'KOSONG (Cek tabel users!)',
                'sumber_alamat_di_user' => $alamat_dari_user
            ];

            // LOGIKA UPDATE / CREATE (FORCE REPLACE)
            Warga::updateOrCreate(
                ['user_id' => $user->id], // Kunci pencarian
                [
                    'nama'       => $user->name,
                    'nik'        => $user->nik ?? '000000000000',
                    'alamat'     => $alamat_dari_user ?? 'Alamat Belum Diisi',
                    'nomor_hp'   => $hp_dari_user ?? '08...', // Isi default jika kosong
                    'gaji'       => $user->gaji ?? 0,
                    'tanggungan' => $user->tanggungan ?? 0,
                    'pekerjaan'  => $user->pekerjaan ?? '-',
                    'status_seleksi' => 'Belum Terdaftar' 
                ]
            );
        }

        return response()->json([
            'status' => true,
            'message' => 'Sinkronisasi Paksa Selesai.',
            'debug_data_sumber' => $laporan // <--- Perhatikan bagian ini di browser nanti
        ]);
    }

    public function index()
    {
        $data = User::where('role', 'warga')->latest()->get();
        // Transformasi data agar nama field sesuai frontend
        $data->transform(function($item) {
            $item->nama = $item->name;
            return $item;
        });
        
        return response()->json([
            'status' => true,
            'message' => 'Daftar master data warga',
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $warga = User::where('role', 'warga')->find($id);

        if (!$warga) {
            return response()->json(['status' => false, 'message' => 'Data warga tidak ditemukan'], 404);
        }

        $warga->nama = $warga->name;

        return response()->json([
            'status' => true,
            'data' => $warga
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi
        $validator = Validator::make($request->all(), [
            'nama'       => 'required|string', 
            'nik'        => 'required|numeric|unique:users,nik',
            'gaji'       => 'required|numeric',
            'pekerjaan'  => 'required|string',    
            'tanggungan' => 'required|numeric',
            'alamat'     => 'required|string',    
            'no_telp'    => 'required|string',    
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'pesan' => 'Data tidak lengkap', 'error' => $validator->errors()], 422);
        }

        try {
            // 2. Gunakan DB Transaction agar aman
            $result = DB::transaction(function () use ($request) {
                // A. Simpan ke tabel USERS
                $user = User::create([
                    'name'       => $request->nama,           
                    'nik'        => $request->nik,
                    'gaji'       => $request->gaji,        
                    'pekerjaan'  => $request->pekerjaan,
                    'tanggungan' => $request->tanggungan,  
                    'alamat'     => $request->alamat,
                    'no_telp'    => $request->no_telp,
                    'role'       => 'warga',                  
                    'password'   => Hash::make('123456'), 
                ]);

                // B. Simpan ke tabel WARGAS (PERBAIKAN: Masukkan Alamat & HP)
                Warga::create([
                    'user_id'        => $user->id,
                    'nama'           => $user->name,
                    'nik'            => $user->nik,
                    'gaji'           => $user->gaji,
                    'tanggungan'     => $user->tanggungan,
                    'alamat'         => $request->alamat, // <--- Perbaikan
                    'nomor_hp'       => $request->no_telp, // <--- Perbaikan (sesuai input request)
                    'status_seleksi' => 'Belum Terdaftar' 
                ]);

                return $user; 
            });

            return response()->json(['status' => true, 'pesan' => 'Warga berhasil didaftarkan!', 'data' => $result], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'pesan' => 'Gagal menyimpan data', 'error_detail' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $warga = User::find($id);
        if (!$warga) return response()->json(['status' => false, 'message' => 'Warga tidak ditemukan'], 404);

        // Logic alamat custom 
        $alamatBaru = $warga->alamat;
        if($request->dukuh && $request->rt && $request->rw) {
             $alamatBaru = "Dukuh " . $request->dukuh . ", RT " . $request->rt . ", RW " . $request->rw;
        } elseif ($request->alamat) {
             $alamatBaru = $request->alamat;
        }

        // Update User
        $warga->update([
            'name'       => $request->nama ?? $warga->name,
            'nik'        => $request->nik ?? $warga->nik,
            'pekerjaan'  => $request->pekerjaan ?? $warga->pekerjaan,
            'gaji'       => $request->gaji ?? $warga->gaji,
            'tanggungan' => $request->tanggungan ?? $warga->tanggungan,
            'no_telp'    => $request->no_telp ?? $warga->no_telp,
            'alamat'     => $alamatBaru,
        ]);

        // Sinkronisasi ke tabel Wargas juga (PERBAIKAN: Tambah Alamat & HP)
        Warga::updateOrCreate(
            ['user_id' => $warga->id],
            [
                'nama'       => $warga->name,
                'nik'        => $warga->nik,
                'gaji'       => $warga->gaji,
                'tanggungan' => $warga->tanggungan,
                'alamat'     => $warga->alamat,   // <--- Perbaikan
                'nomor_hp'   => $warga->no_telp   // <--- Perbaikan
            ]
        );

        return response()->json(['status' => true, 'message' => 'Data berhasil diperbarui']);
    }
    
    public function destroy($id)
    {
        $warga = User::find($id);
        if (!$warga) return response()->json(['status' => false, 'message' => 'Warga tidak ditemukan'], 404);

        $warga->delete();
        // Opsional: Hapus juga di tabel wargas jika mau hard delete
        // Warga::where('user_id', $id)->delete();
        
        return response()->json(['status' => true, 'message' => 'Warga berhasil dihapus']);
    }

    // =================================================================
    // BAGIAN 2: WARGA - FITUR APLIKASI
    // =================================================================

    public function cekStatusBansos()
    {
        try {
            $user = Auth::user(); 
            if (!$user) return response()->json(['status' => false, 'pesan' => 'User tidak valid'], 401);

            // 1. Cek Penyaluran (Pencairan)
            $penyaluran = Penyaluran::whereHas('seleksi', function($query) use ($user) {
                $query->whereHas('warga', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })->with(['seleksi.programBantuan'])->latest()->first();

            if ($penyaluran) {
                $namaProgram = $penyaluran->seleksi->programBantuan->nama_program ?? 'Bansos Tunai';
                return response()->json([
                    'status' => true, 'tahap' => 'disalurkan',
                    'pesan' => 'Bantuan telah disalurkan pada ' . date('d M Y', strtotime($penyaluran->created_at)),
                    'data' => $penyaluran, 'program' => $namaProgram
                ]);
            }

            // 2. Cek Seleksi
            $wargaRecord = Warga::where('user_id', $user->id)->first();
            $wargaId = $wargaRecord ? $wargaRecord->id : null;

            $seleksi = Seleksi::where(function($query) use ($wargaId, $user) {
                            if ($wargaId) $query->where('warga_id', $wargaId);
                            $query->orWhere('warga_id', $user->id);
                        })
                        ->with('programBantuan')
                        ->latest()
                        ->first();

            if ($seleksi) {
                $namaProgram = $seleksi->programBantuan->nama_program ?? 'Bansos';
                
                // Status 2 = Disetujui, 3 = Ditolak
                if ($seleksi->status == 2) { 
                    return response()->json([
                        'status' => true, 'tahap' => 'lolos',
                        'pesan' => 'Selamat! Anda dinyatakan LOLOS seleksi. Menunggu jadwal penyaluran.',
                        'data' => $seleksi, 'program' => $namaProgram
                    ]);
                } elseif ($seleksi->status == 3) {
                    return response()->json([
                        'status' => true, 'tahap' => 'gagal',
                        'pesan' => 'Mohon maaf, pengajuan Anda belum disetujui.',
                        'data' => $seleksi, 'program' => $namaProgram
                    ]);
                } else {
                     return response()->json([
                        'status' => true, 'tahap' => 'pending',
                        'pesan' => 'Pengajuan Anda sedang direview oleh petugas.',
                        'data' => $seleksi, 'program' => $namaProgram
                    ]);
                }
            }

            // Jika benar-benar tidak ada data
            return response()->json([
                'status' => false, 'tahap' => 'kosong',
                'pesan' => 'Belum ada data bantuan atau pengajuan.', 'program' => '-'
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'pesan' => 'Error', 'error_detail' => $e->getMessage()], 200); 
        }
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $currentUser = User::find($user->id); 

        if (!$currentUser) return response()->json(['message' => 'User tidak ditemukan'], 404);

        $validator = Validator::make($request->all(), [
            'alamat'     => 'required|string',
            'no_telp'    => 'required|string',
            'gaji'       => 'nullable|numeric',  
            'pekerjaan'  => 'nullable|string', 
            'tanggungan' => 'nullable|numeric',
            'foto'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) return response()->json(['status' => false, 'errors' => $validator->errors()], 422);

        try {
            // Update User
            $currentUser->alamat = $request->alamat;
            $currentUser->no_telp = $request->no_telp;
            
            if ($request->has('gaji'))       $currentUser->gaji = $request->gaji;
            if ($request->has('pekerjaan'))  $currentUser->pekerjaan = $request->pekerjaan;
            if ($request->has('tanggungan')) $currentUser->tanggungan = $request->tanggungan;

            if ($request->hasFile('foto')) {
                $path = public_path('uploads/profil');
                if (!File::isDirectory($path)) File::makeDirectory($path, 0777, true, true);
                // Hapus foto lama jika ada
                if ($currentUser->foto && File::exists($path . '/' . $currentUser->foto)) {
                    File::delete($path . '/' . $currentUser->foto);
                }
                $file = $request->file('foto');
                $filename = time() . '_' . $currentUser->id . '.' . $file->getClientOriginalExtension();
                $file->move($path, $filename);
                $currentUser->foto = $filename;
            }

            $currentUser->save(); 

            // Update/Create Warga (Sync Data)
            Warga::updateOrCreate(
                ['user_id' => $currentUser->id], 
                [
                    'nama'       => $currentUser->name,
                    'nik'        => $currentUser->nik,
                    'gaji'       => $currentUser->gaji ?? 0,
                    'tanggungan' => $currentUser->tanggungan ?? 0,
                    'alamat'     => $currentUser->alamat,    // <--- Perbaikan: Sync Alamat
                    'nomor_hp'   => $currentUser->no_telp    // <--- Perbaikan: Sync HP
                ]
            );

            return response()->json([
                'status' => true,
                'message' => 'Profil berhasil diperbarui dan disinkronkan!',
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

    // =================================================================
    // BAGIAN BARU: KHUSUS DASHBOARD (KOTAK MERAH)
    // =================================================================
    public function checkStatus(Request $request)
    {
        // 1. Ambil user yang sedang login
        $user = Auth::user();

        // 2. Ambil data dari tabel 'wargas'
        $warga = Warga::where('user_id', $user->id)->first();

        // 3. Jika data warga belum ada
        if (!$warga) {
            return response()->json([
                'status' => 'belum_daftar',
                'message' => 'Anda belum terdaftar sebagai warga.',
                'data' => null
            ]);
        }

        // 4. Kirim data Status
        return response()->json([
            'status' => 'sudah_daftar',
            'data' => [
                'nama'              => $warga->nama,
                'status_seleksi'    => $warga->status_seleksi ?? 'Belum Terdaftar',
                // Tanggal pengajuan diambil dari created_at warga untuk saat ini
                'tanggal_pengajuan' => $warga->created_at->format('Y-m-d'), 
            ]
        ]);
    }
}