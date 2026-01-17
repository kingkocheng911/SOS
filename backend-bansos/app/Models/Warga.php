<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warga extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama',
        'nik',
        'kk',
        'foto',      // Nama file foto yang tersimpan di database
        'foto_ktp',
        'foto_kk',
        'gaji',
        'tanggungan',
        'alamat',
        'rt',
        'rw',
        'nomor_hp',
        'pekerjaan',
        'status_seleksi',
        'program_id',
    ];

    /**
     * Appends: Menambahkan field virtual ke JSON API.
     * Kita gunakan 'foto_url' agar sinkron dengan frontend.
     */
    protected $appends = ['foto_url'];

    /**
     * ACCESSOR: getFotoUrlAttribute
     * Menghasilkan URL lengkap untuk foto profil.
     */
    public function getFotoUrlAttribute()
    {
        // 1. Cek apakah ada file foto di kolom 'foto' tabel wargas
        if ($this->foto) {
            // Gunakan path 'uploads/profil/' sesuai dengan yang ada di WargaController
            return asset('uploads/profil/' . $this->foto);
        }

        // 2. Jika di tabel wargas kosong, coba cek foto di tabel User (via relasi)
        if ($this->user && $this->user->foto) {
            return asset('uploads/profil/' . $this->user->foto);
        }

        // 3. Jika benar-benar kosong, gunakan UI-Avatars (Inisial Nama)
        return "https://ui-avatars.com/api/?name=" . urlencode($this->nama) . "&background=random&color=fff&size=128&bold=true";
    }

    /**
     * Relasi ke User (Satu warga memiliki satu akun user)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke Seleksi
     */
    public function seleksi()
    {
        return $this->hasMany(Seleksi::class, 'warga_id');
    }

    /**
     * Relasi ke Program Bantuan
     */
    public function program()
    {
        return $this->belongsTo(ProgramBantuan::class, 'program_id');
    }
}