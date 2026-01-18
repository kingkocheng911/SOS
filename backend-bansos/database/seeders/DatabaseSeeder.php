<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Agar id reset dari 1 lagi saat di-seed ulang
        // DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        // User::truncate();
        // DB::table('wargas')->truncate();
        // DB::table('program_bantuans')->truncate();
        // DB::table('seleksis')->truncate();
        // DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. BUAT AKUN ADMIN UTAMA
        User::create([
            'name' => 'Admin Bansos',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'created_at' => now(),
        ]);

        // 2. BUAT AKUN KEPALA DESA
        User::create([
            'name' => 'Bapak Kades',
            'email' => 'kades@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'kades', // Pastikan kolom foto nullable di database jika tidak ada file aslinya
            'foto' => 'kades.jpeg',
            'created_at' => now(),
        ]);

        // 3. DATA PROGRAM BANTUAN (DITAMBAH JADI 4 JENIS)
        $programs = [
            [
                'nama_program' => 'BLT Dana Desa',
                'deskripsi' => 'Bantuan Langsung Tunai dari anggaran dana desa untuk warga miskin ekstrem.',
                'maksimal_penghasilan' => 1000000,
                'minimal_tanggungan' => 2
            ],
            [
                'nama_program' => 'PKH (Program Keluarga Harapan)',
                'deskripsi' => 'Bantuan bersyarat untuk keluarga dengan ibu hamil, anak sekolah, atau lansia.',
                'maksimal_penghasilan' => 800000,
                'minimal_tanggungan' => 3
            ],
            [
                'nama_program' => 'BPNT (Sembako)',
                'deskripsi' => 'Bantuan Pangan Non Tunai berupa beras dan telur setiap bulan.',
                'maksimal_penghasilan' => 1500000,
                'minimal_tanggungan' => 1
            ],
            [
                'nama_program' => 'Bantuan Bedah Rumah',
                'deskripsi' => 'Bantuan renovasi untuk rumah tidak layak huni (lantai tanah/dinding bambu).',
                'maksimal_penghasilan' => 500000,
                'minimal_tanggungan' => 2
            ],
        ];

        $programIds = [];
        foreach ($programs as $p) {
            $programIds[] = DB::table('program_bantuans')->insertGetId(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 4. DATA WARGA YANG LEBIH LENGKAP & REALISTIS (20 ORANG)
        $daftarWarga = [
            // STATUS: LOLOS (Memenuhi kriteria)
            ['nama' => 'Budi Santoso', 'job' => 'Buruh Tani', 'gaji' => 600000, 'tanggungan' => 4, 'alamat' => 'Dusun Krajan RT 01/RW 01', 'status' => 'Lolos'],
            ['nama' => 'Siti Aminah', 'job' => 'Ibu Rumah Tangga', 'gaji' => 0, 'tanggungan' => 3, 'alamat' => 'Dusun Krajan RT 02/RW 01', 'status' => 'Lolos'],
            ['nama' => 'Mbah Yarto', 'job' => 'Serabutan', 'gaji' => 300000, 'tanggungan' => 1, 'alamat' => 'Dusun Legi RT 05/RW 02', 'status' => 'Lolos'],
            ['nama' => 'Dewi Lestari', 'job' => 'Pedagang Sayur', 'gaji' => 900000, 'tanggungan' => 3, 'alamat' => 'Dusun Pahing RT 03/RW 01', 'status' => 'Lolos'],
            ['nama' => 'Rina Wijaya', 'job' => 'Janda/Tidak Bekerja', 'gaji' => 200000, 'tanggungan' => 2, 'alamat' => 'Dusun Wage RT 01/RW 03', 'status' => 'Lolos'],
            ['nama' => 'Suparman', 'job' => 'Tukang Becak', 'gaji' => 750000, 'tanggungan' => 4, 'alamat' => 'Dusun Kliwon RT 04/RW 02', 'status' => 'Lolos'],
            
            // STATUS: PROSES (Menunggu Verifikasi)
            ['nama' => 'Eko Prasetyo', 'job' => 'Ojek Pangkalan', 'gaji' => 1200000, 'tanggungan' => 2, 'alamat' => 'Dusun Krajan RT 01/RW 01', 'status' => 'Proses'],
            ['nama' => 'Andi Permana', 'job' => 'Kuli Bangunan', 'gaji' => 1100000, 'tanggungan' => 3, 'alamat' => 'Dusun Legi RT 02/RW 02', 'status' => 'Proses'],
            ['nama' => 'Siska Amelia', 'job' => 'Penjahit', 'gaji' => 1000000, 'tanggungan' => 2, 'alamat' => 'Dusun Pahing RT 01/RW 01', 'status' => 'Proses'],
            ['nama' => 'Lukman Hakim', 'job' => 'Nelayan', 'gaji' => 950000, 'tanggungan' => 3, 'alamat' => 'Dusun Pesisir RT 01/RW 05', 'status' => 'Proses'],
            ['nama' => 'Nur Hayati', 'job' => 'Pedagang Gorengan', 'gaji' => 850000, 'tanggungan' => 2, 'alamat' => 'Dusun Kliwon RT 02/RW 02', 'status' => 'Proses'],
            ['nama' => 'Joko Susilo', 'job' => 'Sopir Angkot', 'gaji' => 1300000, 'tanggungan' => 4, 'alamat' => 'Dusun Wage RT 03/RW 03', 'status' => 'Proses'],

            // STATUS: DITOLAK (Gaji tinggi / PNS / Perangkat Desa)
            ['nama' => 'Ahmad Hidayat', 'job' => 'PNS Guru', 'gaji' => 4500000, 'tanggungan' => 2, 'alamat' => 'Perumahan Elit No. 1', 'status' => 'Ditolak'],
            ['nama' => 'Maya Saputri', 'job' => 'Pemilik Toko Emas', 'gaji' => 10000000, 'tanggungan' => 1, 'alamat' => 'Jalan Raya Utama No. 45', 'status' => 'Ditolak'],
            ['nama' => 'Rizky Pratama', 'job' => 'Karyawan Bank', 'gaji' => 5000000, 'tanggungan' => 1, 'alamat' => 'Dusun Krajan RT 05/RW 01', 'status' => 'Ditolak'],
            ['nama' => 'Hendra Gunawan', 'job' => 'Juragan Tanah', 'gaji' => 15000000, 'tanggungan' => 2, 'alamat' => 'Dusun Legi RT 01/RW 02', 'status' => 'Ditolak'],
            ['nama' => 'Bambang Pamungkas', 'job' => 'Perangkat Desa', 'gaji' => 2500000, 'tanggungan' => 2, 'alamat' => 'Dusun Kliwon RT 01/RW 02', 'status' => 'Ditolak'],
            
            // TAMBAHAN
            ['nama' => 'Sari Indah', 'job' => 'Peternak Ayam', 'gaji' => 1400000, 'tanggungan' => 3, 'alamat' => 'Dusun Wage RT 02/RW 03', 'status' => 'Proses'],
            ['nama' => 'Agus Dermawan', 'job' => 'Satpam Pabrik', 'gaji' => 2800000, 'tanggungan' => 2, 'alamat' => 'Dusun Pahing RT 04/RW 01', 'status' => 'Ditolak'],
            ['nama' => 'Yuni Sara', 'job' => 'Buruh Cuci', 'gaji' => 450000, 'tanggungan' => 1, 'alamat' => 'Dusun Pesisir RT 02/RW 05', 'status' => 'Lolos'],
        ];

        // Loop insert data
        $nikCounter = 1;
        foreach ($daftarWarga as $w) {
            
            // 1. Create User Login
            $email = strtolower(str_replace([' ', '.', '/'], '', $w['nama'])) . $nikCounter . '@gmail.com';
            $user = User::create([
                'name' => $w['nama'],
                'email' => $email,
                'password' => Hash::make('password123'),
                'role' => 'warga',
                'created_at' => now(),
            ]);

            // Generate NIK Dummy tapi Valid Format (16 digit)
            // 33(Prov) 74(Kota) 01(Kec) ...
            $nik = '337401' . str_pad($nikCounter, 6, '0', STR_PAD_LEFT) . '0001';

            // 2. Insert ke Tabel Warga
            $wargaId = DB::table('wargas')->insertGetId([
                'user_id' => $user->id,
                'nama' => $w['nama'],
                'nik' => $nik,
                'foto' => null, // Biarkan null, nanti frontend handle placeholder
                'status_seleksi' => $w['status'],
                'gaji' => $w['gaji'],
                'tanggungan' => $w['tanggungan'],
                'pekerjaan' => $w['job'],
                'alamat' => $w['alamat'],
                'nomor_hp' => '0812' . rand(10000000, 99999999),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Insert ke Tabel Seleksi
            // Logika: Hubungkan warga ke salah satu program secara acak agar data tersebar
            DB::table('seleksis')->insert([
                'warga_id' => $wargaId,
                'program_bantuan_id' => $programIds[array_rand($programIds)], // Random program
                'status' => $w['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $nikCounter++;
        }
    }
}