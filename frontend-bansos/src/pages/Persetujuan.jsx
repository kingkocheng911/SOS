import { useEffect, useState } from "react";
import axios from "axios";

function Persetujuan() {
    const [approvalList, setApprovalList] = useState([]);
    // const token = localStorage.getItem("token"); // Uncomment jika pakai token

    useEffect(() => {
        fetchDataPersetujuan();
    }, []);

    const fetchDataPersetujuan = async () => {
        try {
            // UBAH ENDPOINT: Ambil dari api/seleksi karena status ada disitu
            const response = await axios.get("http://127.0.0.1:8000/api/seleksi");
            
            // Proteksi Array
            const allData = Array.isArray(response.data) ? response.data : (response.data.data || []);

            // FILTER: Hanya ambil yang status == 1 (Menunggu)
            const pending = allData.filter(item => item.status == 1);
            
            setApprovalList(pending);
        } catch (error) {
            console.error("Gagal ambil data persetujuan", error);
        }
    };

    const handleAction = async (id, newStatus) => {
        // newStatus: 2 = Setuju, 3 = Tolak
        const actionName = newStatus === 2 ? "Menyetujui" : "Menolak";

        if(!window.confirm(`Yakin ingin ${actionName} pengajuan ini?`)) return;

        try {
            // Gunakan metode UPDATE standar (PUT)
            await axios.put(`http://127.0.0.1:8000/api/seleksi/${id}`, {
                status: newStatus
            });
            
            alert(`Berhasil ${actionName}!`);
            fetchDataPersetujuan(); // Refresh tabel agar data yang sudah diproses hilang dari daftar
        } catch (error) {
            console.error("Error update:", error);
            alert("Gagal memproses data.");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow border-0">
                <div className="card-header bg-warning text-dark p-4">
                    <h3 className="mb-0 fw-bold"> Persetujuan Kepala Desa</h3>
                    <small>Validasi data warga sebelum penyaluran bantuan.</small>
                </div>
                <div className="card-body p-4">
                    {approvalList.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <h4>Tidak ada data yang perlu persetujuan.</h4>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nama Warga</th>
                                        <th>NIK</th>
                                        <th>Program Bantuan</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvalList.map((item) => (
                                        <tr key={item.id}>
                                            <td className="fw-bold">{item.warga?.nama || "Tanpa Nama"}</td>
                                            <td>{item.warga?.nik || "-"}</td>
                                            <td>
                                                <span className="badge bg-info text-dark">
                                                    {item.program_bantuan?.nama_program || "Program"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        onClick={() => handleAction(item.id, 2)} 
                                                        className="btn btn-success btn-sm">
                                                        ✔ Setujui
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(item.id, 3)} 
                                                        className="btn btn-danger btn-sm">
                                                        ✖ Tolak
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Persetujuan;