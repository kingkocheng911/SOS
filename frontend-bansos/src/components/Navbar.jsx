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

    // Fungsi Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        // Navbar Biru Full Width
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm" style={{ zIndex: 1000 }}>
            <div className="container-fluid px-4">
                
                {/* 1. JUDUL APLIKASI (Kiri) */}
                <Link className="navbar-brand fw-bold fs-4" to="/">
                    BANSOS APP
                </Link>

                {/* (Menu Tengah dihapus sesuai permintaan) */}

                {/* 2. PROFIL & LOGOUT (Kanan) */}
                <div className="d-flex align-items-center ms-auto">
                    
                    {/* Info User (Nama & Role) - Disembunyikan di layar HP kecil */}
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