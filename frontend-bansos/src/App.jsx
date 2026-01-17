import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

// IMPORT AUTH
import Login from "./loginpages/Login";
import Register from "./loginpages/Register";

// IMPORT ADMIN
import Dashboard from "./pagesadmin/Dashboard";
import Warga from "./pagesadmin/Warga"; 
import Program from "./pagesadmin/Program"; 
import Seleksi from "./pagesadmin/Seleksi";
import Penyaluran from "./pagesadmin/Penyaluran";

// IMPORT KADES 
import DashboardKades from "./pageskades/DashboardKades"; // Tambahkan ini
import PersetujuanKades from "./pageskades/Persetujuan"; 

// IMPORT WARGA
import HomeWarga from "./pageswarga/HomeWarga"; 
import BerandaWarga from "./pageswarga/BerandaWarga";
import AjukanBantuan from "./pageswarga/AjukanBantuan";
import ProfilWarga from "./pageswarga/ProfilWarga";

function App() {
  const token = localStorage.getItem("token");
  let user = {};
  
  try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) user = JSON.parse(savedUser);
  } catch (e) { console.error(e); }

  const role = user?.role?.toLowerCase(); 

  return (
    <div className="d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
        
        {/* Navbar */}
        {token && <Navbar />}

        <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
            
            {/* === SIDEBAR (KIRI) === */}
            {token && (
                <div style={{ 
                    width: '250px', 
                    flexShrink: 0, 
                    backgroundColor: '#fff', 
                    borderRight: '1px solid #dee2e6',
                    overflow: 'hidden', 
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Sidebar />
                </div>
            )}

            {/* === MAIN CONTENT (KANAN) === */}
            <main className="flex-grow-1 d-flex flex-column" style={{ 
                overflowY: 'auto', 
                backgroundColor: '#f8f9fa' 
            }}>
                
                <div className="p-4 flex-grow-1">
                    {token ? (
                        <Routes>
                            {/* Route Warga */}
                            <Route path="/home" element={<HomeWarga page="beranda" />} />
                            <Route path="/ajukan" element={<HomeWarga page="ajukan" />} />
                            <Route path="/profil-warga" element={<HomeWarga page="profil" />} />
                            <Route path="/notifikasi" element={<HomeWarga page="notifikasi" />} />
                            
                            {/* Route Admin */}
                            <Route path="/dashboard" element={role === 'warga' ? <Navigate to="/home" /> : <Dashboard />} />
                            <Route path="/warga" element={role === 'warga' ? <Navigate to="/home" /> : <Warga />} />
                            <Route path="/program" element={role === 'warga' ? <Navigate to="/home" /> : <Program />} />
                            <Route path="/seleksi" element={role === 'warga' ? <Navigate to="/home" /> : <Seleksi />} />
                            <Route path="/penyaluran" element={role === 'warga' ? <Navigate to="/home" /> : <Penyaluran />} />
                            
                            {/* Route Kades */}
                            <Route path="/kades/dashboard" element={role === 'kades' ? <DashboardKades /> : <Navigate to="/" />} />
                            <Route path="/kades/persetujuan" element={role === 'kades' ? <PersetujuanKades /> : <Navigate to="/" />} />
                            
                            {/* Default Redirects */}
                            <Route path="/" element={
                                role === 'warga' ? <Navigate to="/home" /> : 
                                role === 'kades' ? <Navigate to="/kades/dashboard" /> : 
                                <Navigate to="/dashboard" />
                            } />
                            
                            <Route path="/login" element={<Navigate to="/" />} />
                            <Route path="/register" element={<Navigate to="/" />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    ) : (
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="*" element={<Navigate to="/login" />} />
                        </Routes>
                    )}
                </div>

                {token && <Footer />}
            </main>
        </div>
    </div>
  );
}

export default App;