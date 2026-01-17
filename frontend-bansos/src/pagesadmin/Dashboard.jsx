import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css"; 
import DetailWarga from './DetailWarga';

const DashboardAdmin = () => {
    const [selectedWarga, setSelectedWarga] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // --- STATE TABEL ---
    const [activeTable, setActiveTable] = useState("warga"); 
    const [penyaluranList, setPenyaluranList] = useState([]); 

    const [stats, setStats] = useState({
        totalWarga: 0,
        bantuanDisalurkan: 0
    });
    const [wargaList, setWargaList] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleRowClick = (warga) => {
        setSelectedWarga(warga);
        setShowModal(true);
        setIsEditing(false);
    };

    const handleUpdateFunction = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8000/api/warga/${selectedWarga.id}`, selectedWarga, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Data berhasil diperbarui!");
            setShowModal(false);
            window.location.reload(); 
        } catch (error) {
            console.error("Gagal update data:", error);
        }
    };

    const handleDeleteFunction = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:8000/api/warga/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Data berhasil dihapus!");
                setShowModal(false);
                setWargaList(wargaList.filter(w => w.id !== id));
            } catch (error) {
                console.error("Gagal menghapus data:", error);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const responseWarga = await axios.get("http://localhost:8000/api/warga", config);
                const responsePenyaluran = await axios.get("http://localhost:8000/api/penyaluran", config);

                const dataWarga = responseWarga.data.data || [];
                const dataPenyaluran = responsePenyaluran.data.data || [];

                setWargaList(dataWarga); 
                setPenyaluranList(dataPenyaluran); 
                
                setStats({
                    totalWarga: dataWarga.length,
                    bantuanDisalurkan: dataPenyaluran.length
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setWargaList([]); 
                setPenyaluranList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container-fluid py-4 px-4">
            <div className="d-flex align-items-center mb-5">
                <div className="bg-primary p-2 rounded-3 me-3 shadow-sm">
                    <i className="bi bi-speedometer2 text-white fs-4"></i>
                </div>
                <h2 className="m-0 text-dark fw-bold">Dashboard Admin</h2>
            </div>

            {/* Bagian Kartu Statistik */}
            <div className="row mb-5">
                <div className="col-md-6 mb-4" onClick={() => setActiveTable("warga")} style={{ cursor: 'pointer' }}>
                    <div className={`card ${activeTable === "warga" ? "shadow-lg border-primary" : "shadow-sm"} bg-primary text-white h-100`}>
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-uppercase small fw-bold mb-2 opacity-75">Total Warga Terdaftar</p>
                                <h2 className="mb-0 fw-bold display-6">{loading ? "..." : stats.totalWarga}</h2>
                            </div>
                            <div className="icon-box p-3 bg-white bg-opacity-25 rounded-circle">
                                <i className="bi bi-people-fill fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4" onClick={() => setActiveTable("penyaluran")} style={{ cursor: 'pointer' }}>
                    <div className={`card ${activeTable === "penyaluran" ? "shadow-lg border-success" : "shadow-sm"} bg-success text-white h-100`}>
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-uppercase small fw-bold mb-2 opacity-75">Bantuan Disalurkan</p>
                                <h2 className="mb-0 fw-bold display-6">{loading ? "..." : stats.bantuanDisalurkan}</h2>
                            </div>
                            <div className="icon-box p-3 bg-white bg-opacity-25 rounded-circle">
                                <i className="bi bi-box2-heart-fill fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bagian Tabel Dinamis */}
            <div className="row">
                <div className="col-12">
                    <div className="table-wrapper shadow-sm border-0">
                        <div className="table-header p-4 border-bottom d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <i className={`bi ${activeTable === "warga" ? "bi-person-lines-fill" : "bi-clock-history"} me-3 text-primary fs-4`}></i>
                                <h5 className="mb-0 fw-bold text-dark">
                                    {activeTable === "warga" ? "Data Warga Terbaru" : "Riwayat Penyaluran"}
                                </h5>
                            </div>
                            <span className="badge bg-light text-primary px-3 py-2 border rounded-pill fw-bold">
                                {activeTable === "warga" ? wargaList.length : penyaluranList.length} Total Data
                            </span>
                        </div>

                        <div className="table-responsive">
                            <table className="custom-table table table-hover mb-0">
                                <thead>
                                    {activeTable === "warga" ? (
                                        <tr>
                                            <th>Nama Warga</th>
                                            <th>NIK</th>
                                            <th>Pekerjaan</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th>Nama Penerima</th>
                                            <th>Program</th>
                                            <th>Tanggal Terima</th>
                                            <th>Keterangan</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {activeTable === "warga" ? (
                                        wargaList.length > 0 ? (
                                            wargaList.map((warga, index) => (
                                                <tr key={index} onClick={() => handleRowClick(warga)} style={{ cursor: 'pointer' }}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-sm me-3 bg-light rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" style={{width:'35px', height:'35px'}}>
                                                                {(warga.nama || warga.name || "A").charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="fw-bold">{warga.nama || warga.name}</span>
                                                        </div>
                                                    </td>
                                                    <td><code className="text-muted">{warga.nik}</code></td>
                                                    <td>{warga.pekerjaan || "-"}</td>
                                                    <td className="text-center"><span className="badge bg-success">Aktif</span></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="text-center py-5 text-muted">Belum ada data warga terdaftar.</td></tr>
                                        )
                                    ) : (
                                        penyaluranList.length > 0 ? (
                                            penyaluranList.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="fw-bold text-dark">
                                                        {item.seleksi?.warga?.nama || item.seleksi?.warga?.name || "Anonim"}
                                                    </td>
                                                    <td>
                                                        <span className="text-primary fw-medium">
                                                            {item.seleksi?.program_bantuan?.nama_program || "Bantuan"}
                                                        </span>
                                                    </td>
                                                    <td><i className="bi bi-calendar3 me-2 text-muted"></i>{item.tanggal_penyaluran}</td>
                                                    <td><small className="text-muted">{item.keterangan || "-"}</small></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="text-center py-5 text-muted">Belum ada riwayat penyaluran.</td></tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <DetailWarga 
                    data={selectedWarga}
                    setData={setSelectedWarga}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onClose={() => setShowModal(false)}
                    onUpdate={handleUpdateFunction}
                    onHapus={handleDeleteFunction}
                    readOnly={false}
                />
            )}
        </div>
    );
};

export default DashboardAdmin;