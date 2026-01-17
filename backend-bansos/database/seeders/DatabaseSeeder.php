<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Program Bantuan di tabel 'program_bantuans'
        $programs = [
            [
                'nama_program' => 'BLT Dana Desa',
                'deskripsi' => 'Bantuan tunai untuk warga terdampak ekonomi.',
                'maksimal_penghasilan' => 1000000,
                'minimal_tanggungan' => 2
            ],
            [
                'nama_program' => 'PKH (Program Keluarga Harapan)',
                'deskripsi' => 'Bantuan untuk kesehatan dan pendidikan keluarga.',
                'maksimal_penghasilan' => 800000,
                'minimal_tanggungan' => 3
            ],
            [
                'nama_program' => 'Bantuan Sembako',
                'deskripsi' => 'Penyaluran bahan pangan pokok setiap bulan.',
                'maksimal_penghasilan' => 1500000,
                'minimal_tanggungan' => 1
            ],
        ];

        $programIds = [];
        foreach ($programs as $p) {
            $programIds[] = DB::table('program_bantuans')->insertGetId(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 2. Data Warga Massal
        $daftarWarga = [
            ['nama' => 'Budi Santoso', 'nik' => '3301010101010001', 'status' => 'Lolos', 'pekerjaan' => 'Buruh'],
            ['nama' => 'Siti Aminah', 'nik' => '3301010101010002', 'status' => 'Proses', 'pekerjaan' => 'Ibu Rumah Tangga'],
            ['nama' => 'Ahmad Hidayat', 'nik' => '3301010101010003', 'status' => 'Ditolak', 'pekerjaan' => 'Petani'],
            ['nama' => 'Dewi Lestari', 'nik' => '3301010101010004', 'status' => 'Lolos', 'pekerjaan' => 'Pedagang'],
        ];

        foreach ($daftarWarga as $index => $w) {
            // Buat akun login
            $user = User::create([
                'name' => $w['nama'],
                'email' => strtolower(str_replace(' ', '', $w['nama'])) . '@example.com',
                'password' => Hash::make('password123'),
                'role' => 'warga'
            ]);

            // Masukkan ke tabel 'wargas'
            $wargaId = DB::table('wargas')->insertGetId([
                'user_id' => $user->id,
                'nama' => $w['nama'],
                'nik' => $w['nik'],
                'foto' => 'default.jpg',
                'status_seleksi' => $w['status'],
                'gaji' => rand(500000, 1500000),
                'tanggungan' => rand(1, 5),
                'pekerjaan' => $w['pekerjaan'],
                'alamat' => 'Desa Makmur No. ' . ($index + 1),
                'nomor_hp' => '0812' . rand(10000000, 99999999),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Hubungkan ke tabel 'seleksis' (Relasi Warga & Program)
            DB::table('seleksis')->insert([
                'warga_id' => $wargaId,
                'program_bantuan_id' => $programIds[array_rand($programIds)],
                'status' => $w['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}