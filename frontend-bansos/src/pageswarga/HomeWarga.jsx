import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// IMPORT CSS MODULAR
import './HomeWarga.css'; 

// IMPORT KOMPONEN HALAMAN
import BerandaWarga from "./BerandaWarga";
import AjukanBantuan from "./AjukanBantuan";
import ProfilWarga from "./ProfilWarga";

function HomeWarga() {
    const navigate = useNavigate();
    
    // --- 1. STATE & LOGIKA (TETAP SAMA) ---
    const [user, setUser] = useState({});
    
    // State Bansos
    const [bansosData, setBansosData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("beranda");

    // State Pendukung
    const [daftarProgram, setDaftarProgram] = useState([]);
    const [notifikasiList, setNotifikasiList] = useState([]); 
    
    // Form States
    const [jenisBansos, setJenisBansos] = useState("");
    const [alasan, setAlasan] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Profile States
    const [formData, setFormData] = useState({
        alamat: "", no_telp: "", pekerjaan: "", gaji: "", tanggungan: "", foto: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUnemployed, setIsUnemployed] = useState(false);

    // --- USE EFFECT INITIALIZATION ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || storedUser.role !== 'warga') {
            navigate('/login');
            return;
        }

        setUser(storedUser);
        
        // Set Data Profil Awal
        setFormData({
            alamat: storedUser.alamat || "", 
            no_telp: storedUser.no_telp || "",
            pekerjaan: storedUser.pekerjaan || "", 
            gaji: storedUser.gaji || "",
            tanggungan: storedUser.tanggungan || "",
            foto: null
        });

        if (storedUser.pekerjaan === 'Tidak Bekerja' && (storedUser.gaji == 0 || storedUser.gaji === "0")) {
            setIsUnemployed(true);
        }

        fetchStatusBansos(token);
        fetchProgram(token);
        fetchNotifikasi(token); 
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            if (activeTab === 'beranda') fetchStatusBansos(token);
            if (activeTab === 'notifikasi') {
                fetchNotifikasi(token);
                markNotifAsRead(token);
            }
        }
    }, [activeTab]);

    // --- FUNGSI API ---
    const fetchStatusBansos = async (token) => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/warga/cek-status", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBansosData(response.data); 
        } catch (error) {
            console.error("Gagal ambil status:", error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const fetchProgram = async (token) => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/program", { headers: { Authorization: `Bearer ${token}` }});
            setDaftarProgram(res.data.data);
            if(res.data.data.length > 0) setJenisBansos(res.data.data[0].id);
        } catch(e) { console.error(e); }
    };

    const fetchNotifikasi = async (token) => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/notifikasi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.data) {
                const sorted = response.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setNotifikasiList(sorted);
            }
        } catch (error) { console.error("Gagal ambil notif:", error); }
    };

    const markNotifAsRead = async (token) => {
        try {
            await axios.post("http://127.0.0.1:8000/api/notifikasi/mark-as-read", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifikasiList(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (e) {}
    };

    // --- FUNGSI HANDLE FORM ---
    const handleSubmitPengajuan = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            await axios.post("http://127.0.0.1:8000/api/seleksi", {
                warga_id: user.id,
                program_bantuan_id: jenisBansos,
                alasan: alasan,
                status: 1
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert("Pengajuan Berhasil Dikirim!");
            setAlasan("");
            await fetchStatusBansos(token); 
            setActiveTab("beranda"); 

        } catch (error) {
            if(error.response?.status === 409 || error.response?.status === 500) {
                 alert("Info: Pengajuan sedang diproses / Sudah ada.");
                 await fetchStatusBansos(token);
                 setActiveTab("beranda");
            } else if (error.response?.status === 422) {
                 alert("Profil belum lengkap, silakan lengkapi profil.");
                 setActiveTab("profil");
            } else {
                 alert(error.response?.data?.message || "Gagal mengajukan.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number' && value < 0) return;
        setFormData({...formData, [name]: value});
    };

    const handleUnemployedChange = (e) => {
        const checked = e.target.checked;
        setIsUnemployed(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, pekerjaan: 'Tidak Bekerja', gaji: 0 }));
        } else {
            setFormData(prev => ({ ...prev, pekerjaan: '', gaji: '' }));
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, foto: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
             if (formData[key] !== null) dataToSend.append(key, formData[key]);
        });

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/user/update", dataToSend, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            alert("Profil berhasil diperbarui!");
            const updatedUser = response.data.user; 
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFormData(prev => ({...prev, foto: null}));
        } catch (error) {
            alert("Gagal update profil.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // --- 2. TAMPILAN UI BARU (BERSIH DARI INLINE STYLE) ---
    return (
        <div className="dashboard-layout">
            
            {/* --- SIDEBAR KIRI (MENU) --- */}
            <aside className="sidebar-container">
                <div className="mb-4 px-2 d-flex align-items-center gap-2">
                    <i className="bi bi-box-seam-fill text-primary fs-4"></i>
                    <h5 className="fw-bold m-0 text-dark">BANSOS APP</h5>
                </div>

                <div className="sidebar-title">Menu Utama</div>
                
                <button 
                    className={`nav-item ${activeTab === 'beranda' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('beranda')}
                >
                    <i className="bi bi-grid-fill me-3"></i> Beranda
                </button>
                
                <button 
                    className={`nav-item ${activeTab === 'ajukan' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('ajukan')}
                >
                    <i className="bi bi-send-plus-fill me-3"></i> Ajukan Bantuan
                </button>
                
                <button 
                    className={`nav-item ${activeTab === 'profil' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('profil')}
                >
                    <i className="bi bi-person-badge-fill me-3"></i> Profil Warga
                </button>
                
                <button 
                    className={`nav-item d-flex justify-content-between ${activeTab === 'notifikasi' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('notifikasi')}
                >
                    <span><i className="bi bi-bell-fill me-3"></i> Notifikasi</span>
                    {notifikasiList.filter(n => n.is_read == 0).length > 0 && (
                        <span className="badge bg-danger rounded-pill">
                            {notifikasiList.filter(n => n.is_read == 0).length}
                        </span>
                    )}
                </button>

                {/* Tombol Logout di Bawah Sidebar */}
                <div className="mt-auto pt-4 border-top">
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <i className="bi bi-box-arrow-left me-3"></i> Keluar Aplikasi
                    </button>
                </div>
            </aside>

            {/* --- KONTEN KANAN --- */}
            <main className="main-content">
                
                {/* Header Kecil di Atas Konten */}
                <header className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold text-dark mb-0">
                            {activeTab === 'beranda' && "Dashboard Warga"}
                            {activeTab === 'ajukan' && "Formulir Pengajuan"}
                            {activeTab === 'profil' && "Profil Saya"}
                            {activeTab === 'notifikasi' && "Pusat Notifikasi"}
                        </h2>
                        <p className="text-muted small mb-0">Selamat datang kembali di panel warga.</p>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3 bg-white px-4 py-2 rounded-pill shadow-sm">
                        <div className="text-end lh-1">
                            <span className="d-block fw-bold text-dark">{user.name}</span>
                            <small className="user-role-text">Warga</small>
                        </div>
                        <div className="profile-avatar-container">
                            <i className="bi bi-person-fill"></i>
                        </div>
                    </div>
                </header>

                {/* --- AREA KONTEN DINAMIS --- */}
                <div className="content-body">
                    {activeTab === 'beranda' && (
                        <BerandaWarga 
                            loading={loading} 
                            bansosData={bansosData} 
                            user={user} 
                            setActiveTab={setActiveTab} 
                        />
                    )}

                    {activeTab === 'ajukan' && (
                        <AjukanBantuan 
                            user={user} 
                            jenisBansos={jenisBansos} 
                            setJenisBansos={setJenisBansos} 
                            daftarProgram={daftarProgram} 
                            alasan={alasan} 
                            setAlasan={setAlasan} 
                            isSubmitting={isSubmitting} 
                            handleSubmitPengajuan={handleSubmitPengajuan} 
                        />
                    )}

                    {activeTab === 'profil' && (
                         <ProfilWarga 
                            user={user} 
                            formData={formData} 
                            handleProfileChange={handleProfileChange} 
                            isUnemployed={isUnemployed}
                            handleUnemployedChange={handleUnemployedChange}
                            previewUrl={previewUrl} 
                            onFileChange={onFileChange}
                            handleUpdateProfile={handleUpdateProfile} 
                            isSubmitting={isSubmitting}
                          />
                    )}

                    {activeTab === 'notifikasi' && (
                        <div className="notification-card">
                            <div className="card-body p-0">
                                {notifikasiList.length > 0 ? (
                                    <ul className="list-group list-group-flush rounded-3">
                                        {notifikasiList.map((notif) => (
                                            <li key={notif.id} className={`list-group-item notif-item ${notif.is_read ? 'notif-read' : 'notif-unread'}`}>
                                                <div className="d-flex w-100 justify-content-between mb-1">
                                                    <h6 className="mb-1 fw-bold text-dark">Pesan Sistem</h6>
                                                    <small className="text-muted">
                                                        {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </small>
                                                </div>
                                                <p className="mb-1 text-secondary">{notif.pesan}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="empty-state-box">
                                        <div className="empty-state-icon">
                                            <i className="bi bi-bell-slash"></i>
                                        </div>
                                        <h6 className="text-muted">Tidak ada notifikasi baru</h6>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default HomeWarga;