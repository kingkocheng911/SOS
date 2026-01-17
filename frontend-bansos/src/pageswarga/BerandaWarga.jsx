import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BerandaWarga.css'; 

const BerandaWarga = ({ setActiveTab }) => {
    const [wargaData, setWargaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusDaftar, setStatusDaftar] = useState(null);

    // --- 1. SINKRONISASI BACKEND ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mengambil token dari localStorage agar request tidak 401 (Unauthorized)
                const token = localStorage.getItem('token'); 
                
                // Mengarahkan ke endpoint API Laravel
                const response = await axios.get('http://127.0.0.1:8000/api/status-bantuan', {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                });

                // Memastikan data tersinkron ke state
                setStatusDaftar(response.data.status);
                if (response.data.status === 'sudah_daftar') {
                    setWargaData(response.data.data);
                }
            } catch (error) {
                console.error("Gagal sinkronisasi data dashboard:", error.response?.data || error.message);
                // Jika error karena belum login, bisa diarahkan ke login
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- 2. LOGIKA UI STATUS (Tetap dipertahankan sesuai permintaan) ---
    const getStatusConfig = (data) => {
        if (!data) return { className: 'status-neutral', icon: 'bi-question-circle', text: 'TIDAK DIKETAHUI', desc: 'Status data Anda tidak ditemukan.' };
        
        const status = data.status_seleksi;

        if (['Disetujui', 'Lolos', 'Cair'].includes(status)) {
            return { 
                className: 'status-success', 
                icon: 'bi-check-circle-fill',
                text: 'DISETUJUI / CAIR',
                desc: 'Selamat! Berkas Anda dinyatakan lolos verifikasi dan bantuan akan segera disalurkan.'
            };
        }
        
        if (['Ditolak', 'Gagal'].includes(status)) {
            return { 
                className: 'status-danger', 
                icon: 'bi-x-circle-fill',
                text: 'PENGAJUAN DITOLAK',
                desc: 'Maaf, Anda belum memenuhi kriteria penerima bantuan untuk periode seleksi saat ini.'
            };
        }

        return { 
            className: 'status-pending', 
            icon: 'bi-clock-history',
            text: (status || 'PROSES VERIFIKASI').toUpperCase(),
            desc: 'Data Anda telah kami terima dan sedang dalam antrean verifikasi oleh petugas desa.'
        };
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="spinner-modern"></div>
                <p>Menghubungkan ke server...</p>
            </div>
        );
    }

    // --- 3. RENDER: BELUM DAFTAR ---
    if (statusDaftar === 'belum_daftar' || !wargaData) {
        return (
            <div className="dashboard-wrapper animate-fade-in">
                <div className="empty-state-card text-center">
                    <div className="empty-icon">
                        <i className="bi bi-clipboard2-plus"></i>
                    </div>
                    <h2>Belum Terdaftar</h2>
                    <p>Anda belum mengirimkan pengajuan bantuan sosial untuk tahun 2026. Segera lengkapi data Anda untuk mendapatkan manfaat.</p>
                    <button className="btn-main-action" onClick={() => setActiveTab('ajukan')}>
                        Mulai Pengajuan <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(wargaData);

    // --- 4. RENDER: UTAMA (SINKRON) ---
    return (
        <div className="dashboard-grid animate-fade-in">
            {/* KIRI: Status Card Utama */}
            <div className={`status-hero-card ${statusConfig.className}`}>
                <div className="status-header">
                    <span className="badge-status-top">Informasi Terkini</span>
                    <i className={`bi ${statusConfig.icon} status-icon-bg`}></i>
                </div>
                
                <div className="status-content">
                    <label>STATUS BANTUAN ANDA</label>
                    {/* Data diambil langsung dari backend */}
                    <h1>{statusConfig.text}</h1>
                    <p>{statusConfig.desc}</p>
                </div>

                <div className="status-footer-data">
                    <div className="data-item">
                        <small>Nama Penerima</small>
                        <p>{wargaData.nama}</p>
                    </div>
                    <div className="data-item text-end">
                        <small>Tanggal Pengajuan</small>
                        <p>
                            {wargaData.created_at 
                                ? new Date(wargaData.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* KANAN: Syarat & Informasi (Statistik & Pengambilan) */}
            <div className="info-side-panel">
                <div className="requirement-card">
                    <div className="card-top">
                        <i className="bi bi-shield-check"></i>
                        <h5>Syarat Pengambilan</h5>
                    </div>
                    <ul className="modern-list">
                        <li>
                            <div className="list-dot"></div>
                            <span>Wajib membawa <strong>KTP & KK Asli</strong>.</span>
                        </li>
                        <li>
                            <div className="list-dot"></div>
                            <span>Membawa Surat Undangan dari Kantor Desa.</span>
                        </li>
                        <li>
                            <div className="list-dot"></div>
                            <span>Wajib hadir tepat waktu sesuai jadwal.</span>
                        </li>
                        <li>
                            <div className="list-dot"></div>
                            <span>Pengambilan diwakilkan wajib menyertakan <strong>Surat Kuasa</strong>.</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default BerandaWarga;