import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Info, 
  CircleDollarSign, 
  Users, 
  ChevronRight,
  Settings2,
  XCircle
} from "lucide-react";
import "./ProgramBantuan.css";

function ProgramBantuan() {
  const [listProgram, setListProgram] = useState([]);
  const [formData, setFormData] = useState({
    nama_program: "",
    deskripsi: "",
    maksimal_penghasilan: "", 
    minimal_tanggungan: ""    
  });

  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modeKelola, setModeKelola] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/program");
      const data = Array.isArray(response.data.data) ? response.data.data : (response.data || []);
      setListProgram(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setFormData({
      nama_program: item.nama_program,
      deskripsi: item.deskripsi || "",
      maksimal_penghasilan: item.maksimal_penghasilan || "",
      minimal_tanggungan: item.minimal_tanggungan || ""
    });
    setEditId(item.id);
    
    // Scroll ke atas otomatis saat klik edit
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    setFormData({ nama_program: "", deskripsi: "", maksimal_penghasilan: "", minimal_tanggungan: "" });
    setEditId(null);
  };

  // --- LOGIC HAPUS DENGAN SWEETALERT ---
  const handleDelete = async () => {
    if(!editId) return;

    // Konfirmasi SweetAlert
    const result = await Swal.fire({
        title: 'Hapus Program?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/program/${editId}`);
            
            // Notifikasi Sukses
            Swal.fire({
                icon: 'success',
                title: 'Terhapus!',
                text: 'Program bantuan berhasil dihapus.',
                timer: 2000,
                showConfirmButton: false
            });

            handleCancel();
            fetchData();
        } catch (error) {
            // Notifikasi Error
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Terjadi kesalahan saat menghapus data.',
            });
        }
    }
  };

  // --- LOGIC SIMPAN DENGAN SWEETALERT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
        maksimal_penghasilan: formData.maksimal_penghasilan || null,
        minimal_tanggungan: formData.minimal_tanggungan || null
      };

      if (editId) {
        await axios.put(`http://127.0.0.1:8000/api/program/${editId}`, payload);
        
        // Notifikasi Edit Sukses
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data program berhasil diperbarui.',
            timer: 2000,
            showConfirmButton: false
        });

      } else {
        await axios.post("http://127.0.0.1:8000/api/program", payload);
        
        // Notifikasi Tambah Sukses
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Program baru berhasil ditambahkan.',
            timer: 2000,
            showConfirmButton: false
        });
      }

      handleCancel();
      fetchData();

    } catch (error) {
      console.error(error);
      // Notifikasi Error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="program-page-container"
    >
      {/* --- SECTION FORMULIR --- */}
      <motion.div 
        layout
        className={`custom-card-navy ${editId ? 'border-edit-active' : ''}`}
      >
        <div className="custom-card-header">
          <div className="header-info">
            <div className="d-flex align-items-center gap-2">
              {editId ? <Edit3 size={20}/> : <PlusCircle size={20}/>}
              <h5 className="m-0 text-white">{editId ? "Mode Edit Program" : "Tambah Program Baru"}</h5>
            </div>
            <p className="card-subtitle-text">
              {editId ? "Sedang mengubah parameter program bantuan" : "Input parameter untuk seleksi otomatis warga"}
            </p>
          </div>
        </div>
        
        <div className="custom-card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-4">
                <label className="custom-label">Nama Program</label>
                <div className="input-with-icon">
                  <ChevronRight className="input-icon-left" size={18} />
                  <input type="text" name="nama_program" className="form-control custom-input" value={formData.nama_program} onChange={handleChange} required placeholder="Contoh: Bantuan Sembako Ramadhan" />
                </div>
              </div>
              <div className="col-md-12 mb-4">
                <label className="custom-label">Deskripsi Program</label>
                <textarea name="deskripsi" className="form-control custom-input-area" rows="3" value={formData.deskripsi} onChange={handleChange} placeholder="Jelaskan detail bantuan ini..."></textarea>
              </div>
              <div className="col-md-6 mb-4">
                <label className="custom-label">Maksimal Penghasilan</label>
                <div className="input-with-icon">
                  <span className="currency-label">Rp</span>
                  <input type="number" name="maksimal_penghasilan" className="form-control custom-input input-shift" value={formData.maksimal_penghasilan} onChange={handleChange} placeholder="0" />
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <label className="custom-label">Minimal Tanggungan</label>
                <div className="input-with-icon">
                  <Users className="input-icon-left" size={18} />
                  <input type="number" name="minimal_tanggungan" className="form-control custom-input" value={formData.minimal_tanggungan} onChange={handleChange} placeholder="Jumlah Orang" />
                </div>
              </div>
            </div>

            <div className="form-footer-actions">
              <div className="d-flex gap-2">
                <button type="submit" className={`btn-modern-primary ${editId ? 'btn-modern-warn' : ''}`} disabled={isLoading}>
                  {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  {editId ? "Perbarui Data" : "Simpan Program"}
                </button>
                {editId && (
                  <button type="button" className="btn-modern-outline" onClick={handleCancel}>
                    <XCircle size={18} className="me-1"/> Batal
                  </button>
                )}
              </div>
              {editId && (
                <button type="button" className="btn-modern-danger" onClick={handleDelete}>
                  <Trash2 size={18} className="me-1"/> Hapus Program
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>

      {/* --- SECTION TABEL --- */}
      <div className="custom-card-navy mt-5 shadow-sm">
        <div className="custom-card-header table-header-bg">
          <div className="header-info">
            <h5 className="m-0 text-white">Daftar Program Tersedia</h5>
            <p className="card-subtitle-text">Terdeteksi {listProgram.length} program bantuan dalam database</p>
          </div>
          <button 
            className={`btn-mode-toggle ${modeKelola ? 'toggle-active' : ''}`} 
            onClick={() => setModeKelola(!modeKelola)}
          >
            <Settings2 size={16} className="me-2"/>
            {modeKelola ? "Selesai" : "Edit List"}
          </button>
        </div>
        
        <div className="table-responsive">
          <table className="table table-modern-style align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">No</th>
                <th>Informasi Program</th>
                <th>Kriteria Seleksi</th>
                {modeKelola && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
              {listProgram.length > 0 ? (
                listProgram.map((item, index) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    key={item.id}
                  >
                    <td className="ps-4 text-muted fw-bold">{index + 1}</td>
                    <td>
                      <div className="fw-bold text-dark fs-6">{item.nama_program}</div>
                      <div className="text-muted small text-truncate" style={{maxWidth: '300px'}}>{item.deskripsi}</div>
                    </td>
                    <td>
                      <div className="criteria-pills-container">
                        <div className="pill-item">
                          <CircleDollarSign size={14} className="me-1 text-primary"/>
                          <span>Max:</span> {item.maksimal_penghasilan ? `Rp ${parseInt(item.maksimal_penghasilan).toLocaleString()}` : '∞'}
                        </div>
                        <div className="pill-item">
                          <Users size={14} className="me-1 text-success"/>
                          <span>Min:</span> {item.minimal_tanggungan ? `${item.minimal_tanggungan} Jiwa` : '0'}
                        </div>
                      </div>
                    </td>
                    {modeKelola && (
                      <td className="text-center">
                        <button className="btn-action-edit" onClick={() => handleEdit(item)}>
                          <Edit3 size={14} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={modeKelola ? 4 : 3} className="text-center py-5">
                    <Info size={40} className="text-light mb-2 d-block mx-auto"/>
                    <span className="text-muted">Tidak ada program bantuan aktif.</span>
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

export default ProgramBantuan;