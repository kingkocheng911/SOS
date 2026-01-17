<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController; 
use App\Http\Controllers\Api\WargaController;
use App\Http\Controllers\Api\ProgramBantuanController; 
use App\Http\Controllers\Api\SeleksiController;
use App\Http\Controllers\Api\PenyaluranController;
use App\Models\Notifikasi;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =================================================================
// 1. ZONA PUBLIK (BISA DIAKSES TANPA LOGIN)
// =================================================================

// Auth & Utilities
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login'); 
Route::get('/wilayah-desa', [AuthController::class, 'getDataWilayah']); 

// --- PENTING: FITUR PERBAIKAN DATA ---
// Ditaruh disini agar bisa dijalankan lewat browser
Route::get('/sync-warga', [WargaController::class, 'syncAllWarga']);


// Master Data Program (Sementara Public untuk Testing Frontend)
Route::get('/program', [ProgramBantuanController::class, 'index']);
Route::post('/program', [ProgramBantuanController::class, 'store']);
Route::put('/program/{id}', [ProgramBantuanController::class, 'update']);
Route::delete('/program/{id}', [ProgramBantuanController::class, 'destroy']);


// =================================================================
// 2. ZONA PRIVAT (HARUS LOGIN / ADA TOKEN)
// =================================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Logout & Update Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/update', [WargaController::class, 'updateProfile']); 

    // --- WARGA ---
    // Perhatikan urutan: Route spesifik ditaruh di atas route {id}
    Route::get('/warga/cek-status', [WargaController::class, 'cekStatusBansos']); // Cek detail
    Route::get('/status-bantuan', [WargaController::class, 'checkStatus']);       // Cek dashboard (kotak merah)
    Route::post('/warga/ajukan', [WargaController::class, 'tambahPengajuan']);
    
    // CRUD Warga (Admin)
    Route::get('/warga', [WargaController::class, 'index']); 
    Route::post('/warga', [WargaController::class, 'store']); 
    Route::get('warga/{id}', [WargaController::class, 'show']);
    Route::put('warga/{id}', [WargaController::class, 'update']);
    Route::delete('warga/{id}', [WargaController::class, 'destroy']);
    
    // --- SELEKSI ---
    Route::post('/seleksi/filter-kandidat', [SeleksiController::class, 'filterKandidat']);
    Route::apiResource('seleksi', SeleksiController::class);

    // --- PENYALURAN ---
    Route::get('/penyaluran', [PenyaluranController::class, 'index']);
    Route::post('/penyaluran', [PenyaluranController::class, 'store']);

    // --- NOTIFIKASI ---
    Route::get('/notifikasi', function (Request $request) {
        $notif = Notifikasi::where('user_id', $request->user()->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
        return response()->json(['status' => true, 'data' => $notif]);
    });

    Route::post('/notifikasi/mark-as-read', function (Request $request) {
        Notifikasi::where('user_id', $request->user()->id)
                    ->where('is_read', false)
                    ->update(['is_read' => true]);
        return response()->json(['status' => true, 'message' => 'Notifikasi ditandai dibaca']);
    });

    
});