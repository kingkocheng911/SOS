import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 1. IMPORT AUTH (Folder baru: pagesauth)
import Login from "./loginpages/Login";
import Register from "./loginpages/Register";

// 2. IMPORT ADMIN (Folder: pagesadmin)
import Dashboard from "./pagesadmin/Dashboard";
import Warga from "./pagesadmin/Warga"; // Pastikan file Warga.jsx ada di pagesadmin
import Program from "./pagesadmin/Program"; 
import Seleksi from "./pagesadmin/Seleksi";
import Penyaluran from "./pagesadmin/Penyaluran";

// 3. IMPORT KADES (Folder: pageskades)
import Persetujuan from "./pageskades/Persetujuan"; 

// 4. IMPORT WARGA (Folder: pageswarga)
import HomeWarga from "./pageswarga/HomeWarga"; 

function App() {
  const token = localStorage.getItem("token");
  let user = {};
  
  try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) user = JSON.parse(savedUser);
  } catch (e) { console.error(e); }

  const role = user?.role?.toLowerCase(); 

  return (
    <div className="d-flex flex-column min-vh-100">
        
        {/* Navbar: Tampil jika login & BUKAN warga */}
        {token && role !== 'warga' && <Navbar />}

        {token ? (
            <div className={role === 'warga' ? "" : "container flex-grow-1 mt-4"}>
                <Routes>
                    {/* === JALUR WARGA === */}
                    <Route path="/home" element={<HomeWarga />} />

                    {/* === JALUR ADMIN === */}
                    <Route path="/dashboard" element={role === 'warga' ? <Navigate to="/home" /> : <Dashboard />} />
                    <Route path="/warga" element={role === 'warga' ? <Navigate to="/home" /> : <Warga />} />
                    <Route path="/program" element={role === 'warga' ? <Navigate to="/home" /> : <Program />} />
                    <Route path="/seleksi" element={role === 'warga' ? <Navigate to="/home" /> : <Seleksi />} />
                    <Route path="/penyaluran" element={role === 'warga' ? <Navigate to="/home" /> : <Penyaluran />} />
                    
                    {/* === JALUR KADES === */}
                    <Route path="/persetujuan" element={role === 'warga' ? <Navigate to="/home" /> : <Persetujuan />} />
                    
                    {/* === DEFAULT === */}
                    <Route path="/" element={role === 'warga' ? <Navigate to="/home" /> : <Navigate to="/dashboard" />} />
                    <Route path="/login" element={<Navigate to="/" />} />
                    <Route path="/register" element={<Navigate to="/" />} />
                </Routes>
            </div>
        ) : (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center"> 
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        )}

        {token && role !== 'warga' && <Footer />}
    </div>
  );
}

export default App;