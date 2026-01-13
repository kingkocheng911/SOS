import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --- IMPORT HALAMAN ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Halaman Admin/Kades
import Program from "./pages/Program"; 
import Seleksi from "./pages/Seleksi";
import Penyaluran from "./pages/Penyaluran";
import Persetujuan from "./pages/Persetujuan"; 

// --- BAGIAN PENTING (PERBAIKAN) ---
// Kita import HomeWarga, tapi nanti kita pasang di route '/warga'
// Asumsi file HomeWarga.jsx ada di folder src (sejajar dengan App.jsx)
// Jika file ada di folder pages, ubah jadi: "./pages/HomeWarga"
import HomeWarga from "./pages/HomeWarga";

function App() {
  const token = localStorage.getItem("token");
  // Mengambil data user untuk pengecekan role
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        
        {/* Navbar hanya muncul jika sudah login */}
        {token && <Navbar />}

        {token ? (
            /* === AREA MEMBER (SUDAH LOGIN) === */
            <div className="container flex-grow-1 mt-4">
                <Routes>
                    {/* 1. Dashboard Admin */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* 2. Menu Khusus Warga (Tampilan Kotak Hitam) */}
                    {/* Disini kita pasang HomeWarga ke route /warga */}
                    <Route path="/warga" element={<HomeWarga />} />
                    
                    {/* 3. Menu Admin & Kades */}
                    <Route path="/program" element={<Program />} />
                    <Route path="/seleksi" element={<Seleksi />} />
                    <Route path="/persetujuan" element={<Persetujuan />} />
                    <Route path="/penyaluran" element={<Penyaluran />} />
                    
                    {/* Redirect cerdas berdasarkan Role */}
                    <Route path="/" element={
                        user.role === 'warga' ? <Navigate to="/warga" /> : <Navigate to="/dashboard" />
                    } />
                    
                    {/* Mencegah akses ke Login/Register jika sudah login */}
                    <Route path="/login" element={<Navigate to="/" />} />
                    <Route path="/register" element={<Navigate to="/" />} />
                </Routes>
            </div>
        ) : (
            /* === AREA PUBLIK (BELUM LOGIN) === */
            <div className="flex-grow-1 d-flex align-items-center justify-content-center"> 
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        )}

        {token && <Footer />}
      </div>
    </Router>
  );
}

export default App;