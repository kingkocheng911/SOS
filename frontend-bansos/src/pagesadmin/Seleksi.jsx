import { useState, useEffect } from "react";
import axios from "axios";

function Seleksi() {
  // State Data Master
  const [listProgram, setListProgram] = useState([]);
  const [listSeleksi, setListSeleksi] = useState([]);

  // State Logika Otomatisasi
  const [selectedProgram, setSelectedProgram] = useState("");
  const [kandidatList, setKandidatList] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Tambahan: Loading saat menyimpan

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Ambil Program
      const resProgram = await axios.get("http://127.0.0.1:8000/api/program");
      const dataProgram = Array.isArray(resProgram.data) ? resProgram.data : (resProgram.data.data || []);
      setListProgram(dataProgram);

      // 2. Ambil History Seleksi
      const resSeleksi = await axios.get("http://127.0.0.1:8000/api/seleksi");
      const dataSeleksi = Array.isArray(resSeleksi.data) ? resSeleksi.data : (resSeleksi.data.data || []);
      setListSeleksi(dataSeleksi);

    } catch (error) {
      console.error("Gagal ambil data:", error);
    }
  };

  // --- LOGIKA: FILTER OTOMATIS SAAT PILIH PROGRAM ---
  const handleProgramChange = async (e) => {
    const programId = e.target.value;
    setSelectedProgram(programId);
    setKandidatList([]); // Reset list

    if (programId) {
      setIsLoading(true);
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/seleksi/filter-kandidat", {
          program_id: programId
        });
        
        // Data kandidat dari backend
        setKandidatList(response.data.data || []);
      } catch (error) {
        console.error("Gagal memfilter kandidat:", error);
        alert("Gagal mengambil data kandidat otomatis. Pastikan server backend jalan.");
      }
      setIsLoading(false);
    }
  };

  // --- LOGIKA: SIMPAN SEMUA KANDIDAT ---
  const handleSimpanSemua = async () => {
    if (kandidatList.length === 0) return;
    
    if (!window.confirm(`Apakah Anda yakin ingin mendaftarkan ${kandidatList.length} warga ini?`)) return;

    setIsSaving(true); // Mulai loading simpan

    try {
      // Loop dan kirim data satu per satu
      const promises = kandidatList.map(warga => 
        axios.post("http://127.0.0.1:8000/api/seleksi", {
          warga_id: warga.id,           // ID dari tabel users
          program_bantuan_id: selectedProgram // ID Program
        })
      );

      // Tunggu semua proses selesai
      await Promise.all(promises);

      alert("Sukses! Semua kandidat berhasil didaftarkan.");
      fetchData();           // Refresh tabel history di bawah
      setKandidatList([]);   // Kosongkan tabel kandidat
      setSelectedProgram(""); // Reset dropdown
      
    } catch (error) {
      console.error("Error saat menyimpan:", error);
      // Cek pesan error dari backend jika ada
      const pesan = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      alert("Gagal: " + pesan);
    }
    
    setIsSaving(false); // Selesai loading
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Seleksi Penerima Bantuan (Otomatis)</h2>
      
      {/* BAGIAN 1: FILTER PROGRAM */}
      <div className="card mb-4 shadow-sm border-primary">
        <div className="card-header bg-primary text-white">
            1. Pilih Program Bantuan
        </div>
        <div className="card-body">
            <div className="row align-items-center">
                <div className="col-md-8">
                    <select 
                        className="form-select form-select-lg" 
                        value={selectedProgram} 
                        onChange={handleProgramChange}
                    >
                        <option value="">-- Pilih Jenis Bantuan --</option>
                        {listProgram.map(prog => (
                            <option key={prog.id} value={prog.id}>
                                {prog.nama_program || prog.nama} 
                                {prog.maksimal_penghasilan ? ` (Max Gaji: Rp ${parseInt(prog.maksimal_penghasilan).toLocaleString('id-ID')})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <small className="text-muted">
                        *Sistem akan otomatis mencari warga yang sesuai kriteria (Gaji & Tanggungan).
                    </small>
                </div>
            </div>
        </div>
      </div>

      {/* BAGIAN 2: HASIL PREDIKSI / KANDIDAT */}
      {selectedProgram && (
          <div className="card mb-4 shadow-sm border-warning">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                <strong>2. Kandidat Terpilih (Sesuai Kriteria)</strong>
                
                {/* Tombol Simpan Muncul jika ada data */}
                {kandidatList.length > 0 && (
                    <button 
                        onClick={handleSimpanSemua} 
                        className="btn btn-dark btn-sm"
                        disabled={isSaving}
                    >
                        {isSaving ? "Menyimpan..." : `Simpan / Setujui Semua (${kandidatList.length})`}
                    </button>
                )}
            </div>
            <div className="card-body p-0">
                {isLoading ? (
                    <div className="p-5 text-center">
                        <div className="spinner-border text-warning" role="status"></div>
                        <p className="mt-2">Sedang memproses data warga...</p>
                    </div>
                ) : (
                    <table className="table table-striped mb-0">
                        <thead>
                            <tr>
                                <th>Nama Warga</th>
                                <th>NIK</th>
                                <th>Pekerjaan</th>
                                <th>Penghasilan (Gaji)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kandidatList.length > 0 ? (
                                kandidatList.map((warga) => (
                                    <tr key={warga.id}>
                                        <td>{warga.nama || warga.name}</td>
                                        <td>{warga.nik}</td>
                                        <td>{warga.pekerjaan || '-'}</td>
                                        <td>
                                            {/* PERBAIKAN: Gunakan warga.gaji dan format Rupiah */}
                                            Rp {warga.gaji ? parseInt(warga.gaji).toLocaleString('id-ID') : 0}
                                        </td>
                                        <td><span className="badge bg-success">Lolos Syarat</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        Tidak ada warga yang memenuhi kriteria program ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
      )}

      {/* BAGIAN 3: HISTORY (Data yang sudah tersimpan) */}
      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white">3. History Pengajuan (Database)</div>
        <div className="card-body">
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>No</th>
                            <th>Nama Warga</th>
                            <th>Program</th>
                            <th>Tanggal Daftar</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listSeleksi.length > 0 ? (
                            listSeleksi.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    {/* Handle nama warga jika relasi ada */}
                                    <td>{item.warga?.nama || item.warga?.name || "User Terhapus"}</td>
                                    <td>{item.program_bantuan?.nama_program || item.program_bantuan?.nama}</td>
                                    <td>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        {item.status == 1 && <span className="badge bg-warning text-dark">Menunggu</span>}
                                        {item.status == 2 && <span className="badge bg-success">Disetujui</span>}
                                        {item.status == 3 && <span className="badge bg-danger">Ditolak</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Belum ada data pendaftaran.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Seleksi;