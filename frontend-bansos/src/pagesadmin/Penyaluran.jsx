import { useState, useEffect } from "react";
import axios from "axios";

function Penyaluran() {
    // State
    const [listSiapSalur, setListSiapSalur] = useState([]); // Untuk dropdown
    const [riwayatSalur, setRiwayatSalur] = useState([]);   // Untuk tabel bawah
    
    // Form State
    const [selectedSeleksiId, setSelectedSeleksiId] = useState("");
    const [tanggalSalur, setTanggalSalur] = useState("");
    const [keterangan, setKeterangan] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. AMBIL DATA DARI API SELEKSI (Sumber Utama)
            const resSeleksi = await axios.get("http://127.0.0.1:8000/api/seleksi");
            
            // Proteksi Array (Anti-Error jika format beda)
            const dataMentah = Array.isArray(resSeleksi.data) 
                ? resSeleksi.data 
                : (resSeleksi.data.data || []);

            // FILTER PENTING: Hanya ambil yang status == 2 (Disetujui Kades)
            // Status 1 = Menunggu, 2 = Disetujui, 3 = Ditolak, 4 = Sudah Disalurkan
            const siapSalur = dataMentah.filter(item => item.status == 2);
            setListSiapSalur(siapSalur);

            // 2. AMBIL RIWAYAT PENYALURAN (Jika ada API khusus riwayat)
            // Jika belum ada API riwayat, bisa ambil dari seleksi yang status == 4
            const sudahSalur = dataMentah.filter(item => item.status == 4);
            setRiwayatSalur(sudahSalur);

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

        try {
            // STEP 1: Simpan ke tabel Penyaluran (History)
            // Sesuaikan endpoint ini dengan backend Anda. 
            // Jika belum ada tabel khusus 'penyaluran', kita cukup update status seleksi saja.
            
            // STEP 2: UPDATE Status di Tabel Seleksi menjadi 4 (Sudah Disalurkan)
            // Agar nama warga hilang dari dropdown dan pindah ke tabel riwayat
            await axios.put(`http://127.0.0.1:8000/api/seleksi/${selectedSeleksiId}`, {
                status: 4, // 4 kode untuk "Sudah Disalurkan"
                keterangan_penyaluran: keterangan, // Opsional: jika ada kolom ini
                tanggal_penyaluran: tanggalSalur     // Opsional: jika ada kolom ini
            });

            alert("Bantuan berhasil disalurkan!");
            
            // Reset Form
            setSelectedSeleksiId("");
            setTanggalSalur("");
            setKeterangan("");
            
            // Refresh Data
            fetchData();

        } catch (error) {
            console.error("Gagal menyimpan:", error);
            alert("Terjadi kesalahan saat menyimpan.");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Penyaluran Bantuan</h2>

            {/* FORM PENYALURAN */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <form onSubmit={handleSimpan}>
                        <div className="row g-3 align-items-end">
                            
                            {/* DROPDOWN PENERIMA */}
                            <div className="col-md-4">
                                <label className="form-label">Pilih Penerima (Disetujui Kades)</label>
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
                                                {item.warga?.nama} - {item.program_bantuan?.nama_program}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Tidak ada data siap salur (Cek halaman Kades)</option>
                                    )}
                                </select>
                            </div>

                            {/* TANGGAL */}
                            <div className="col-md-3">
                                <label className="form-label">Tanggal Penyaluran</label>
                                <input 
                                    type="date" 
                                    className="form-control"
                                    value={tanggalSalur}
                                    onChange={(e) => setTanggalSalur(e.target.value)}
                                    required
                                />
                            </div>

                            {/* KETERANGAN */}
                            <div className="col-md-3">
                                <label className="form-label">Keterangan</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    placeholder="Contoh: Beras 10kg"
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                />
                            </div>

                            {/* TOMBOL */}
                            <div className="col-md-2">
                                <button type="submit" className="btn btn-success w-100">
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* TABEL RIWAYAT */}
            <div className="card shadow-sm bg-dark text-white">
                <div className="card-header">
                    Riwayat Penyaluran (Status: Selesai)
                </div>
                <div className="card-body bg-white text-dark">
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
                            {riwayatSalur.length > 0 ? (
                                riwayatSalur.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.warga?.nama}</td>
                                        <td>{item.program_bantuan?.nama_program}</td>
                                        <td><span className="badge bg-primary">Tersalurkan</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">Belum ada data penyaluran.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Penyaluran;