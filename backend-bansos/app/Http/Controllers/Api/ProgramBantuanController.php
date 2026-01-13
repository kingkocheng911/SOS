<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProgramBantuan; // <-- Jangan lupa ini

class ProgramBantuanController extends Controller
{
    // 1. Ambil semua data program (Menu GET)
    public function index()
    {
        $program = ProgramBantuan::all();
        
        return response()->json([
            'status' => true,
            'message' => 'Daftar Program Bantuan',
            'data' => $program
        ]);
    }

    // 2. Simpan program baru (Menu POST)
    public function store(Request $request)
    {
        // Validasi data (opsional tapi bagus)
        $request->validate([
            'nama_program' => 'required',
            'deskripsi' => 'required',
        ]);

        // Simpan ke database
        $program = ProgramBantuan::create([
            'nama_program' => $request->nama_program,
            'deskripsi' => $request->deskripsi
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Program berhasil dibuat',
            'data' => $program
        ]);
    }
}