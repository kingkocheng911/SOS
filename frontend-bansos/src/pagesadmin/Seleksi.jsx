import { useState, useEffect } from "react";
import axios from "axios";
import "./Seleksi.css"; // IMPORT CSS DISINI
import { 
  Users, ClipboardList, CheckCircle, Clock, 
  AlertCircle, Search, CheckCircle2, Filter 
} from "lucide-react";

function Seleksi() {
  const [listProgram, setListProgram] = useState([]);
  const [listSeleksi, setListSeleksi] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [kandidatList, setKandidatList] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resProgram = await axios.get("http://127.0.0.1:8000/api/program");
      const dataProgram = Array.isArray(resProgram.data) ? resProgram.data : (resProgram.data.data || []);
      setListProgram(dataProgram);

      const resSeleksi = await axios.get("http://127.0.0.1:8000/api/seleksi");
      const dataSeleksi = Array.isArray(resSeleksi.data) ? resSeleksi.data : (resSeleksi.data.data || []);
      setListSeleksi(dataSeleksi);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    }
  };

  const handleProgramChange = async (e) => {
    const programId = e.target.value;
    setSelectedProgram(programId);
    setKandidatList([]);

    if (programId) {
      setIsLoading(true);
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/seleksi/filter-kandidat", {
          program_id: programId
        });
        setKandidatList(response.data.data || []);
      } catch (error) {
        console.error("Gagal memfilter kandidat:", error);
      }
      setIsLoading(false);
    }
  };

  const handleSimpanSemua = async () => {
    if (kandidatList.length === 0) return;
    if (!window.confirm(`Konfirmasi pendaftaran untuk ${kandidatList.length} warga?`)) return;

    setIsSaving(true);
    try {
      const promises = kandidatList.map(warga => 
        axios.post("http://127.0.0.1:8000/api/seleksi", {
          warga_id: warga.id,           
          program_id: selectedProgram   
        })
      );
      await Promise.all(promises);
      alert("Proses Seleksi Berhasil Disimpan!");
      fetchData();           
      setKandidatList([]);   
    } catch (error) {
      alert("Gagal: " + (error.response?.data?.message || "Terjadi kesalahan"));
    }
    setIsSaving(false);
  };

  return (
    <div className="seleksi-container">
      {/* HEADER SECTION */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="header-title">Seleksi Penerima Bantuan</h3>
          <p className="header-subtitle">Otomatisasi pemilihan warga berdasarkan kriteria program</p>
        </div>
        <div className="stats-box d-flex align-items-center gap-2">
            <div className="stats-icon-wrapper">
            <Users className="text-primary" size={20} />
            </div>
            <span className="fw-semibold small">
            {listSeleksi.length} Total Pengajuan
            </span>
</div>
      </div>

      <div className="row g-4">
        {/* STEP 1: FILTER PROGRAM */}
        <div className="col-lg-4">
          <div className="card custom-card">
            <div className="card-header custom-card-header">
              <div className="d-flex align-items-center gap-2 text-primary">
                <Filter size={18} />
                <span className="fw-bold text-dark">1. Konfigurasi Program</span>
              </div>
            </div>
            <div className="card-body">
              <label className="form-label small fw-bold text-muted">Pilih Jenis Bantuan</label>
              <select 
                className="form-select custom-select mb-3" 
                value={selectedProgram} 
                onChange={handleProgramChange}
              >
                <option value="">-- Cari Program --</option>
                {listProgram.map(prog => (
                  <option key={prog.id} value={prog.id}>
                    {prog.nama_program || prog.nama}
                  </option>
                ))}
              </select>
              
              {selectedProgram && (
                <div className="info-box">
                  <div className="d-flex align-items-start gap-2">
                    <AlertCircle size={16} className="text-primary mt-1" />
                    <p className="small text-dark mb-0 italic">
                      Sistem sedang memfilter warga dengan penghasilan di bawah ambang batas program.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 2: HASIL KANDIDAT */}
        <div className="col-lg-8">
          <div className="card custom-card h-100">
            <div className="card-header custom-card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 text-success">
                <CheckCircle2 size={18} />
                <span className="fw-bold text-dark">2. Kandidat Otomatis</span>
              </div>
              
              {kandidatList.length > 0 && (
                <button 
                  onClick={handleSimpanSemua} 
                  className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm fw-bold d-flex align-items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? "Memproses..." : <><CheckCircle size={16}/> Setujui ({kandidatList.length})</>}
                </button>
              )}
            </div>

            <div className="card-body p-0">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-grow text-primary" role="status"></div>
                  <p className="mt-3 text-muted small fw-medium">Menganalisis data...</p>
                </div>
              ) : !selectedProgram ? (
                <div className="text-center py-5 opacity-25">
                  <Search size={48} className="mb-2" />
                  <p className="small">Pilih program untuk memulai</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table modern-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="px-4">Nama Warga</th>
                        <th>Pekerjaan</th>
                        <th>Penghasilan</th>
                        <th className="text-center">Hasil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kandidatList.length > 0 ? (
                        kandidatList.map((warga) => (
                          <tr key={warga.id}>
                            <td className="px-4">
                              <div className="fw-bold text-dark">{warga.nama || warga.name}</div>
                              <div className="small text-muted">{warga.nik}</div>
                            </td>
                            <td className="small text-dark">{warga.pekerjaan || '-'}</td>
                            <td className="fw-semibold text-primary">
                              Rp {warga.gaji ? parseInt(warga.gaji).toLocaleString('id-ID') : 0}
                            </td>
                            <td className="text-center">
                              <span className="badge badge-soft-success rounded-pill-custom">
                                LOLOS SYARAT
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-5 text-muted small">
                            Tidak ada warga yang sesuai kriteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 3: HISTORY */}
        <div className="col-12">
          <div className="card custom-card">
            <div className="card-header custom-card-header d-flex align-items-center gap-2">
              <ClipboardList size={18} className="text-secondary" />
              <span className="fw-bold">3. Riwayat Seleksi</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table modern-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4">No</th>
                      <th>Penerima</th>
                      <th>Program Bantuan</th>
                      <th>Tanggal</th>
                      <th className="text-center">Status Final</th>
                    </tr>
                  </thead>
                  <tbody>
                   {listSeleksi.length > 0 ? (
  listSeleksi.map((item, index) => {
    // 1. Perbaikan: Ambil nama dari objek warga atau user dengan aman
    const namaPenerima = item.warga?.nama || item.warga?.name || "Data Warga Hilang";
    const namaProgram = item.program_bantuan?.nama_program || item.program_bantuan?.nama || "Program Tidak Diketahui";
    
    // 2. Perbaikan: Validasi Tanggal agar tidak muncul "Invalid Date"
    const formatTanggal = (dateString) => {
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) 
          ? "-" 
          : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        return "-";
      }
    };

    return (
      <tr key={item.id || index}>
        <td className="px-4 text-muted small fw-bold">{index + 1}</td>
        <td>
          <div className="fw-semibold text-dark">{namaPenerima}</div>
                    {/* Tambahkan NIK kecil jika ada untuk membedakan antar warga */}
                    {item.warga?.nik && <div className="text-muted" style={{fontSize: '10px'}}>{item.warga.nik}</div>}
                    </td>
                    <td>
                    <span className="text-dark small fw-medium">{namaProgram}</span>
                    </td>
                    <td className="small text-muted">
                    <div className="d-flex align-items-center gap-1">
                        <Clock size={12} />
                        {formatTanggal(item.created_at)}
                    </div>
                    </td>
                    <td className="text-center">
                    {/* Status Badge dengan fallback jika status kosong */}
                    {item.status == 1 && <span className="badge badge-soft-warning rounded-pill-custom">MENUNGGU</span>}
                    {item.status == 2 && <span className="badge badge-soft-success rounded-pill-custom">DISETUJUI</span>}
                    {item.status == 3 && <span className="badge badge-soft-danger rounded-pill-custom">DITOLAK</span>}
                    {!item.status && <span className="badge bg-light text-muted rounded-pill-custom">DRAFT</span>}
                    </td>
                </tr>
                );
            })
            ) : (
            <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                <div className="opacity-50">
                    <ClipboardList size={32} className="mb-2" />
                    <p className="small mb-0">Belum ada riwayat pengajuan dalam database.</p>
                </div>
                </td>
            </tr>
            )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seleksi;