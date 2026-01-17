<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // --- FITUR REGISTER (DENGAN NIK) ---
    public function register(Request $request)
    {
        // 1. Validasi Input
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|email|max:255|unique:users', // Email harus unik
            'password'  => 'required|string|min:8', 
            'nik'       => 'required|numeric|digits:16', // Hapus unique:users agar bisa klaim data admin
        ]);

        // Jika validasi gagal
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Logika Cek NIK (Klaim Akun vs Akun Baru)
        $existingUser = User::where('nik', $request->nik)->first();

        if ($existingUser) {
            // Jika NIK sudah ada dan sudah punya email, berarti akun sudah aktif
            if ($existingUser->email != null) {
                return response()->json([
                    'nik' => ['NIK ini sudah terdaftar dan memiliki akun aktif.']
                ], 422);
            }

            // JIKA NIK ADA (Inputan Admin), maka kita UPDATE data yang sudah ada
            $existingUser->update([
                'name'      => $request->name,
                'email'     => $request->email,
                'password'  => Hash::make($request->password),
                'role'      => 'warga',
            ]);
            $user = $existingUser;
        } else {
            // JIKA NIK BELUM ADA, Buat User Baru
            $user = User::create([
                'name'      => $request->name,
                'email'     => $request->email,
                'password'  => Hash::make($request->password), 
                'role'      => 'warga', 
                'nik'       => $request->nik 
            ]);
        }

        // 3. Kembalikan Respon Sukses
        return response()->json([
            'status' => true,
            'message' => 'Registrasi Berhasil! Silakan Login.',
            'data'    => $user
        ], 201);
    }

    // --- FITUR LOGIN ---
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Cek Kredensial (Email & Password cocok gak?)
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'status' => false,
                'message' => 'Email atau Password salah'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // BUAT TOKEN RAHASIA
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login sukses',
            'data' => [
                'user' => $user, // Data user (termasuk NIK & role) akan terkirim ke frontend
                'token' => $token 
            ]
        ]);
    }

    // --- FITUR LOGOUT ---
    public function logout(Request $request)
    {
        // Hapus token yang sedang dipakai
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    public function getDataWilayah()
    {
        $dataWilayah = [
            [
                "nama_dukuh" => "Dukuh Krajan",
                "list_rw" => [
                    [
                        "rw" => "01",
                        "list_rt" => ["01", "02", "03", "04"]
                    ],
                    [
                        "rw" => "02",
                        "list_rt" => ["05", "06", "07"]
                    ]
                ]
            ],
            [
                "nama_dukuh" => "Dukuh Sukamaju",
                "list_rw" => [
                    [
                        "rw" => "03",
                        "list_rt" => ["08", "09", "10"]
                    ],
                    [
                        "rw" => "04",
                        "list_rt" => ["11", "12"]
                    ]
                ]
            ]
        ];

        return response()->json($dataWilayah);
    }
}