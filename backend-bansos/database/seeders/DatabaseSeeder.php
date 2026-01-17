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
        // 1. BUAT AKUN ADMIN
        User::create([
            'name' => 'Admin Bansos',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password123'),
            'foto' => 'kades.jpeg',
            'role' => 'admin'
        ]);

        // 2. BUAT AKUN KEPALA DESA
        User::create([
            'name' => 'Bapak Kades',
            'email' => 'kades@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'kades'
        ]);

        // 3. BUAT DATA PROGRAM BANTUAN
        $programs = [
            [
                'nama_program' => 'BLT Dana Desa',
                'deskripsi' => 'Bantuan tunai untuk warga kurang mampu.',
                'maksimal_penghasilan' => 1000000,
                'minimal_tanggungan' => 2
            ],
            [
                'nama_program' => 'PKH',
                'deskripsi' => 'Program Keluarga Harapan untuk pendidikan & kesehatan.',
                'maksimal_penghasilan' => 800000,
                'minimal_tanggungan' => 3
            ],
        ];

        $programIds = [];
        foreach ($programs as $p) {
            $programIds[] = DB::table('program_bantuans')->insertGetId(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 4. DATA WARGA MASSAL (10 ORANG)
        $daftarWarga = [
            ['nama' => 'Budi Santoso', 'nik' => '3301010101010001', 'status' => 'Lolos', 'job' => 'Buruh'],
            ['nama' => 'Siti Aminah', 'nik' => '3301010101010002', 'status' => 'Proses', 'job' => 'IRT'],
            ['nama' => 'Ahmad Hidayat', 'nik' => '3301010101010003', 'status' => 'Ditolak', 'job' => 'Petani'],
            ['nama' => 'Dewi Lestari', 'nik' => '3301010101010004', 'status' => 'Lolos', 'job' => 'Pedagang'],
            ['nama' => 'Eko Prasetyo', 'nik' => '3301010101010005', 'status' => 'Proses', 'job' => 'Wiraswasta'],
            ['nama' => 'Rina Wijaya', 'nik' => '3301010101010006', 'status' => 'Lolos', 'job' => 'Guru Honorer'],
            ['nama' => 'Andi Permana', 'nik' => '3301010101010007', 'status' => 'Proses', 'job' => 'Sopir'],
            ['nama' => 'Maya Saputri', 'nik' => '3301010101010008', 'status' => 'Ditolak', 'job' => 'Buruh Cuci'],
            ['nama' => 'Rizky Pratama', 'nik' => '3301010101010009', 'status' => 'Lolos', 'job' => 'Karyawan'],
            ['nama' => 'Siska Amelia', 'nik' => '3301010101010010', 'status' => 'Proses', 'job' => 'Penjahit'],
        ];

        foreach ($daftarWarga as $w) {
            // Buat akun login
            $user = User::create([
                'name' => $w['nama'],
                'email' => strtolower(str_replace(' ', '', $w['nama'])) . '@gmail.com',
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
                'pekerjaan' => $w['job'],
                'alamat' => 'Desa Makmur',
                'nomor_hp' => '0812' . rand(11111111, 99999999),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Hubungkan ke tabel 'seleksis'
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