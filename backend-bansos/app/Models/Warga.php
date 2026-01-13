<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warga extends Model
{
    use HasFactory;

    /**
     * $fillable: Menentukan kolom mana saja yang boleh diisi dari input form.
     * Pastikan 'program_id' dan 'status_seleksi' ada di sini.
     */
    protected $fillable = [
        'nama',
        'nik',
        'kk',
        'foto_ktp',     // Sesuaikan dengan kolom di database Anda
        'foto_kk',      // Sesuaikan dengan kolom di database Anda
        'gaji',
        'tanggungan',
        'alamat',       // Jika ada
        'rt',           // Jika ada
        'rw',           // Jika ada
        
        // --- KOLOM PENTING UNTUK PROSES SELEKSI ---
        'status_seleksi', // Agar status 'Menunggu Persetujuan' bisa tersimpan
        'program_id',     // Agar ID program bisa masuk ke tabel warga
    ];

    /**
     * Relasi: Setiap Warga "Milik" (Belongs To) Satu Program Bantuan
     * Ini berguna agar di Controller kita bisa panggil: $warga->program->nama_program
     */
    public function program()
    {
        // Pastikan nama Model Program Anda adalah 'ProgramBantuan'
        // Jika namanya 'Program', ganti jadi Program::class
        return $this->belongsTo(ProgramBantuan::class, 'program_id');
    }
}