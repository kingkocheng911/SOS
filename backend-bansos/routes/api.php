<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController; 
use App\Http\Controllers\Api\WargaController;
use App\Http\Controllers\Api\ProgramBantuanController;
use App\Http\Controllers\Api\SeleksiController;
use App\Http\Controllers\Api\PenyaluranController;
use App\Http\Controllers\Api\NotifikasiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==============================
// 1. ZONA PUBLIK (Bisa diakses tanpa Login)
// ==============================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// ==============================
// 2. ZONA PRIVAT (Harus Login / Punya Token)
// ==============================
Route::middleware('auth:sanctum')->group(function () {

    // --- A. AUTHENTICATION ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/update', [WargaController::class, 'updateProfile']); // Route untuk Simpan Profil

    // --- B. WARGA / BANSOS (Frontend HomeWarga.jsx) ---
    Route::get('/warga', [WargaController::class, 'index']); // Dashboard Admin
    Route::post('/warga', [WargaController::class, 'store']); // Dashboard Admin
    
    // Perbaikan: Ubah '/cek-bansos-saya' menjadi '/warga/cek-status' agar sesuai React
    Route::get('/warga/cek-status', [WargaController::class, 'cekStatusBansos']); 
    
    // Route untuk Warga Mengajukan
    Route::post('/warga/ajukan', [WargaController::class, 'tambahPengajuan']);


    // --- C. PROGRAM BANTUAN ---
    Route::get('/program', [ProgramBantuanController::class, 'index']);
    Route::post('/program', [ProgramBantuanController::class, 'store']);


    // --- D. SELEKSI PENERIMA ---
    Route::get('/seleksi', [SeleksiController::class, 'index']);
    Route::post('/seleksi', [SeleksiController::class, 'store']);
    // Approve & Reject
    Route::post('/seleksi/{id}/approve', [SeleksiController::class, 'approve']);
    Route::post('/seleksi/{id}/reject', [SeleksiController::class, 'reject']);
    // Resource Controller (Opsional jika butuh show/update/delete lengkap)
    Route::apiResource('/seleksi-resource', SeleksiController::class);


    // --- E. PENYALURAN ---
    Route::get('/penyaluran', [PenyaluranController::class, 'index']);
    Route::post('/penyaluran', [PenyaluranController::class, 'store']);

    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
});