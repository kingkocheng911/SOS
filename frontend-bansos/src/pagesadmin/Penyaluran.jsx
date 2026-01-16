import { useState, useEffect } from "react";
import axios from "axios";

function Penyaluran() {
    // State
    const [listSiapSalur, setListSiapSalur] = useState([]); 
    const [riwayatSalur, setRiwayatSalur] = useState([]);   
    
    // Form State
    const [selectedSeleksiId, setSelectedSeleksiId] = useState("");
    const [tanggalSalur, setTanggalSalur] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/penyaluran");
            
            // Edit: Pastikan data yang masuk adalah array agar tidak error .map
            setListSiapSalur(response.data.siap_salur || []);
            setRiwayatSalur(response.data.riwayat || []);

        } catch (error) {
            console.error("Gagal ambil data:", error);
        }
    };

    const handleSimpan = async (e) => {
        e.preventDefault();

        if (!selectedSeleksiId) {
            alert("Pilih warga terlebih dahulu!");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/penyaluran", {
                seleksi_id: selectedSeleksiId,
                tanggal_penyaluran: tanggalSalur,
                keterangan: keterangan
            });

            alert("Bantuan berhasil disalurkan!");
            
            // Reset Form
            setSelectedSeleksiId("");
            setTanggalSalur("");
            setKeterangan("");
            
            fetchData();

        } catch (error) {
            console.error("Gagal menyimpan:", error);
            alert("Terjadi kesalahan saat menyimpan.");
        }
        setIsLoading(false);
    };

    return (
        <div className="container mt-4">
            <h2>Penyaluran Bantuan</h2>

            {/* FORM PENYALURAN */}
            <div className="card mb-4 shadow-sm border-primary">
                <div className="card-header bg-primary text-white">
                    Input Penyaluran Baru
                </div>
                <div className="card-body">
                    <form onSubmit={handleSimpan}>
                        <div className="row g-3 align-items-end">
                            
                            {/* DROPDOWN PENERIMA */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Pilih Penerima (Disetujui Kades)</label>
                                <select 
                                    className="form-select"
                                    value={selectedSeleksiId}
                                    onChange={(e) => setSelectedSeleksiId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Warga --</option>
                                    {listSiapSalur.length > 0 ? (
                                        listSiapSalur.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {/* Edit: Ditambah pengecekan jalur warga untuk dropdown */}
                                                {(item.warga?.nama || item.warga?.name || "Tanpa Nama")} - {(item.program_bantuan?.nama_program || "Bantuan")}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Tidak ada data siap salur</option>
                                    )}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-bold">Tanggal Penyaluran</label>
                                <input 
                                    type="date" 
                                    className="form-control"
                                    value={tanggalSalur}
                                    onChange={(e) => setTanggalSalur(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-bold">Keterangan Barang</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    placeholder="Contoh: Beras 10kg"
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-2">
                                <button type="submit" className="btn btn-success w-100" disabled={isLoading}>
                                    {isLoading ? "Menyimpan..." : "Simpan Data"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* TABEL RIWAYAT */}
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    Riwayat Penyaluran (Status: Selesai Disalurkan)
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover table-striped">
                            <thead className="table-light">
                                <tr>
                                    <th>No</th>
                                    <th>Nama Warga</th>
                                    <th>Program</th>
                                    <th>Tanggal Terima</th>
                                    <th>Keterangan</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riwayatSalur.length > 0 ? (
                                    riwayatSalur.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            {/* Edit: Penyesuaian akses data warga sesuai gambar struktur database */}
                                            <td className="fw-bold">
                                                {item.nama_warga || item.seleksi?.warga?.nama || item.seleksi?.warga?.name || "Data Warga Terhapus"}
                                            </td>
                                            <td>
                                                {item.nama_program || item.seleksi?.program_bantuan?.nama_program || "Bantuan"}
                                            </td>
                                            <td>{item.tanggal_penyaluran}</td>
                                            <td>{item.keterangan}</td>
                                            <td><span className="badge bg-success">Tersalurkan</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-3">Belum ada data penyaluran.</td>
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

export default Penyaluran;