import { useState, useEffect } from "react";
import axios from "axios";

function ProgramBantuan() {
  // State Data
  const [listProgram, setListProgram] = useState([]);
  
  // State Form
  const [formData, setFormData] = useState({
    nama_program: "",
    deskripsi: "",
    maksimal_penghasilan: "", 
    minimal_tanggungan: ""    
  });

  // State Mode
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State Tampilan Tombol Aksi di Tabel
  const [modeKelola, setModeKelola] = useState(false);

  // Ambil data awal
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
    // Scroll otomatis ke atas agar user melihat form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({ nama_program: "", deskripsi: "", maksimal_penghasilan: "", minimal_tanggungan: "" });
    setEditId(null);
  };

  // Fungsi Hapus (Sekarang dipanggil dari Form, bukan Tabel)
  const handleDelete = async () => {
    if(!editId) return; // Pastikan ada ID yang sedang diedit
    
    if(!window.confirm("PERINGATAN: Apakah Anda yakin ingin MENGHAPUS program ini secara permanen?")) return;

    try {
        await axios.delete(`http://127.0.0.1:8000/api/program/${editId}`);
        alert("Program berhasil dihapus.");
        handleCancel(); // Reset form
        fetchData();    // Refresh data
    } catch (error) {
        alert("Gagal menghapus data.");
    }
  };

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
        alert("Berhasil diperbarui!");
      } else {
        await axios.post("http://127.0.0.1:8000/api/program", payload);
        alert("Berhasil ditambahkan!");
      }
      handleCancel();
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan.");
    }
    setIsLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Kelola Program Bantuan</h2>

      {/* --- FORMULIR INPUT / EDIT --- */}
      <div className={`card shadow-sm mb-5 border-${editId ? 'warning' : 'success'}`}>
        <div className={`card-header text-white ${editId ? 'bg-warning' : 'bg-success'}`}>
          <h5 className="mb-0">{editId ? "Edit Program Bantuan" : "Tambah Program Baru"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="fw-bold">Nama Program</label>
              <input type="text" name="nama_program" className="form-control" value={formData.nama_program} onChange={handleChange} required placeholder="Contoh: BLT 2024" />
            </div>
            <div className="mb-3">
              <label className="fw-bold">Deskripsi</label>
              <textarea name="deskripsi" className="form-control" rows="2" value={formData.deskripsi} onChange={handleChange} placeholder="Deskripsi singkat..."></textarea>
            </div>
            
            <h6 className="mt-3 text-muted">Syarat Otomatis (Opsional)</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Max Penghasilan (Rp)</label>
                <input type="number" name="maksimal_penghasilan" className="form-control" value={formData.maksimal_penghasilan} onChange={handleChange} placeholder="0" />
              </div>
              <div className="col-md-6 mb-3">
                <label>Min Tanggungan (Orang)</label>
                <input type="number" name="minimal_tanggungan" className="form-control" value={formData.minimal_tanggungan} onChange={handleChange} placeholder="0" />
              </div>
            </div>

            {/* --- TOMBOL AKSI DI DALAM FORM --- */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                {/* Grup Tombol Simpan & Batal */}
                <div className="d-flex gap-2">
                    <button type="submit" className={`btn ${editId ? 'btn-warning' : 'btn-success'} text-white`} disabled={isLoading}>
                        {isLoading ? "Proses..." : (editId ? "💾 Simpan Perubahan" : "➕ Tambah Program")}
                    </button>
                    
                    {editId && (
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            Batal
                        </button>
                    )}
                </div>

                {/* TOMBOL HAPUS (Hanya muncul saat Mode Edit) */}
                {editId && (
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                        🗑️ Hapus Program Ini
                    </button>
                )}
            </div>

          </form>
        </div>
      </div>

      {/* --- TABEL DATA --- */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <span className="fw-bold fs-5">Daftar Program Tersedia</span>
          
          {/* Tombol Toggle Pengaturan */}
          <button 
            className={`btn btn-sm ${modeKelola ? 'btn-danger' : 'btn-light'}`} 
            onClick={() => setModeKelola(!modeKelola)}
          >
            {modeKelola ? "❌ Tutup Mode Edit" : "⚙️ Mode Edit"}
          </button>
        </div>

        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{width: '5%'}}>No</th>
                <th style={{width: '20%'}}>Nama Program</th>
                <th style={{width: '30%'}}>Syarat Seleksi</th>
                <th>Deskripsi</th>
                
                {/* Kolom Aksi hanya muncul jika Mode Edit dinyalakan */}
                {modeKelola && <th className="text-center bg-warning bg-opacity-10" style={{width: '15%'}}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {listProgram.length > 0 ? (
                listProgram.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{item.nama_program}</td>
                    <td>
                      <small className="d-block text-muted">
                        Max Gaji: {item.maksimal_penghasilan ? `Rp ${parseInt(item.maksimal_penghasilan).toLocaleString()}` : '-'}
                      </small>
                      <small className="d-block text-muted">
                        Min Tanggungan: {item.minimal_tanggungan ? `${item.minimal_tanggungan} Orang` : '-'}
                      </small>
                    </td>
                    <td>{item.deskripsi}</td>

                    {/* HANYA TOMBOL EDIT YANG MUNCUL DI SINI */}
                    {modeKelola && (
                        <td className="text-center bg-warning bg-opacity-10">
                            <button className="btn btn-sm btn-primary w-100" onClick={() => handleEdit(item)}>
                                ✏️ Edit
                            </button>
                        </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={modeKelola ? 5 : 4} className="text-center py-4 text-muted">
                    Belum ada data program.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProgramBantuan;