import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BerandaWarga.css'; 

const BerandaWarga = ({ setActiveTab }) => {
    // --- 1. STATE ---
    const [wargaData, setWargaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusDaftar, setStatusDaftar] = useState(null);

    // --- 2. FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await axios.get('http://127.0.0.1:8000/api/status-bantuan', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStatusDaftar(response.data.status);

                if (response.data.status === 'sudah_daftar') {
                    setWargaData(response.data.data);
                }

            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- 3. LOGIKA TAMPILAN STATUS (CLEAN) ---
    const getStatusConfig = (data) => {
        if (!data) return { class: 'status-neutral', text: 'Status Tidak Diketahui' };
        
        const status = data.status_seleksi;

        // Cek Status: Disetujui / Lolos
        if (['Disetujui', 'Lolos', 'Cair'].includes(status)) {
            return { 
                className: 'status-success', 
                text: 'DISETUJUI / CAIR',
                desc: 'Selamat! Bantuan Anda telah disetujui dan siap disalurkan.'
            };
        }
        
        // Cek Status: Ditolak / Gagal
        if (['Ditolak', 'Gagal'].includes(status)) {
            return { 
                className: 'status-danger', 
                text: 'MOHON MAAF, DITOLAK',
                desc: 'Anda belum memenuhi kriteria penerima bantuan periode ini.'
            };
        }

        // Default: Sedang Diproses (Orange)
        return { 
            className: '', // Kosong = Default Orange di CSS
            text: (status || 'SEDANG DIPROSES').toUpperCase(),
            desc: 'Data Anda sedang dalam tahap verifikasi oleh petugas.'
        };
    };


    // --- 4. RENDER: LOADING ---
    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <h6 className="text-muted fw-bold">Memuat data dashboard...</h6>
            </div>
        );
    }

    // --- 5. RENDER: BELUM DAFTAR (Neutral State) ---
    if (statusDaftar === 'belum_daftar' || !wargaData) {
        return (
            <div className="dashboard-grid">
                <div className="hero-status-card status-neutral text-center d-flex flex-column align-items-center">
                    <div className="mb-3 p-3 bg-light rounded-circle">
                         <i className="bi bi-folder-plus fs-1 text-secondary"></i>
                    </div>
                    <div className="status-value mb-2">Belum Ada Pengajuan</div>
                    <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
                        Anda belum terdaftar di program bantuan sosial manapun. Silakan ajukan permohonan baru.
                    </p>
                    <button 
                        className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
                        onClick={() => setActiveTab('ajukan')}
                    >
                        <i className="bi bi-plus-circle me-2"></i> Ajukan Sekarang
                    </button>
                </div>
            </div>
        );
    }

    // --- 6. RENDER: UTAMA (Sudah Daftar) ---
    const statusConfig = getStatusConfig(wargaData);

    return (
        <div className="dashboard-grid">
            
            {/* KARTU SPESIAL: Status (Kiri / Atas) */}
            <div className={`hero-status-card ${statusConfig.className}`}>
                <div className="status-label">STATUS BANTUAN ANDA</div>
                <div className="status-value">{statusConfig.text}</div>
                <p className="text-secondary mt-2 fw-medium">{statusConfig.desc}</p>
                
                {/* Detail Data */}
                <div className="mt-4 pt-3 border-top w-100">
                    <div className="row">
                        <div className="col-6">
                            <small className="text-muted d-block mb-1">Nama Penerima</small>
                            <span className="fw-bold text-dark">{wargaData.nama}</span>
                        </div>
                        <div className="col-6">
                            <small className="text-muted d-block mb-1">Tanggal Pengajuan</small>
                            <span className="fw-bold text-dark">
                                {wargaData.created_at 
                                    ? new Date(wargaData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTAINER INFO (Kanan / Bawah) */}
            <div className="d-flex flex-column h-100">
                
                {/* Info Box 1: Syarat (Full Height sekarang) */}
                <div className="info-box flex-grow-1">
                    <h3><i className="bi bi-clipboard-check text-primary me-2"></i>Syarat Pengambilan</h3>
                    <ul className="info-list mb-0" style={{marginTop: '1rem'}}>
                        <li>Wajib membawa <strong>KTP & KK Asli</strong>.</li>
                        <li>Membawa Surat Undangan dari Desa (Jika ada).</li>
                        <li>Hadir tepat waktu sesuai jadwal undangan.</li>
                        <li>Tidak dapat diwakilkan (kecuali surat kuasa).</li>
                    </ul>
                </div>

                {/* BAGIAN PUSAT BANTUAN TELAH DIHAPUS DARI SINI */}

            </div>
        </div>
    );
};

export default BerandaWarga;