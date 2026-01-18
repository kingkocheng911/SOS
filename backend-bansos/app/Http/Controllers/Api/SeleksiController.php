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
     * LOGIKA: Hanya tampilkan data jika User, Warga, dan Program SEMUANYA ADA.
     * Jika ada yang hilang, data seleksi tersebut di-skip (tidak dimunculkan).
     */
    public function index()
    {
        try {
            $rawSeleksis = Seleksi::orderBy('created_at', 'desc')->get();
            $cleanData = [];

            foreach ($rawSeleksis as $s) {
                // 1. Cek Warga
                $warga = Warga::find($s->warga_id);
                if (!$warga) continue; 

                // 2. Cek User
                $user = User::find($warga->user_id);
                if (!$user) continue; 

                // 3. Cek Program
                $program = ProgramBantuan::find($s->program_bantuan_id);
                if (!$program && isset($s->program_id)) {
                    $program = ProgramBantuan::find($s->program_id);
                }
                if (!$program) continue; 

                // --- DATA LENGKAP UNTUK POPUP ---
                $cleanData[] = [
                    'id' => $s->id,
                    'status' => $s->status,
                    'created_at' => $s->created_at,
                    'updated_at' => $s->updated_at,
                    
                    'warga' => [
                        'id' => $warga->id,
                        'user_id' => $warga->user_id,
                        
                        // Data Dasar
                        'nama' => $user->name,
                        'nik' => $user->nik,
                        'foto' => $warga->foto,

                        // --- TAMBAHAN: DATA DETAIL UNTUK POPUP ---
                        // Pastikan nama kolom ini sesuai dengan tabel 'wargas' Anda
                        'pekerjaan' => $warga->pekerjaan ?? '-', 
                        'gaji' => $warga->gaji ?? 0,
                        'tanggungan' => $warga->tanggungan ?? 0,
                        'alamat' => $warga->alamat ?? 'Alamat belum diatur',
                        'no_hp' => $warga->no_hp ?? ($user->email ?? '-'), // Fallback ke email jika no_hp tidak ada
                        'rt' => $warga->rt ?? '-',
                        'rw' => $warga->rw ?? '-',
                    ],

                    'program_bantuan' => [
                        'id' => $program->id,
                        'nama_program' => $program->nama_program,
                        'deskripsi' => $program->deskripsi ?? '-'
                    ]
                ];
            }

            return response()->json([
                'status' => true,
                'message' => 'Berhasil mengambil data seleksi lengkap',
                'data' => $cleanData 
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * 2. FILTER KANDIDAT OTOMATIS (Sisi Admin)
     */
    public function filterKandidat(Request $request)
    {
        try {
            $program = ProgramBantuan::find($request->program_id);
            if (!$program) {
                return response()->json(['status' => false, 'message' => 'Program tidak ditemukan'], 404);
            }
            
            $query = User::where('role', 'warga');

            if ($program->maksimal_penghasilan > 0) {
                $query->where('gaji', '<=', $program->maksimal_penghasilan);
            }

            if ($program->minimal_tanggungan > 0) {
                $query->where('tanggungan', '>=', $program->minimal_tanggungan);
            }

            $users = $query->get();
            $result = [];

            foreach ($users as $u) {
                $warga = Warga::where('user_id', $u->id)->first();
                if (!$warga) continue;

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
            return response()->json([
                'status' => false, 
                'message' => 'Kesalahan Server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 3. SIMPAN PENDAFTARAN (STORE)
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
            // Cari profil warga (Cek ID User dulu, lalu ID Warga)
            $warga = Warga::where('user_id', $request->warga_id)->first();
            if (!$warga) {
                $warga = Warga::find($request->warga_id);
            }
            
            if (!$warga) {
                return response()->json(['status' => false, 'message' => 'Profil Warga tidak ditemukan.'], 422);
            }

            // SIMPAN
            // Pastikan kolom 'program_bantuan_id' sesuai DB Anda
            $seleksi = Seleksi::updateOrCreate(
                [
                    'warga_id' => $warga->id, 
                    'program_bantuan_id' => $request->program_id
                ],
                [
                    'status' => 1 
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