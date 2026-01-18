import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    // Ambil data user dari LocalStorage
    let user = {};
    try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            user = JSON.parse(savedUser);
        }
    } catch (error) {
        console.error("Error parsing user data:", error);
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm" style={{ zIndex: 1000, padding: '0.5rem 0' }}>
            <div className="container-fluid px-4">
                
                {/* 1. LOGO & JUDUL (Kiri) */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    {/* Karena file ada di folder 'public', kita akses langsung dengan "/namafile.png".
                       React/Vite otomatis akan mencarinya di folder public.
                    */}
                    <img 
                        src="/logodesa.png" 
                        alt="Logo Desa" 
                        className="me-2"
                        style={{ 
                            height: '45px',    // Ukuran disesuaikan agar rapi di navbar
                            width: 'auto', 
                            objectFit: 'contain'
                        }} 
                    />
                    
                    {/* Teks Judul */}
                    <div className="d-flex flex-column justify-content-center">
                        <span className="fw-bold fs-5" style={{ lineHeight: '1.1' }}>DESA BANTU</span>
                        <span className="fw-light text-white-50" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            Sistem Distribusi Bantuan Sosial
                        </span>
                    </div>
                </Link>

                {/* 2. PROFIL & LOGOUT (Kanan) */}
                <div className="d-flex align-items-center ms-auto">
                    
                    {/* Info User (Nama & Role) */}
                    <div className="text-end text-white me-3 d-none d-md-block">
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                            {user.name || 'Admin Bansos'}
                        </div>
                        <div className="text-white-50" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {user.role || 'Administrator'}
                        </div>
                    </div>

                    {/* Tombol Logout */}
                    <button 
                        onClick={handleLogout} 
                        className="btn btn-danger btn-sm px-3 fw-bold"
                    >
                        Logout
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;