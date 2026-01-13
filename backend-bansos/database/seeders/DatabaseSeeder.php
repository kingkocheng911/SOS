<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Pengajuan;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Akun Admin
        User::create([
            'name' => 'Admin Bansos',
            'email' => 'admin@bansos.com',
            'password' => Hash::make('password123'),
            'role' => 'admin'
        ]);

        // 2. Buat Akun Kepala Desa (BARU)
        User::create([
            'name' => 'Bapak Kepala Desa',
            'email' => 'kades@bansos.com',
            'password' => Hash::make('password123'),
            'role' => 'kades' // Role khusus untuk approval
        ]);

        // 3. Buat Akun User Biasa (Warga)
        User::create([
        'name' => 'Budi Santoso',
        'email' => 'budi@bansos.com',
        'password' => Hash::make('password123'),
        'role' => 'warga',
        'nik' => '1234567890123456' // <--- NIK INI KUNCINYA
    ]);

        Pengajuan::create([
        'nik_warga' => '1234567890123456', // <--- HARUS SAMA PERSIS DENGAN NIK BUDI
        'nama_warga' => 'Budi Santoso',
        'jenis_bansos' => 'BLT Dana Desa',
        'status' => 'approved' // Ceritanya sudah disetujui
    ]);
    }
}