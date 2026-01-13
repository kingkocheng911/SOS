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
            'password'  => 'required|string|min:8', // Perlu field password_confirmation
            'nik'       => 'required|numeric|digits:16|unique:users', // <--- WAJIB: NIK 16 digit & unik
        ]);

        // Jika validasi gagal
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Buat User Baru
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password), // Enkripsi password
            'role'      => 'warga', // <--- PENTING: Saya ubah jadi 'warga' agar sesuai Frontend
            'nik'       => $request->nik // <--- Simpan NIK ke database
        ]);

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
}