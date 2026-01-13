import { useState, useEffect } from "react";
import axios from "axios";

function Seleksi() {
  const [listWarga, setListWarga] = useState([]);
  const [listProgram, setListProgram] = useState([]);
  const [listSeleksi, setListSeleksi] = useState([]);

  const [selectedWarga, setSelectedWarga] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        // 1. Ambil Warga (Dengan Proteksi Array)
        const resWarga = await axios.get("http://127.0.0.1:8000/api/warga");
        const dataWarga = Array.isArray(resWarga.data) ? resWarga.data : (resWarga.data.data || []);
        setListWarga(dataWarga);

        // 2. Ambil Program (Dengan Proteksi Array)
        const resProgram = await axios.get("http://127.0.0.1:8000/api/program"); 
        const dataProgram = Array.isArray(resProgram.data) ? resProgram.data : (resProgram.data.data || []);
        setListProgram(dataProgram);

        // 3. Ambil Seleksi
        const resSeleksi = await axios.get("http://127.0.0.1:8000/api/seleksi");
        const dataSeleksi = Array.isArray(resSeleksi.data) ? resSeleksi.data : (resSeleksi.data.data || []);
        setListSeleksi(dataSeleksi);

    } catch (error) {
        console.error("Gagal ambil data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/seleksi", {
        warga_id: selectedWarga,
        program_bantuan_id: selectedProgram 
      });
      alert("Berhasil didaftarkan! Data masuk ke halaman Kades.");
      fetchData(); 
      setSelectedWarga("");
      setSelectedProgram("");
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menyimpan data.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Seleksi Penerima Bantuan (Admin)</h2>
      
      {/* FORM INPUT */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
            <h5 className="card-title">Daftarkan Warga</h5>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-5">
                    <label className="form-label">Pilih Warga</label>
                    <select className="form-select" value={selectedWarga} onChange={e => setSelectedWarga(e.target.value)} required>
                        <option value="">-- Cari Nama Warga --</option>
                        {listWarga.map(warga => (
                            <option key={warga.id} value={warga.id}>{warga.nama} - {warga.nik}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-5">
                    <label className="form-label">Pilih Program</label>
                    <select className="form-select" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} required>
                        <option value="">-- Pilih Jenis Bantuan --</option>
                        {listProgram.map(prog => (
                            <option key={prog.id} value={prog.id}>{prog.nama_program || prog.nama}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary w-100">Daftarkan</button>
                </div>
            </form>
        </div>
      </div>

      {/* TABEL DATA (Hanya View) */}
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">History Pengajuan</div>
        <div className="card-body">
            <table className="table table-bordered table-hover">
                <thead className="table-light">
                    <tr>
                        <th>No</th>
                        <th>Nama Warga</th>
                        <th>Program</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {listSeleksi.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.warga?.nama}</td>
                            <td>{item.program_bantuan?.nama_program}</td>
                            <td>
                                {item.status == 1 && <span className="badge bg-warning text-dark">Menunggu Kades</span>}
                                {item.status == 2 && <span className="badge bg-success">Disetujui</span>}
                                {item.status == 3 && <span className="badge bg-danger">Ditolak</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default Seleksi;