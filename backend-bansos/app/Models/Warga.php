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
        'user_id',
        'nama',
        'nik',
        'kk',
        'foto_ktp',
        'foto_kk',
        'gaji',
        'tanggungan',
        'alamat',
        'rt',
        'rw',
        
        // --- TAMBAHAN PENTING (YANG SEBELUMNYA HILANG) ---
        'nomor_hp',   // <--- Wajib ada agar HP tersimpan!
        'pekerjaan',  // <--- Wajib ada agar Pekerjaan tersimpan!
        
        // --- KOLOM STATUS & PROGRAM ---
        'status_seleksi',
        'program_id',
    ];
    /**
     * Relasi ke User
     * Menghubungkan data profil warga dengan akun loginnya
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke Seleksi
     * Menghubungkan warga dengan riwayat pengajuan bantuannya
     */
    public function seleksi()
    {
        return $this->hasMany(Seleksi::class, 'warga_id');
    }

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