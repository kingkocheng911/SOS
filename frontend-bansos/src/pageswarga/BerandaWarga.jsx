import React from 'react';
import './BerandaWarga.css'; 

const BerandaWarga = ({ setActiveTab }) => {

    return (
        <div className="dashboard-container animate-enter">
            
            {/* --- HERO: SAMBUTAN SISTEM --- */}
            <header className="dashboard-hero">
                <div className="hero-text">
                    <h1>Portal Layanan Bantuan Sosial</h1>
                    <p>Selamat datang di sistem transparansi dan pengelolaan bantuan desa. Silakan pilih menu layanan di bawah untuk memulai.</p>
                </div>
                <div className="hero-decoration">
                    <i className="bi bi-building-fill-check"></i>
                </div>
            </header>

            {/* --- MENU UTAMA (NAVIGASI) --- */}
            {/* Ini logika UI, bukan data dummy */}
            <div className="section-label">Menu Layanan</div>
            <div className="menu-grid">
                
                {/* Tombol ke Halaman Cek */}
                <div className="nav-card" onClick={() => setActiveTab('cek-status')}>
                    <div className="icon-wrapper blue">
                        <i className="bi bi-search"></i>
                    </div>
                    <div className="nav-content">
                        <h3>Cek Status Pengajuan</h3>
                        <p>Pantau progres verifikasi berkas Anda.</p>
                    </div>
                    <i className="bi bi-chevron-right arrow"></i>
                </div>

                {/* Tombol ke Halaman Pengajuan */}
                <div className="nav-card" onClick={() => setActiveTab('ajukan')}>
                    <div className="icon-wrapper green">
                        <i className="bi bi-file-earmark-plus-fill"></i>
                    </div>
                    <div className="nav-content">
                        <h3>Ajukan Permohonan</h3>
                        <p>Daftar baru atau perbarui data diri.</p>
                    </div>
                    <i className="bi bi-chevron-right arrow"></i>
                </div>

                {/* Tombol ke Halaman Bantuan/FAQ */}
                <div className="nav-card">
                    <div className="icon-wrapper orange">
                        <i className="bi bi-question-circle-fill"></i>
                    </div>
                    <div className="nav-content">
                        <h3>Pusat Bantuan</h3>
                        <p>Pertanyaan umum seputar BANSOS.</p>
                    </div>
                    <i className="bi bi-chevron-right arrow"></i>
                </div>
            </div>

            {/* --- INFO GRAFIS: ALUR PROSES (SOP) --- */}
            {/* Ini konten edukasi statis, sangat disukai dosen karena informatif */}
            <div className="section-label mt-5">Alur Penerimaan Bantuan</div>
            <div className="process-steps">
                
                <div className="step-item">
                    <div className="step-number">1</div>
                    <div className="step-desc">
                        <h4>Registrasi & Upload</h4>
                        <p>Warga melakukan input data diri dan upload KTP/KK.</p>
                    </div>
                </div>

                <div className="step-line"></div>

                <div className="step-item">
                    <div className="step-number">2</div>
                    <div className="step-desc">
                        <h4>Verifikasi Desa</h4>
                        <p>Admin desa memvalidasi kelayakan data pendaftar.</p>
                    </div>
                </div>

                <div className="step-line"></div>

                <div className="step-item">
                    <div className="step-number">3</div>
                    <div className="step-desc">
                        <h4>Penyaluran</h4>
                        <p>Penerbitan jadwal dan pengambilan bantuan.</p>
                    </div>
                </div>

            </div>

            {/* --- FOOTER INFO --- */}
            <div className="system-footer">
                <i className="bi bi-shield-lock"></i>
                <span>Sistem ini diawasi langsung oleh Pemerintah Desa setempat.</span>
            </div>

        </div>
    );
};

export default BerandaWarga;