import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// IMPORT CSS MODULAR
import './HomeWarga.css'; 

// IMPORT KOMPONEN HALAMAN
import BerandaWarga from "./BerandaWarga";
import AjukanBantuan from "./AjukanBantuan";
import ProfilWarga from "./ProfilWarga";
import NotifikasiWarga from "./NotifikasiWarga"; 

function HomeWarga({ page }) { 
    const navigate = useNavigate();
    
    // --- 1. STATE & LOGIKA ---
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : {};
    });

    const [bansosData, setBansosData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [daftarProgram, setDaftarProgram] = useState([]);
    const [notifikasiList, setNotifikasiList] = useState([]); 
    const [jenisBansos, setJenisBansos] = useState("");
    const [alasan, setAlasan] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        alamat: user.alamat || "", 
        no_telp: user.no_telp || "", 
        pekerjaan: user.pekerjaan || "", 
        gaji: user.gaji || "", 
        tanggungan: user.tanggungan || "", 
        foto: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUnemployed, setIsUnemployed] = useState(user.pekerjaan === 'Tidak Bekerja');

    // --- INITIALIZATION ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || storedUser.role !== 'warga') {
            navigate('/login');
            return;
        }

        setUser(storedUser);
        fetchStatusBansos(token);
        fetchProgram(token);
        fetchNotifikasi(token); 
    }, [navigate]);

    useEffect(() => {
        if (user.id) {
            setFormData(prev => ({
                ...prev,
                alamat: user.alamat || "",
                no_telp: user.no_telp || "",
                pekerjaan: user.pekerjaan || "",
                gaji: user.gaji || "",
                tanggungan: user.tanggungan || "",
            }));
            setIsUnemployed(user.pekerjaan === 'Tidak Bekerja');
        }
    }, [user]);

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

    // --- BAGIAN YANG DIEDIT: PERBAIKAN ERROR 422 ---
    const handleSubmitPengajuan = async (e) => {
        e.preventDefault();
        
        if (!jenisBansos || !alasan) {
            alert("Harap pilih program dan isi alasan pengajuan.");
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            // Kita gunakan 'program_id' karena itulah yang diminta oleh backend Anda
            await axios.post("http://127.0.0.1:8000/api/seleksi", {
                warga_id: user.id,
                program_id: jenisBansos, 
                alasan: alasan,
                status: 1
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert("Pengajuan Berhasil Dikirim!");
            setAlasan("");
            fetchStatusBansos(token); 
            navigate("/home"); 
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Menampilkan pesan error spesifik dari backend (misal: "alasan terlalu pendek")
                const validationErrors = error.response.data.errors;
                const messages = Object.values(validationErrors).flat().join("\n");
                alert(`Gagal Validasi:\n${messages}`);
            } else {
                alert(error.response?.data?.message || "Terjadi kesalahan saat mengirim pengajuan.");
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
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setUser(response.data.user);
        } catch (error) {
            alert("Gagal update profil.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-100 animate-fade-in">
            <header className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bold text-dark mb-0">
                        {page === 'beranda' && "Status Bantuan Anda"}
                        {page === 'ajukan' && "Formulir Pengajuan"}
                        {page === 'profil' && "Profil Warga"}
                        {page === 'notifikasi' && "Pusat Notifikasi"}
                    </h2>
                    <p className="text-muted small mb-0">Halo, {user.name || 'Warga'}. Kelola data Anda di sini.</p>
                </div>
                
                <div className="d-flex align-items-center gap-3 bg-white px-3 py-2 rounded-pill shadow-sm border">
                    <div className="text-end lh-1">
                        <span className="d-block fw-bold text-dark small">{user.name}</span>
                        <small className="text-muted" style={{fontSize: '0.7rem'}}>Warga Aktif</small>
                    </div>
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '38px', height: '38px'}}>
                        <i className="bi bi-person-fill fs-5"></i>
                    </div>
                </div>
            </header>

            <div className="content-body">
                {page === 'beranda' && (
                    <BerandaWarga 
                        loading={loading} 
                        bansosData={bansosData} 
                        user={user} 
                    />
                )}
                
                {page === 'ajukan' && (
                    <AjukanBantuan {...{
                        user, 
                        jenisBansos, 
                        setJenisBansos, 
                        daftarProgram, 
                        alasan, 
                        setAlasan, 
                        isSubmitting, 
                        handleSubmitPengajuan
                    }} />
                )}
                
                {page === 'profil' && (
                    <ProfilWarga {...{
                        user, 
                        formData, 
                        handleProfileChange, 
                        isUnemployed, 
                        handleUnemployedChange, 
                        previewUrl, 
                        onFileChange, 
                        handleUpdateProfile, 
                        isSubmitting
                    }} />
                )}

                {page === 'notifikasi' && (
                    <NotifikasiWarga notifikasiList={notifikasiList} />
                )}
            </div>
        </div>
    );
}

export default HomeWarga;