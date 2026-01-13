import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function HomeWarga() {
    const navigate = useNavigate();
    
    // --- STATE DATA ---
    const [user, setUser] = useState({});
    const [bansosData, setBansosData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // [BARU] State untuk menyimpan daftar program dari database
    const [daftarProgram, setDaftarProgram] = useState([]); 

    // [BARU] State untuk menyimpan daftar notifikasi
    const [notifikasiList, setNotifikasiList] = useState([]);

    // --- STATE FORM PENGAJUAN ---
    const [jenisBansos, setJenisBansos] = useState(""); 
    const [alasan, setAlasan] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- STATE PROFIL (EDITABLE) ---
    const [alamat, setAlamat] = useState("");
    const [noTelp, setNoTelp] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // --- STATE NAVIGASI (TAB AKTIF) ---
    const [activeTab, setActiveTab] = useState("beranda");

    // --- 1. FETCH DATA SAAT LOAD ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || storedUser.role !== 'warga') {
            navigate('/login');
            return;
        }

        setUser(storedUser);
        setAlamat(storedUser.alamat || "");
        setNoTelp(storedUser.no_telp || "");
        
        // Panggil semua data yang dibutuhkan
        fetchStatusBansos(token);
        fetchProgramBantuan(token);
        fetchNotifikasi(token); // [BARU] Panggil notifikasi
    }, [navigate]);

    const fetchStatusBansos = async (token) => {
        try {
            const response = await axios.get("http://localhost:8000/api/warga/cek-status", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === true) {
                setBansosData(response.data.data);
            } else {
                setBansosData(null);
            }
        } catch (error) {
            console.error("Error fetching status:", error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProgramBantuan = async (token) => {
        try {
            const response = await axios.get("http://localhost:8000/api/program", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setDaftarProgram(response.data.data);

            if (response.data.data.length > 0) {
                setJenisBansos(response.data.data[0].nama_program);
            }
        } catch (error) {
            console.error("Gagal memuat program bantuan:", error);
        }
    };

    // [BARU] Fungsi mengambil notifikasi dari backend
    const fetchNotifikasi = async (token) => {
        try {
            const response = await axios.get("http://localhost:8000/api/notifikasi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Pastikan response data ada
            if (response.data && response.data.data) {
                setNotifikasiList(response.data.data);
            }
        } catch (error) {
            console.error("Gagal memuat notifikasi:", error);
        }
    };

    // --- 2. FUNGSI UPDATE PROFIL & UPLOAD GANTI FOTO ---
    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        const formData = new FormData();
        formData.append("alamat", alamat);
        formData.append("no_telp", noTelp);
        if (selectedFile) {
            formData.append("foto", selectedFile);
        }

        try {
            setIsSubmitting(true);
            const response = await axios.post("http://localhost:8000/api/user/update", formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data" 
                }
            });

            alert(response.data.message);
            const updatedUser = response.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setSelectedFile(null);
        } catch (error) {
            console.error("Update error:", error);
            alert(error.response?.data?.message || "Gagal memperbarui profil");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 3. FUNGSI KIRIM PENGAJUAN ---
    const handleSubmitPengajuan = async (e) => {
        e.preventDefault();
        
        if (!jenisBansos) {
            alert("Harap pilih jenis bantuan terlebih dahulu.");
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post("http://localhost:8000/api/warga/ajukan", {
                jenis_bansos: jenisBansos,
                alasan: alasan
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Berhasil! " + response.data.pesan);
            setAlasan(""); 
            setActiveTab("beranda"); 
            fetchStatusBansos(token); 
        } catch (error) {
            console.error("Error submitting:", error);
            alert(error.response?.data?.message || "Gagal mengirim pengajuan. Coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // --- 4. KOMPONEN KONTEN ---
    
    const renderBeranda = () => {
        if (loading) return <div className="p-5 text-center">Memuat data...</div>;

        if (!bansosData) {
            return (
                <div className="card shadow-sm border-0 mb-4 text-center p-5">
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" width="80" className="mb-3 opacity-50" alt="kosong"/>
                    <h5 className="text-muted">Belum Ada Pengajuan</h5>
                    <p className="text-muted small">Halo {user.name}, NIK Anda belum terdaftar di bantuan periode ini.</p>
                    <button className="btn btn-success mt-2" onClick={() => setActiveTab("ajukan")}>
                        <i className="bi bi-plus-circle me-2"></i> Ajukan Sekarang
                    </button>
                </div>
            );
        }

        let badgeClass = "bg-warning"; 
        let statusText = "Sedang Diproses";
        const dbStatus = bansosData.status ? bansosData.status.toLowerCase() : "";

        if (dbStatus === 'approved' || dbStatus === 'disetujui') { badgeClass = "bg-success"; statusText = "Disetujui"; }
        else if (dbStatus === 'rejected' || dbStatus === 'ditolak') { badgeClass = "bg-danger"; statusText = "Ditolak"; }

        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white fw-bold py-3">Status Bantuan Anda</div>
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h4 className={`fw-bold ${badgeClass.replace('bg-', 'text-')}`}>
                                {statusText}
                            </h4>
                            <h5 className="mt-2 fw-bold">{bansosData.jenis_bansos}</h5>
                            <p className="text-muted mb-0">Atas Nama: {bansosData.nama || user.name}</p>
                        </div>
                        <div className="col-md-4 text-end">
                            <span className={`badge ${badgeClass} fs-6 px-3 py-2 rounded-pill`}>{statusText}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAjukan = () => {
        const profilLengkap = user.alamat && user.no_telp;

        if (!profilLengkap) {
            return (
                <div className="card shadow-sm border-0 mb-4 text-center p-5">
                    <i className="bi bi-person-exclamation text-warning display-1 mb-3"></i>
                    <h4 className="fw-bold">Profil Belum Lengkap!</h4>
                    <p className="text-muted">Anda wajib melengkapi Alamat & No. HP di menu Profil terlebih dahulu.</p>
                    <button className="btn btn-primary px-4 fw-bold" onClick={() => setActiveTab("profil")}>
                        Lengkapi Profil Sekarang
                    </button>
                </div>
            );
        }

        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white fw-bold py-3">Formulir Pengajuan Bantuan</div>
                <div className="card-body">
                    <form onSubmit={handleSubmitPengajuan}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Nama Lengkap</label>
                            <input type="text" className="form-control bg-light" value={user.name} readOnly />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">NIK</label>
                            <input type="text" className="form-control bg-light" value={user.nik} readOnly />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label fw-bold">Jenis Bantuan</label>
                            <select 
                                className="form-select" 
                                value={jenisBansos} 
                                onChange={(e) => setJenisBansos(e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Jenis Bantuan --</option>
                                {daftarProgram.map((program) => (
                                    <option key={program.id} value={program.nama_program}>
                                        {program.nama_program}
                                    </option>
                                ))}
                            </select>
                            {daftarProgram.length === 0 && (
                                <small className="text-danger">*Belum ada program bantuan yang tersedia.</small>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Alasan Pengajuan</label>
                            <textarea 
                                className="form-control" 
                                rows="3" 
                                placeholder="Jelaskan kondisi ekonomi..."
                                value={alasan}
                                onChange={(e) => setAlasan(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={isSubmitting}>
                            {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const renderProfil = () => (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between">
                <span>Profil Saya</span>
                <span className="badge bg-info">Warga Desa</span>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-4 text-center mb-3">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '120px', height: '120px', overflow: 'hidden', border: '2px solid #ddd'}}>
                            {previewUrl || user.foto ? (
                                <img 
                                    src={previewUrl || `http://localhost:8000/uploads/profil/${user.foto}`} 
                                    alt="Profil" 
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                />
                            ) : (
                                <i className="bi bi-person-fill fs-1 text-secondary"></i>
                            )}
                        </div>
                        <input type="file" id="upload-foto" className="d-none" onChange={onFileChange} accept="image/*" />
                        <label htmlFor="upload-foto" className="btn btn-outline-primary btn-sm w-100">Ganti Foto</label>
                    </div>
                    <div className="col-md-8">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-2">
                                <label className="small fw-bold">Nama Sesuai KTP</label>
                                <input type="text" className="form-control form-control-sm bg-light" value={user.name} readOnly />
                            </div>
                            <div className="mb-2">
                                <label className="small fw-bold">NIK</label>
                                <input type="text" className="form-control form-control-sm bg-light" value={user.nik} readOnly />
                            </div>
                            <div className="mb-2">
                                <label className="small fw-bold text-primary">Alamat Lengkap *</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm border-primary" 
                                    value={alamat} 
                                    onChange={(e) => setAlamat(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-primary">No. Handphone (WhatsApp) *</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm border-primary" 
                                    value={noTelp} 
                                    onChange={(e) => setNoTelp(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-success btn-sm px-4 fw-bold" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    // [BARU] RENDER NOTIFIKASI DINAMIS (REAL)
    const renderNotifikasi = () => (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold py-3">
                Notifikasi Terbaru
                {notifikasiList.length > 0 && (
                    <span className="badge bg-danger ms-2">{notifikasiList.length}</span>
                )}
            </div>
            <ul className="list-group list-group-flush">
                {notifikasiList.length === 0 ? (
                    <li className="list-group-item text-center text-muted py-4">
                        <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
                        Belum ada notifikasi baru.
                    </li>
                ) : (
                    notifikasiList.map((notif) => (
                        <li key={notif.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="fw-bold mb-1">{notif.judul}</h6>
                                    <p className="mb-1 small text-dark">{notif.pesan}</p>
                                </div>
                                <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                    {new Date(notif.created_at).toLocaleDateString("id-ID", {
                                        day: 'numeric', month: 'short', year: 'numeric', 
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </small>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );

    return (
        <div className="min-vh-100 bg-light">
            <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top">
                <div className="container">
                    <span className="navbar-brand fw-bold"><i className="bi bi-building me-2"></i> Portal Desa</span>
                    <div className="d-flex text-white align-items-center">
                        <span className="me-3 d-none d-md-block small">Halo, {user.name}</span>
                        <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-3 mb-4">
                        <div className="card shadow-sm border-0">
                            <div className="list-group list-group-flush">
                                <button className={`list-group-item list-group-item-action py-3 ${activeTab === 'beranda' ? 'active bg-success border-success' : ''}`} onClick={() => setActiveTab('beranda')}>
                                    <i className="bi bi-house-door me-2"></i> Beranda
                                </button>
                                <button className={`list-group-item list-group-item-action py-3 ${activeTab === 'ajukan' ? 'active bg-success border-success' : ''}`} onClick={() => setActiveTab('ajukan')}>
                                    <i className="bi bi-file-earmark-plus me-2"></i> Ajukan Bantuan
                                </button>
                                <button className={`list-group-item list-group-item-action py-3 ${activeTab === 'profil' ? 'active bg-success border-success' : ''}`} onClick={() => setActiveTab('profil')}>
                                    <i className="bi bi-person-badge me-2"></i> Profil Warga
                                </button>
                                <button className={`list-group-item list-group-item-action py-3 ${activeTab === 'notifikasi' ? 'active bg-success border-success' : ''}`} onClick={() => setActiveTab('notifikasi')}>
                                    <i className="bi bi-bell me-2"></i> Notifikasi
                                    {notifikasiList.length > 0 && (
                                        <span className="badge bg-danger ms-2 rounded-pill small">{notifikasiList.length}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-9">
                        {activeTab === 'beranda' && renderBeranda()}
                        {activeTab === 'ajukan' && renderAjukan()}
                        {activeTab === 'profil' && renderProfil()}
                        {activeTab === 'notifikasi' && renderNotifikasi()}

                        {activeTab === 'beranda' && (
                            <div className="row mt-2">
                                <div className="col-md-6 mb-3">
                                    <div className="card shadow-sm border-0 h-100 border-start border-primary border-4">
                                        <div className="card-body">
                                            <h6 className="fw-bold text-primary"><i className="bi bi-info-circle me-2"></i> Syarat Pengambilan</h6>
                                            <ul className="small text-muted ps-3 mb-0">
                                                <li>KTP & KK Asli (Sesuai NIK).</li>
                                                <li>Membawa surat undangan desa.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="card shadow-sm border-0 h-100 border-start border-danger border-4">
                                        <div className="card-body">
                                            <h6 className="fw-bold text-danger"><i className="bi bi-megaphone me-2"></i> Pusat Pengaduan</h6>
                                            <button className="btn btn-outline-danger btn-sm w-100 fw-bold">Buat Laporan</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeWarga;