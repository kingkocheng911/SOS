import { useNavigate } from "react-router-dom";

function HomeWarga() {
    const navigate = useNavigate();

    // Ambil nama user dari LocalStorage buat pemanis
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.clear(); // Hapus data login
        navigate("/login");   // Tendang ke halaman login
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header bg-success text-white">
                    <h4>Halaman Utama Warga</h4>
                </div>
                <div className="card-body text-center p-5">
                    <h2 className="mb-3">Halo, {user.nama || "Warga"}! 👋</h2>
                    <p className="lead">
                        Ini adalah halaman khusus warga. <br />
                        Fitur pendaftaran dan cek status bansos akan muncul di sini nanti.
                    </p>
                    
                    <hr />
                    
                    {/* Tombol Logout SANGAT PENTING karena Navbar disembunyikan */}
                    <button onClick={handleLogout} className="btn btn-danger btn-lg mt-3">
                        Logout / Keluar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HomeWarga;