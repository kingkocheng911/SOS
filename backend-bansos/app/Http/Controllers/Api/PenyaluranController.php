<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Penyaluran;
use App\Models\Seleksi;
use App\Models\Warga;
use App\Models\User;
use App\Models\ProgramBantuan;

class PenyaluranController extends Controller
{
    public function index()
    {
        try {
            // --- 1. DATA UNTUK DROPDOWN (PILIH WARGA) ---
            // Kita ambil data SELEKSI yang statusnya 2 (Sesuai gambar database terbaru)
            // Dan pastikan belum pernah disalurkan (doesntHave penyaluran)
            $calonPenerima = Seleksi::where('status', 2) 
                            ->doesntHave('penyaluran')
                            ->orderBy('created_at', 'desc')
                            ->get();

            $siapSalurClean = [];

            foreach ($calonPenerima as $s) {
    // Cari Warga
    $warga = Warga::find($s->warga_id);
    if (!$warga) continue; 

    $user = User::find($warga->user_id);
    $nama_final = $user ? $user->name : ($warga->nama ?? 'Warga Tanpa Nama');
    $nik_final  = $user ? $user->nik : '-';

    // --- BAGIAN DEBUGGING PROGRAM (UBAH INI) ---
    // Kita cek isi kolom program_bantuan_id
    $id_program = $s->program_bantuan_id; 
    
    // Coba cari datanya
    $program = ProgramBantuan::find($id_program);
    
    // LOGIKA PENGECEKAN:
    if ($id_program == null) {
        $nama_program = "ERROR: ID di Database Kosong (NULL)";
    } elseif (!$program) {
        $nama_program = "ERROR: ID $id_program Tidak Ditemukan di Tabel Program";
    } else {
        $nama_program = $program->nama_program;
    }
    // -------------------------------------------

    $siapSalurClean[] = [
        'id' => $s->id,
        'warga_id' => $warga->id,
        'program_bantuan_id' => $id_program, // kirim ID-nya juga buat dicek
        'warga' => [
            'id' => $warga->id,
            'nama' => $nama_final,
            'nik' => $nik_final,
        ],
        'program_bantuan' => [
            'nama_program' => $nama_program // <--- Hasil Debug akan muncul disini
        ],
        'label_combo' => $nama_final . ' - ' . $nama_program
    ];
}

            // --- 2. DATA RIWAYAT PENYALURAN (TABEL BAWAH) ---
            $rawRiwayat = Penyaluran::latest()->get();
            $riwayatClean = [];

            foreach ($rawRiwayat as $p) {
                $seleksi = Seleksi::find($p->seleksi_id);
                if (!$seleksi) continue;

                $warga = Warga::find($seleksi->warga_id);
                $user = $warga ? User::find($warga->user_id) : null;
                $namaWarga = $user ? $user->name : ($warga->nama ?? 'Data Hilang');
                
                $program = ProgramBantuan::find($seleksi->program_bantuan_id);
                if (!$program && isset($seleksi->program_id)) {
                    $program = ProgramBantuan::find($seleksi->program_id);
                }

                $riwayatClean[] = [
                    'id' => $p->id,
                    'tanggal_penyaluran' => $p->tanggal_penyaluran,
                    'keterangan' => $p->keterangan,
                    'status_penyaluran' => 'Selesai',
                    'seleksi' => [
                        'warga' => ['nama' => $namaWarga],
                        'programBantuan' => ['nama_program' => $program ? $program->nama_program : '-']
                    ]
                ];
            }

            // --- RESPON JSON KE FRONTEND ---
            return response()->json([
                'status' => true,
                'message' => 'Berhasil memuat data',
                'siap_salur' => $siapSalurClean, // Data Dropdown
                'riwayat' => $riwayatClean,      // Data Tabel
                'data' => $riwayatClean          // Backup
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // 1. Validasi menerima ARRAY (banyak ID)
        $request->validate([
            'seleksi_ids' => 'required|array',        // Wajib Array
            'seleksi_ids.*' => 'exists:seleksis,id',  // Pastikan ID valid
            'tanggal_penyaluran' => 'required|date',
            'keterangan' => 'required|string',
        ]);

        try {
            // Gunakan Transaksi Database (Agar kalau 1 gagal, semua batal)
            \DB::beginTransaction();

            $insertedCount = 0;

            // 2. Looping setiap ID yang dichecklist
            foreach ($request->seleksi_ids as $id) {
                // Simpan Penyaluran
                Penyaluran::create([
                    'seleksi_id' => $id,
                    'tanggal_penyaluran' => $request->tanggal_penyaluran,
                    'keterangan' => $request->keterangan,
                ]);

                // Update Status Seleksi jadi 4 (Sudah Salur)
                $seleksi = Seleksi::find($id);
                if ($seleksi) {
                    $seleksi->update(['status' => 4]);
                }
                
                $insertedCount++;
            }

            \DB::commit(); // Simpan permanen jika sukses semua

            return response()->json([
                'status' => true,
                'message' => "Berhasil menyalurkan bantuan ke $insertedCount warga!",
            ]);

        } catch (\Exception $e) {
            \DB::rollback(); // Batalkan semua jika ada error
            return response()->json([
                'status' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }
}