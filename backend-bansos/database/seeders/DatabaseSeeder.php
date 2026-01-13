<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
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
            'name' => 'Warga Contoh',
            'email' => 'warga@bansos.com',
            'password' => Hash::make('password123'),
            'role' => 'user'
        ]);
    }
}