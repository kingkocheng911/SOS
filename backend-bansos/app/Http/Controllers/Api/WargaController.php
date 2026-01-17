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
            $hp_dari_user = $user->no_telp ?? $user->no_hp ?? $user->phone ?? $user->nomor_hp ?? null;
            $alamat_dari_user = $user->alamat;

            $laporan[] = [
                'nama' => $user->name,
                'sumber_hp_di_user' => $hp_dari_user ? $hp_dari_user : 'KOSONG (Cek tabel users!)',
                'sumber_alamat_di_user' => $alamat_dari_user
            ];

            Warga::updateOrCreate(
                ['user_id' => $user->id], 
                [
                    'nama'       => $user->name,
                    'nik'        => $user->nik ?? '000000000000',
                    'alamat'     => $alamat_dari_user ?? 'Alamat Belum Diisi',
                    'nomor_hp'   => $hp_dari_user ?? '08...', 
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
            'debug_data_sumber' => $laporan 
        ]);
    }

    public function index()
    {
        // MODIFIKASI: Mengambil data dari tabel User tapi menyertakan data dari tabel Warga (termasuk foto)
        $data = User::where('role', 'warga')->with('warga')->latest()->get();
        
        $data->transform(function($item) {
            $item->nama = $item->name;
            // Ambil foto dari tabel wargas jika ada
            $item->foto_profile = $item->warga && $item->warga->foto 
            ? asset('uploads/profil/' . $item->warga->foto) . '?v=' . time() 
            : null;
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
        // MODIFIKASI: Tambahkan with('warga') agar foto terbawa
        $warga = User::where('role', 'warga')->with('warga')->find($id);

        if (!$warga) {
            return response()->json(['status' => false, 'message' => 'Data warga tidak ditemukan'], 404);
        }

        $warga->nama = $warga->name;
        $warga->foto_profile = $warga->warga && $warga->warga->foto 
        ? asset('uploads/profil/' . $warga->warga->foto) . '?v=' . time() 
        : null;
        
        return response()->json([
            'status' => true,
            'data' => $warga
        ]);
    }

    public function store(Request $request)
    {
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
            $result = DB::transaction(function () use ($request) {
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

                Warga::create([
                    'user_id'        => $user->id,
                    'nama'           => $user->name,
                    'nik'            => $user->nik,
                    'gaji'           => $user->gaji,
                    'tanggungan'     => $user->tanggungan,
                    'alamat'         => $request->alamat, 
                    'nomor_hp'       => $request->no_telp, 
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

        $alamatBaru = $warga->alamat;
        if($request->dukuh && $request->rt && $request->rw) {
             $alamatBaru = "Dukuh " . $request->dukuh . ", RT " . $request->rt . ", RW " . $request->rw;
        } elseif ($request->alamat) {
             $alamatBaru = $request->alamat;
        }

        $warga->update([
            'name'       => $request->nama ?? $warga->name,
            'nik'        => $request->nik ?? $warga->nik,
            'pekerjaan'  => $request->pekerjaan ?? $warga->pekerjaan,
            'gaji'       => $request->gaji ?? $warga->gaji,
            'tanggungan' => $request->tanggungan ?? $warga->tanggungan,
            'no_telp'    => $request->no_telp ?? $warga->no_telp,
            'alamat'     => $alamatBaru,
        ]);

        Warga::updateOrCreate(
            ['user_id' => $warga->id],
            [
                'nama'       => $warga->name,
                'nik'        => $warga->nik,
                'gaji'       => $warga->gaji,
                'tanggungan' => $warga->tanggungan,
                'alamat'     => $warga->alamat,   
                'nomor_hp'   => $warga->no_telp   
            ]
        );

        return response()->json(['status' => true, 'message' => 'Data berhasil diperbarui']);
    }
    
    public function destroy($id)
    {
        $warga = User::find($id);
        if (!$warga) return response()->json(['status' => false, 'message' => 'Warga tidak ditemukan'], 404);

        $warga->delete();
        Warga::where('user_id', $id)->delete();
        
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
            $currentUser->alamat = $request->alamat;
            $currentUser->no_telp = $request->no_telp;
            
            if ($request->has('gaji'))       $currentUser->gaji = $request->gaji;
            if ($request->has('pekerjaan'))  $currentUser->pekerjaan = $request->pekerjaan;
            if ($request->has('tanggungan')) $currentUser->tanggungan = $request->tanggungan;

            // Update Foto ke tabel Warga agar Tabel Warga punya datanya
            $warga = Warga::where('user_id', $currentUser->id)->first();
            
            if ($request->hasFile('foto')) {
                $path = public_path('uploads/profil');
                if (!File::isDirectory($path)) File::makeDirectory($path, 0777, true, true);
                
                // Hapus foto lama di tabel warga jika ada
                if ($warga && $warga->foto && File::exists($path . '/' . $warga->foto)) {
                    File::delete($path . '/' . $warga->foto);
                }

                $file = $request->file('foto');
                $filename = time() . '_' . $currentUser->id . '.' . $file->getClientOriginalExtension();
                $file->move($path, $filename);
                
                // Simpan nama file ke tabel Warga
                if($warga) {
                    $warga->foto = $filename;
                    $warga->save();
                }
            }

            $currentUser->save(); 

            Warga::updateOrCreate(
                ['user_id' => $currentUser->id], 
                [
                    'nama'       => $currentUser->name,
                    'nik'        => $currentUser->nik,
                    'gaji'       => $currentUser->gaji ?? 0,
                    'tanggungan' => $currentUser->tanggungan ?? 0,
                    'alamat'     => $currentUser->alamat,    
                    'nomor_hp'   => $currentUser->no_telp    
                ]
            );

            return response()->json([
                'status' => true,
                'message' => 'Profil berhasil diperbarui!',
                'user' => $currentUser
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function checkStatus(Request $request)
    {
        $user = Auth::user();
        $warga = Warga::where('user_id', $user->id)->first();

        if (!$warga) {
            return response()->json([
                'status' => 'belum_daftar',
                'message' => 'Anda belum terdaftar sebagai warga.',
                'data' => null
            ]);
        }

        return response()->json([
            'status' => 'sudah_daftar',
            'data' => [
                'nama'              => $warga->nama,
                'status_seleksi'    => $warga->status_seleksi ?? 'Belum Terdaftar',
                'tanggal_pengajuan' => $warga->created_at->format('Y-m-d'), 
            ]
        ]);
    }
}