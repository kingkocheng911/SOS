import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css"; // Pastikan CSS Anda disimpan di file ini

const DashboardAdmin = () => {
    // State untuk data real
    const [stats, setStats] = useState({
        totalWarga: 0,
        bantuanDisalurkan: 0
    });
    
    // State untuk tabel data warga
    const [wargaList, setWargaList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Data dari API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // 1. Ambil Data Warga
                // Ganti URL ini sesuai endpoint backend Anda
                const responseWarga = await axios.get("http://localhost:5000/api/warga", config);
                
                // 2. Ambil Data Penyaluran (Untuk statistik)
                // Ganti URL ini sesuai endpoint backend Anda
                const responsePenyaluran = await axios.get("http://localhost:5000/api/penyaluran", config);

                // Update State
                setWargaList(responseWarga.data); // Asumsi response.data adalah array warga
                setStats({
                    totalWarga: responseWarga.data.length,
                    bantuanDisalurkan: responsePenyaluran.data.length
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container-fluid">
            
            {/* Header */}
            <h2 className="mb-4 text-dark fw-bold">Dashboard Admin</h2>

            {/* --- BAGIAN KARTU STATISTIK (Sesuai CSS Anda) --- */}
            <div className="row mb-5">
                
                {/* Kartu 1: Total Warga */}
                <div className="col-md-6 mb-3">
                    <div className="card bg-primary h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                {/* Menggunakan p dan h3 agar styling CSS masuk */}
                                <p className="text-uppercase fw-bold mb-1">Total Warga Terdaftar</p>
                                <h3>{loading ? "..." : stats.totalWarga}</h3>
                            </div>
                            <i className="bi bi-people-fill fs-1 text-black-50 opacity-25"></i>
                        </div>
                    </div>
                </div>

                {/* Kartu 2: Bantuan Disalurkan */}
                <div className="col-md-6 mb-3">
                    <div className="card bg-success h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-uppercase fw-bold mb-1">Bantuan Sudah Disalurkan</p>
                                <h3>{loading ? "..." : stats.bantuanDisalurkan}</h3>
                            </div>
                            <i className="bi bi-box2-heart-fill fs-1 text-black-50 opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BAGIAN TABEL DATA WARGA (Sesuai CSS Anda) --- */}
            <div className="row">
                <div className="col-12">
                    {/* Menggunakan class 'table-wrapper' dan 'border-top-blue' dari CSS Anda */}
                    <div className="table-wrapper border-top-blue">
                        
                        <div className="table-header">
                            <h5>Data Warga Terbaru</h5>
                        </div>

                        <div className="table-responsive">
                            {/* Menggunakan class 'custom-table' dari CSS Anda */}
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Nama Warga</th>
                                        <th>NIK</th>
                                        <th>Pekerjaan</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">Memuat data...</td>
                                        </tr>
                                    ) : wargaList.length > 0 ? (
                                        // Mapping data asli dari API (diambil 5 terbaru misalnya)
                                        wargaList.slice(0, 5).map((warga, index) => (
                                            <tr key={warga._id || index}>
                                                <td className="fw-bold">{warga.nama}</td>
                                                <td>{warga.nik}</td>
                                                <td>{warga.pekerjaan}</td>
                                                <td>
                                                    {/* Logika badge status sederhana */}
                                                    <span className={`badge rounded-pill px-3 ${warga.status === 'Aktif' || !warga.status ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                        {warga.status || 'Aktif'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">Belum ada data warga.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardAdmin;