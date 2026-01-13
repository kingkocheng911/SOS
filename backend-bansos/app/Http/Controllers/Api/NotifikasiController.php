<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notifikasi;
use Illuminate\Support\Facades\Auth;

class NotifikasiController extends Controller
{
    public function index()
    {
        // Ambil user yang sedang login
        $user = Auth::user();

        // Jika user tidak ditemukan (session habis), kembalikan error
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Ambil notifikasi milik user tersebut, urutkan dari yang terbaru
        $notifikasi = Notifikasi::where('user_id', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json($notifikasi);
    }
}