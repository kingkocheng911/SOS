import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  History, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Info,
  ChevronRight,
  CheckSquare 
} from "lucide-react";
import "./Penyaluran.css";

function Penyaluran() {
    const [listSiapSalur, setListSiapSalur] = useState([]); 
    const [riwayatSalur, setRiwayatSalur] = useState([]);   
    
    // State untuk menampung BANYAK ID
    const [selectedIds, setSelectedIds] = useState([]);
    
    const [tanggalSalur, setTanggalSalur] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/penyaluran");
            setListSiapSalur(response.data.siap_salur || []);
            setRiwayatSalur(response.data.riwayat || []);
        } catch (error) {
            console.error("Gagal ambil data:", error);
        }
    };

    // --- LOGIC CHECKLIST ---
    const handleCheckboxChange = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id); // Uncheck
            } else {
                return [...prev, id]; // Check
            }
        });
    };

    const handleSelectAll = () => {
        // Filter dulu data yang valid (bukan admin/kades)
        const validItems = listSiapSalur.filter(item => {
            const nama = (item.warga?.nama || item.warga?.name || "").toLowerCase();
            return !nama.includes("admin") && !nama.includes("desa") && !nama.includes("kepala");
        });

        if (selectedIds.length === validItems.length) {
            setSelectedIds([]); // Uncheck Semua
        } else {
            setSelectedIds(validItems.map(item => item.id)); // Check Semua
        }
    };
    // -----------------------

    const handleSimpan = async (e) => {
        e.preventDefault();
        
        // Validasi Array
        if (selectedIds.length === 0) {
            alert("Pilih minimal satu warga!");
            return;
        }

        setIsLoading(true);
        try {
            // Kirim Array 'seleksi_ids' ke Backend
            await axios.post("http://127.0.0.1:8000/api/penyaluran", {
                seleksi_ids: selectedIds, 
                tanggal_penyaluran: tanggalSalur,
                keterangan: keterangan
            });

            alert("Bantuan berhasil disalurkan!");
            
            // Reset Form
            setSelectedIds([]);
            setTanggalSalur("");
            setKeterangan("");
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat menyimpan.");
        }
        setIsLoading(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="penyaluran-container"
        >
            <div className="page-header mb-4">
                <h2 className="fw-bold text-dark">Penyaluran Bantuan</h2>
                <p className="text-muted">Kelola distribusi bantuan kepada warga yang telah disetujui.</p>
            </div>

            {/* FORM INPUT PENYALURAN */}
            <div className="custom-card-navy mb-5 shadow-sm">
                <div className="custom-card-header">
                    <div className="d-flex align-items-center gap-2">
                        <Send size={20} className="text-white" />
                        <h5 className="m-0 text-white">Input Penyaluran Baru</h5>
                    </div>
                </div>
                <div className="custom-card-body">
                    <form onSubmit={handleSimpan}>
                        <div className="row g-4">
                            
                            {/* BAGIAN CHECKLIST PENERIMA */}
                            <div className="col-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="custom-label mb-0">
                                        <CheckSquare size={16} className="me-1 inline-icon"/> 
                                        Pilih Penerima ({selectedIds.length})
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={handleSelectAll}
                                        className="btn-text-only"
                                    >
                                        {selectedIds.length > 0 && selectedIds.length === listSiapSalur.length ? 'Batal Pilih' : 'Pilih Semua'}
                                    </button>
                                </div>
                                
                                <div className="checklist-box custom-input">
                                    {listSiapSalur.length === 0 ? (
                                        <div className="text-center text-muted py-4 small">
                                            Tidak ada warga siap salur
                                        </div>
                                    ) : (
                                        listSiapSalur
                                        .filter(item => {
                                            const nama = (item.warga?.nama || item.warga?.name || "").toLowerCase();
                                            return !nama.includes("admin") && !nama.includes("desa") && !nama.includes("kepala");
                                        })
                                        .map((item) => (
                                            <div key={item.id} className="checklist-item">
                                                <input
                                                    type="checkbox"
                                                    id={`check-${item.id}`}
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => handleCheckboxChange(item.id)}
                                                    className="form-check-input mt-0"
                                                />
                                                <label htmlFor={`check-${item.id}`} className="checklist-label d-flex align-items-center flex-wrap">
                                                    {/* 1. Nama Warga (Tebal) */}
                                                    <span className="fw-bold text-dark">
                                                        {item.warga?.nama || item.warga?.name}
                                                    </span>
                                                    
                                                    {/* 2. Icon Panah (Bukan teks ">") */}
                                                    <ChevronRight size={14} className="text-primary mx-1" />
                                                    
                                                    {/* 3. Nama Program (Kecil & Abu-abu) */}
                                                    <span className="text-muted small">
                                                        {item.program_bantuan?.nama_program}
                                                    </span>
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* BAGIAN TANGGAL & KETERANGAN */}
                            <div className="col-md-7">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="custom-label">Tanggal Penyaluran</label>
                                        <div className="input-with-icon">
                                            <Calendar className="input-icon-left" size={18} />
                                            <input 
                                                type="date" 
                                                className="form-control custom-input"
                                                value={tanggalSalur}
                                                onChange={(e) => setTanggalSalur(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="custom-label">Keterangan Barang</label>
                                        <div className="input-with-icon">
                                            <Package className="input-icon-left" size={18} />
                                            <input 
                                                type="text" 
                                                className="form-control custom-input"
                                                placeholder="Contoh: Beras 10kg"
                                                value={keterangan}
                                                onChange={(e) => setKeterangan(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 d-flex align-items-end mt-4">
                                        <button type="submit" className="btn-modern-primary w-100" disabled={isLoading}>
                                            {isLoading ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                "Simpan Data Penyaluran"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            </div>

            {/* TABEL RIWAYAT */}
            <div className="custom-card-navy shadow-sm">
                <div className="custom-card-header table-header-bg">
                    <div className="d-flex align-items-center gap-2">
                        <History size={20} className="text-white" />
                        <h5 className="m-0 text-white">Riwayat Penyaluran</h5>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-modern-style align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">No</th>
                                <th>Nama Warga</th>
                                <th>Program</th>
                                <th>Tanggal Terima</th>
                                <th>Keterangan</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {riwayatSalur.length > 0 ? (
                                    riwayatSalur.map((item, index) => (
                                        <motion.tr 
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td className="ps-4 text-muted fw-bold">{index + 1}</td>
                                            <td className="fw-bold text-dark">
                                                {item.nama_warga || item.seleksi?.warga?.nama || item.seleksi?.warga?.name || "Data Warga Terhapus"}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-1">
                                                    <ChevronRight size={14} className="text-primary" />
                                                    {item.nama_program || item.seleksi?.program_bantuan?.nama_program || "Bantuan"}
                                                </div>
                                            </td>
                                            <td>{item.tanggal_penyaluran}</td>
                                            <td className="text-muted">{item.keterangan}</td>
                                            <td className="text-center">
                                                <span className="badge-status-success">
                                                    <CheckCircle2 size={14} /> Tersalurkan
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <Info size={40} className="text-light mb-2 d-block mx-auto"/>
                                            <span className="text-muted">Belum ada data penyaluran.</span>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

export default Penyaluran;