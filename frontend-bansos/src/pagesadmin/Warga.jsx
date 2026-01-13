import { useState, useEffect } from "react";
import axios from "axios";

function Warga() {  // <--- Perhatikan nama fungsi ini berubah
  const [warga, setWarga] = useState([]);
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");

  useEffect(() => { fetchWarga(); }, []);

  const fetchWarga = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/warga");
      setWarga(response.data.data);
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/warga", { nama, nik });
      setNama(""); setNik(""); fetchWarga();
      alert("Sukses!");
    } catch (error) { alert("Gagal!"); }
  };

  return (
    <div className="container mt-4">
      <h2>Data Warga</h2>
      {/* Form dan Tabel (Sama seperti sebelumnya) */}
      <div className="card mb-3">
        <div className="card-body">
            <form onSubmit={handleSubmit} className="d-flex gap-2">
                <input placeholder="Nama" className="form-control" value={nama} onChange={e=>setNama(e.target.value)} />
                <input placeholder="NIK" className="form-control" value={nik} onChange={e=>setNik(e.target.value)} />
                <button type="submit" className="btn btn-primary">Simpan</button>
            </form>
        </div>
      </div>
      <ul className="list-group">
        {warga.map(item => <li key={item.id} className="list-group-item">{item.nama} - {item.nik}</li>)}
      </ul>
    </div>
  );
}

export default Warga;