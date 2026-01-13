import { useState, useEffect } from "react";
import axios from "axios";

function Program() {
  const [program, setProgram] = useState([]);
  const [namaProgram, setNamaProgram] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  // 1. Ambil data saat halaman dibuka
  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/program");
      // Sesuai format controller: { status: true, data: [...] }
      setProgram(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Simpan data baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/program", {
        nama_program: namaProgram, // Sesuaikan dengan nama kolom di Database
        deskripsi: deskripsi
      });
      // Reset form & refresh data
      setNamaProgram("");
      setDeskripsi("");
      fetchProgram();
      alert("Program Berhasil Ditambah!");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan program.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Kelola Program Bantuan</h2>

      {/* CARD FORM INPUT */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-success text-white">Tambah Program Baru</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nama Program</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: BLT Dana Desa"
                value={namaProgram}
                onChange={(e) => setNamaProgram(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Deskripsi / Syarat</label>
              <textarea
                className="form-control"
                placeholder="Contoh: Untuk warga lansia di atas 60 tahun"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-success">Simpan Program</button>
          </form>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Daftar Program Tersedia</h5>
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>No</th>
                <th>Nama Program</th>
                <th>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {program.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">Belum ada program bantuan.</td>
                </tr>
              ) : (
                program.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td><strong>{item.nama_program}</strong></td>
                    <td>{item.deskripsi}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Program;