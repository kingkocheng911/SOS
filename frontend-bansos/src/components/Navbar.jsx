import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook untuk tahu kita sedang di halaman mana
    
    // Ambil data user
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    
    // Cek Role User
    const isAdmin = user?.role === 'admin'; 
    const isKades = user?.role === 'kades'; // <--- Tambahan: Cek Kades

    const handleLogout = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/api/logout");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
            window.location.reload();
        } catch (error) {
            console.error("Gagal logout", error);
            // Tetap paksa logout di frontend meski backend error
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    // Fungsi kecil untuk cek menu aktif
    const isActive = (path) => {
        return location.pathname === path ? "active fw-bold" : "";
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
            <div className="container">
                {/* Logo mengarah ke Dashboard/Home */}
                <Link className="navbar-brand fw-bold" to="/dashboard">
                    <i className="bi bi-box-seam me-2"></i> BANSOS APP
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {/* 1. Menu HOME (Muncul untuk Semua User) */}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">Home</Link>
                        </li>

                        {/* 2. Menu KHUSUS ADMIN */}
                        {isAdmin && (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/warga')}`} to="/warga">Data Warga</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/program')}`} to="/program">Program Bantuan</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/seleksi')}`} to="/seleksi">Seleksi</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${isActive('/penyaluran')}`} to="/penyaluran">Penyaluran</Link>
                                </li>
                            </>
                        )}

                        {/* 3. Menu KHUSUS KEPALA DESA (Baru) */}
                        {isKades && (
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive('/persetujuan')}`} to="/persetujuan">Validasi Data</Link>
                            </li>
                        )}
                    </ul>
                    
                    <div className="d-flex align-items-center">
                        {user && (
                            <div className="text-white me-3 text-end d-none d-lg-block">
                                <div className="fw-bold">{user.name}</div>
                                <small style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                    {/* Logic Tampilan Role */}
                                    {user.role === 'admin' 
                                        ? 'Administrator' 
                                        : user.role === 'kades' 
                                            ? 'Kepala Desa' 
                                            : 'Warga Desa'}
                                </small>
                            </div>
                        )}
                        <button onClick={handleLogout} className="btn btn-danger btn-sm px-3 rounded-pill">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;