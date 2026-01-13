<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController; 
use App\Http\Controllers\Api\WargaController;
use App\Http\Controllers\Api\ProgramBantuanController;
use App\Http\Controllers\Api\SeleksiController;
use App\Http\Controllers\Api\PenyaluranController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==============================
// 1. ZONA PUBLIK (Bisa diakses tanpa Login)
// ==============================
// Register & Login ditaruh di sini agar bisa diakses siapapun
Route::post('/register', [AuthController::class, 'register']); // <--- SUDAH DIPINDAHKAN KE SINI (BENAR)
Route::post('/login', [AuthController::class, 'login']);


// ==============================
// 2. ZONA PRIVAT (Harus Login / Punya Token)
// ==============================
Route::middleware('auth:sanctum')->group(function () {

    // Fitur Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // A. Route Data Warga
    Route::get('/warga', [WargaController::class, 'index']);
    Route::post('/warga', [WargaController::class, 'store']);

    // B. Route Program Bantuan
    Route::get('/program', [ProgramBantuanController::class, 'index']);
    Route::post('/program', [ProgramBantuanController::class, 'store']);

    // C. Route Seleksi
    Route::get('/seleksi', [SeleksiController::class, 'index']);
    Route::post('/seleksi', [SeleksiController::class, 'store']);
    Route::apiResource('/seleksi', App\Http\Controllers\Api\SeleksiController::class);

    // D. Route Penyaluran
    Route::get('/penyaluran', [PenyaluranController::class, 'index']);
    Route::post('/penyaluran', [PenyaluranController::class, 'store']);

    Route::post('/seleksi/{id}/approve', [SeleksiController::class, 'approve']);
    Route::post('/seleksi/{id}/reject', [SeleksiController::class, 'reject']);

});