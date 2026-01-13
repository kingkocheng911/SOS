import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

function HomeWarga() {
    // --- STATE ---
    const [statusBantuan, setStatusBantuan] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Data user dummy jika localStorage kosong (biar tidak error saat tes)
    const user = JSON.parse(localStorage.getItem("user")) || { nama: "Warga Test", id: 0 };

    useEffect(() => {
        if (user.id) checkStatusBantuan();
        else setLoading(false);
    }, []);

    const checkStatusBantuan = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/seleksi");
            const allData = Array.isArray(response.data) ? response.data : (response.data.data || []);
            const myData = allData.find(item => item.warga_id == user.id);
            setStatusBantuan(myData);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/"; 
    };

    // --- TAMPILAN (Sesuai Sketsa "Struktur Layout Web") ---
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-secondary">
            {/* CONTAINER UTAMA (KOTAK HITAM DI SKETSA) */}
            <div className="container bg-dark text-white p-0 shadow-lg" style={{ maxWidth: "900px", minHeight: "600px", border: "1px solid #444" }}>
                
                {/* 1. HEADER (Bagian Atas) */}
                <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-0 fw-bold font-monospace">| Sistem Bantuan Warga Desa</h4>
                    </div>
                    <div className="font-monospace">
                        | Halo, <span className="text-info">{user.nama}</span> 
                        <span 
                            onClick={handleLogout} 
                            style={{cursor: "pointer"}} 
                            className="text-danger ms-3 fw-bold">
                            [ Logout ]
                        </span> |
                    </div>
                </div>

                {/* 2. BODY (Terbagi 2 Kolom: Menu & Konten) */}
                <div className="row g-0">
                    
                    {/* KIRI: MENU LIST (Sesuai Sketsa: Dashboard, Ajukan, dll) */}
                    <div className="col-md-3 border-end border-secondary p-3">
                        <div className="d-flex flex-column gap-3 font-monospace">
                            <div className="p-2 bg-secondary bg-opacity-25 border-start border-4 border-info">
                                | Dashboard
                            </div>
                            <div className="p-2 text-secondary opacity-75">| Ajukan</div>
                            <div className="p-2 text-secondary opacity-75">| Status</div>
                            <div className="p-2 text-secondary opacity-75">| Profil</div>
                            <div className="p-2 text-secondary opacity-75">| Riwayat</div>
                        </div>
                    </div>

                    {/* KANAN: KONTEN UTAMA (Status Bantuan & Info) */}
                    <div className="col-md-9 p-4">
                        
                        {/* JUDUL BAGIAN KANAN */}
                        <h5 className="font-monospace mb-4">| Status Bantuan</h5>

                        {/* KOTAK STATUS (DIVERIFIKASI / DISETUJUI) */}
                        <div className="border border-secondary p-4 mb-4 position-relative" style={{ minHeight: "150px" }}>
                            {/* Garis siku-siku hiasan ala sketsa */}
                            <div style={{ position: "absolute", top: 0, left: 0, width: "20px", height: "20px", borderTop: "2px solid white", borderLeft: "2px solid white"}}></div>
                            <div style={{ position: "absolute", bottom: 0, right: 0, width: "20px", height: "20px", borderBottom: "2px solid white", borderRight: "2px solid white"}}></div>

                            {loading ? (
                                <p>Loading...</p>
                            ) : statusBantuan ? (
                                <div className="text-center">
                                    {/* LOGIKA TAMPILAN STATUS */}
                                    {statusBantuan.status == 1 && (
                                        <>
                                            <h2 className="text-warning">⏳ Diverifikasi</h2>
                                            <p className="mb-0">Mohon tunggu proses admin.</p>
                                        </>
                                    )}
                                    {statusBantuan.status == 2 && (
                                        <>
                                            <h2 className="text-success">✔ Disetujui</h2>
                                            <p className="mb-0 text-info">Siap Salur</p>
                                        </>
                                    )}
                                    {statusBantuan.status == 4 && (
                                        <>
                                            <h2 className="text-primary">📦 Sudah Cair</h2>
                                            <p className="mb-0">Tgl: {statusBantuan.tanggal_penyaluran || "Baru saja"}</p>
                                        </>
                                    )}
                                    
                                    <hr className="border-secondary"/>
                                    <small className="text-muted">Program: {statusBantuan.program_bantuan?.nama_program || "Bansos"}</small>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <h5>[ Belum Ada Pengajuan ]</h5>
                                    <button className="btn btn-outline-light btn-sm mt-2">[ Ajukan Bantuan ]</button>
                                </div>
                            )}
                        </div>

                        {/* INFO PENTING & AKSI CEPAT */}
                        <div className="row font-monospace">
                            <div className="col-md-6">
                                <h6 className="text-info">| Info Penting</h6>
                                <ul className="list-unstyled small text-white-50 ps-2">
                                    <li>• Proses ± 7 hari kerja</li>
                                    <li>• Data harus sesuai KTP</li>
                                    <li>• Cek berkala tiap hari</li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-info">| Pengumuman Desa</h6>
                                <ul className="list-unstyled small text-white-50 ps-2">
                                    <li>• Pendataan s.d 20 Feb</li>
                                    <li>• Verifikasi 22 Feb</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
                {/* END BODY */}

            </div>
        </div>
    );
}

export default HomeWarga;