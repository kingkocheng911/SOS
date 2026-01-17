import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileCheck, 
  UserCheck, 
  XCircle, 
  Info, 
  Users, 
  Fingerprint, 
  ClipboardList,
  Search
} from "lucide-react";
import DetailWarga from "../pagesadmin/DetailWarga"; 
import "./Persetujuan.css"; 

function Persetujuan() {
    const [approvalList, setApprovalList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWarga, setSelectedWarga] = useState(null); 
    const [selectedIds, setSelectedIds] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const token = localStorage.getItem("token"); 

    useEffect(() => {
        fetchDataPersetujuan();
    }, []);

    const fetchDataPersetujuan = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/seleksi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const rawData = response.data.data || [];
            
            // Filter: Hanya status 1 (Menunggu) DAN bukan akun Admin/Kades
            const pending = rawData.filter(item => {
                const nama = (item.nama_warga || item.warga?.nama || "").toLowerCase();
                const isPending = String(item.status) === "1";
                const isNotStaff = !nama.includes("admin") && !nama.includes("kades") && !nama.includes("desa");
                return isPending && isNotStaff;
            });
            
            setApprovalList(pending);
            setSelectedIds([]); 
        } catch (error) {
            console.error("Gagal ambil data persetujuan:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter pencarian untuk memudahkan Kades
    const filteredList = approvalList.filter(item => 
        (item.nama_warga || item.warga?.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nik || item.warga?.nik || "").includes(searchTerm)
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = filteredList.map(item => item.id);
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
            alert("Beberapa data gagal diproses.");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="persetujuan-container p-4"
        >
            {/* Header Page */}
            <div className="page-header mb-4 d-flex justify-content-between align-items-end">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Persetujuan Kepala Desa</h2>
                    <p className="text-muted mb-0">Validasi dan verifikasi kelayakan warga penerima bantuan.</p>
                </div>
                <div className="stats-badge shadow-sm">
                    <Users size={18} className="text-primary" />
                    <span>{approvalList.length} Menunggu Verifikasi</span>
                </div>
            </div>

            <div className="custom-card-navy shadow-sm border-0">
                {/* Header Card dengan Gradient Navy */}
                <div className="custom-card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <FileCheck size={22} className="text-white" />
                        <h5 className="m-0 text-white fw-bold">Daftar Tunggu Persetujuan</h5>
                    </div>

                    {/* Tombol Aksi Massal dengan Animasi */}
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="d-flex gap-2"
                            >
                                <button onClick={() => handleBulkAction(2)} className="btn-action-success">
                                    <UserCheck size={18} /> Setujui ({selectedIds.length})
                                </button>
                                <button onClick={() => handleBulkAction(3)} className="btn-action-danger">
                                    <XCircle size={18} /> Tolak
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="custom-card-body p-0">
                    {/* Toolbar Search */}
                    <div className="p-3 border-bottom bg-light d-flex justify-content-end">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Cari Nama atau NIK..." 
                                className="form-control search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3 text-muted fw-medium">Menyinkronkan data...</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="text-center py-5">
                            <Info size={48} className="text-muted mb-3 opacity-50" />
                            <h5 className="text-muted fw-normal">Tidak ada data warga yang perlu divalidasi.</h5>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-modern align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Nama Warga</th>
                                        <th><div className="d-flex align-items-center gap-2"><Fingerprint size={16}/> NIK</div></th>
                                        <th><div className="d-flex align-items-center gap-2"><ClipboardList size={16}/> Program</div></th>
                                        <th className="text-end pe-4">
                                            <div className="d-flex justify-content-end align-items-center gap-2">
                                                <span className="small fw-bold text-muted">PILIH SEMUA</span>
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input custom-checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.map((item) => (
                                        <tr key={item.id} className="row-hoverable">
                                            <td className="ps-4 py-3" onClick={() => setSelectedWarga(item.warga || item)}>
                                                <div className="fw-bold text-dark text-capitalize">
                                                    {item.nama_warga || item.warga?.nama || "Nama Tidak Terdaftar"}
                                                </div>
                                                <div className="detail-trigger">Klik untuk verifikasi profil &raquo;</div>
                                            </td>
                                            <td className="text-secondary font-monospace">
                                                {item.nik || item.warga?.nik || "-"}
                                            </td>
                                            <td>
                                                <span className="badge-program">
                                                    {item.nama_program || item.program_bantuan?.nama_program || "Bantuan"}
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end"> 
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input custom-checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => handleCheckboxChange(item.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="card-footer-custom">
                    Menampilkan <strong>{filteredList.length}</strong> dari {approvalList.length} warga yang menunggu.
                </div>
            </div>

            {/* Modal Detail */}
            {selectedWarga && (
                <DetailWarga 
                    data={selectedWarga} 
                    onClose={() => setSelectedWarga(null)} 
                    readOnly={true} 
                />
            )}
        </motion.div>
    );
}

export default Persetujuan;