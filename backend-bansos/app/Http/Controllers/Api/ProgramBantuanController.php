<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProgramBantuan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class ProgramBantuanController extends Controller
{
    // --- AMBIL DATA ---
    public function index()
    {
        try {
            $namaTabel = (new ProgramBantuan())->getTable();

            if (!Schema::hasTable($namaTabel)) {
                return response()->json([
                    'status' => false,
                    'message' => "CRITICAL ERROR: Tabel '$namaTabel' tidak ditemukan!",
                    'solution' => "Cek phpMyAdmin, pastikan migrasi sudah dijalankan."
                ], 500);
            }

            // Ambil data, urutkan dari yang terbaru
            $program = ProgramBantuan::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'status' => true,
                'data' => $program
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Terjadi Error di Server',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    // --- SIMPAN BARU ---
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nama_program' => 'required|string|max:255',
            ]);

            $program = ProgramBantuan::create([
                'nama_program'          => $request->nama_program,
                'deskripsi'             => $request->deskripsi,
                'maksimal_penghasilan'  => $request->maksimal_penghasilan,
                'minimal_tanggungan'    => $request->minimal_tanggungan
            ]);

            return response()->json([
                'status' => true, 
                'message' => 'Program berhasil disimpan!',
                'data' => $program
            ], 201);

        } catch (\Exception $e) {
            Log::error("Gagal simpan program: " . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Gagal Simpan Data',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    // --- UPDATE DATA (EDIT) ---
    public function update(Request $request, $id)
    {
        try {
            // Cari data berdasarkan ID
            $program = ProgramBantuan::find($id);

            // Jika tidak ketemu
            if (!$program) {
                return response()->json([
                    'status' => false, 
                    'message' => 'Data program tidak ditemukan'
                ], 404);
            }

            // Update data
            $program->update([
                'nama_program'          => $request->nama_program,
                'deskripsi'             => $request->deskripsi,
                'maksimal_penghasilan'  => $request->maksimal_penghasilan,
                'minimal_tanggungan'    => $request->minimal_tanggungan
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Program berhasil diperbarui!',
                'data' => $program
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal Update Data',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    // --- HAPUS DATA ---
    public function destroy($id)
    {
        try {
            $program = ProgramBantuan::find($id);
            
            if (!$program) {
                return response()->json([
                    'status' => false, 
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            $program->delete();

            return response()->json([
                'status' => true,
                'message' => 'Program berhasil dihapus!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal Hapus Data',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}