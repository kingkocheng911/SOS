import { useEffect, useState } from "react";
import axios from "axios";
import DetailWarga from "../pagesadmin/DetailWarga"; 

// IMPORT FILE CSS DISINI
import "./Persetujuan.css"; 

function Persetujuan() {
    const [approvalList, setApprovalList] = useState([]);
    const [selectedWarga, setSelectedWarga] = useState(null); 
    const [selectedIds, setSelectedIds] = useState([]); 
    const token = localStorage.getItem("token"); 

    useEffect(() => {
        fetchDataPersetujuan();
    }, []);

    const fetchDataPersetujuan = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/seleksi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const allData = Array.isArray(response.data) ? response.data : (response.data.data || []);
            const pending = allData.filter(item => item.status == 1); // 1 = Menunggu
            
            setApprovalList(pending);
            setSelectedIds([]); 
        } catch (error) {
            console.error("Gagal ambil data persetujuan", error);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = approvalList.map(item => item.id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (newStatus) => {
        const actionName = newStatus === 2 ? "Menyetujui" : "Menolak";
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Yakin ingin ${actionName} ${selectedIds.length} data yang dipilih?`)) return;

        try {
            await Promise.all(selectedIds.map(id => 
                axios.put(`http://127.0.0.1:8000/api/seleksi/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } })
            ));
            
            alert(`Berhasil ${actionName} ${selectedIds.length} data!`);
            fetchDataPersetujuan();
        } catch (error) {
            console.error("Bulk Error:", error);
            alert("Beberapa data gagal diproses.");
        }
    };

    return (
        <div className="container-fluid px-4 mt-4">
            <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                
                {/* Header Menggunakan Class CSS */}
                <div className="card-header persetujuan-header p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-1 fw-bold">
                            <i className="bi bi-file-earmark-check me-2"></i>
                            Persetujuan Kepala Desa
                        </h4>
                        <small className="text-white-50">Validasi data warga sebelum penyaluran bantuan.</small>
                    </div>
                    
                    {/* Tombol Aksi Massal */}
                    {selectedIds.length > 0 && (
                        <div className="d-flex gap-2">
                            <button onClick={() => handleBulkAction(2)} className="btn btn-light text-primary fw-bold shadow-sm px-3">
                                <i className="bi bi-check-lg me-1"></i> Setujui ({selectedIds.length})
                            </button>
                            
                            <button onClick={() => handleBulkAction(3)} className="btn btn-outline-light fw-bold px-3 btn-hover-danger">
                                <i className="bi bi-x-lg me-1"></i> Tolak ({selectedIds.length})
                            </button>
                        </div>
                    )}
                </div>

                <div className="card-body p-0">
                    {approvalList.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-3">
                                <i className="bi bi-clipboard-check empty-state-icon"></i>
                            </div>
                            <h5 className="text-muted fw-normal">Tidak ada data yang perlu persetujuan saat ini.</h5>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-secondary small text-uppercase">
                                    <tr>
                                        <th className="ps-4 py-3">Nama Warga</th>
                                        <th className="py-3">NIK</th>
                                        <th className="py-3">Program Bantuan</th>
                                        <th className="text-end pe-4 py-3 col-action-width">
                                            <div className="d-flex justify-content-end align-items-center gap-2">
                                                <span className="fw-bold small">Pilih Semua</span>
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input border-secondary m-0 custom-checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={selectedIds.length === approvalList.length && approvalList.length > 0}
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvalList.map((item) => (
                                        <tr 
                                            key={item.id} 
                                            onClick={() => setSelectedWarga(item.warga || item)} 
                                            className="cursor-pointer"
                                        >
                                            <td className="ps-4 py-3">
                                                <div className="fw-bold text-dark">{item.warga?.nama || item.warga?.name || "Tanpa Nama"}</div>
                                                <small className="text-muted">Klik untuk detail</small>
                                            </td>
                                            <td className="text-secondary font-monospace">{item.warga?.nik || "-"}</td>
                                            <td>
                                                <span className="badge-custom-blue">
                                                    {item.program_bantuan?.nama_program || "Bantuan"}
                                                </span>
                                            </td>
                                            
                                            <td className="pe-4 text-end" onClick={(e) => e.stopPropagation()}> 
                                                <div className="d-flex justify-content-end">
                                                    <input 
                                                        type="checkbox" 
                                                        className="form-check-input border-secondary m-0 custom-checkbox-lg"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => handleCheckboxChange(item.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="card-footer bg-light small text-muted text-center py-3 border-top-0">
                    Menampilkan {approvalList.length} data yang menunggu persetujuan.
                </div>
            </div>

            {selectedWarga && (
                <DetailWarga 
                    data={selectedWarga} 
                    onClose={() => setSelectedWarga(null)} 
                    readOnly={true} 
                />
            )}
        </div>
    );
}

export default Persetujuan;