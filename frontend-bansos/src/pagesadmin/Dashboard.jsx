import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    const [stats, setStats] = useState({ total_warga: 0, disalurkan: 0 });
    const [myStatus, setMyStatus] = useState(null);
    
    // 1. Ambil data user yang sedang login
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        // Jika Admin, kita hitung statistik (Butuh endpoint API khusus, tapi kita simulasi dulu)
        // Disini kita bisa fetch data warga untuk dihitung
        if (isAdmin) {
             fetchStats();
        } else {
             // Jika User biasa, cek status dia sendiri
             fetchMyStatus();
        }
    }, []);

    const fetchStats = async () => {
        // Simulasi hitung data (Nanti bisa dibuat API khusus dashboard)
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/warga");
            const allWarga = res.data.data;
            setStats({
                total_warga: allWarga.length,
                disalurkan: allWarga.filter(w => w.status_seleksi === 'Disalurkan').length
            });
        } catch (error) {
            console.error("Gagal ambil stats");
        }
    };

    const fetchMyStatus = async () => {
        // User mengecek statusnya sendiri berdasarkan email/nama
        // (Idealnya backend menyediakan endpoint /api/me/status)
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/warga");
            // Cari data warga yang namanya sama dengan user login
            // (Catatan: Ini cara sederhana, idealnya filter dari backend)
            const myData = res.data.data.find(w => w.email === user.email) || 
                           res.data.data.find(w => w.nama === user.name); 
            
            setMyStatus(myData);
        } catch (error) {
            console.error("Gagal ambil status");
        }
    };

    return (
        <div className="container mt-4">
            {/* --- TAMPILAN KHUSUS ADMIN --- */}
            {isAdmin ? (
                <div>
                    <h2 className="mb-4">Dashboard Admin</h2>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <div className="card bg-primary text-white shadow">
                                <div className="card-body">
                                    <h3>{stats.total_warga}</h3>
                                    <p>Total Warga Terdaftar</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div className="card bg-success text-white shadow">
                                <div className="card-body">
                                    <h3>{stats.disalurkan}</h3>
                                    <p>Bantuan Sudah Disalurkan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <h4>Aksi Cepat</h4>
                        <Link to="/warga" className="btn btn-outline-primary me-2">Kelola Warga</Link>
                        <Link to="/penyaluran" className="btn btn-outline-success">Input Penyaluran</Link>
                    </div>
                </div>
            ) : (
                
            /* --- TAMPILAN KHUSUS USER (WARGA) --- */
                <div>
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-primary text-white p-4">
                            <h2>Halo, {user.name}!</h2>
                            <p className="mb-0">Selamat datang di Aplikasi Bansos Desa.</p>
                        </div>
                        <div className="card-body p-5 text-center">
                            {myStatus ? (
                                <div>
                                    <h5 className="text-muted mb-3">Status Bantuan Anda Saat Ini:</h5>
                                    
                                    {/* Badge Status Besar */}
                                    {myStatus.status_seleksi === 'Disalurkan' ? (
                                        <div className="alert alert-success d-inline-b lock px-5 py-3">
                                            <h1 className="display-4"><i className="bi bi-check-circle-fill"></i></h1>
                                            <h3 className="fw-bold">SUDAH DISALURKAN</h3>
                                            <p>Bantuan telah Anda terima.</p>
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning d-inline-block px-5 py-3">
                                            <h1 className="display-4"><i className="bi bi-hourglass-split"></i></h1>
                                            <h3 className="fw-bold">{myStatus.status_seleksi || "MENUNGGU"}</h3>
                                            <p>Data sedang diproses oleh petugas.</p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-top">
                                        <p>NIK Terdaftar: <strong>{myStatus.nik}</strong></p>
                                        <p>Alamat: {myStatus.alamat}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted">
                                    <i className="bi bi-search display-1"></i>
                                    <p className="mt-3">Data Anda belum ditemukan di sistem Bansos.<br/>Silakan hubungi admin desa.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;