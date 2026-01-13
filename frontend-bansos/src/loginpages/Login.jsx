import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; 
import "./Login.css"; 

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 1. Request ke Backend
            const response = await axios.post("http://127.0.0.1:8000/api/login", {
                email: email,
                password: password
            });

            // 2. Ambil data dari response
            // Pastikan struktur response sesuai dengan backend Anda (response.data.data atau response.data)
            const responseData = response.data.data || response.data; 
            const token = responseData.token;
            const user = responseData.user;

            // 3. Simpan ke LocalStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            alert("Login Berhasil!");
            
            // 4. LOGIKA REDIRECT BERDASARKAN ROLE
            // Kita gunakan window.location.href agar halaman refresh total 
            // dan App.jsx bisa membaca ulang token/role dengan segar.
            if (user.role === 'warga') {
                window.location.href = "/warga";      // Ke Halaman Warga (Kotak Hitam)
            } else {
                window.location.href = "/dashboard";  // Ke Halaman Admin/Kades
            }

        } catch (error) {
            console.error("Login Error:", error);
            const pesan = error.response?.data?.message || "Email atau Password Salah!";
            alert(pesan);
        }
    };

    return (
        <div className="login-page">
            <div className="card login-card">
                
                {/* Header */}
                <div className="login-header">
                    <h4>APPS BANSOS</h4>
                    <small>Silakan masuk untuk melanjutkan</small>
                </div>

                {/* Body Form */}
                <div className="login-body">
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label text-muted">Email Address</label>
                            <input 
                                type="email" 
                                className="form-control"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label text-muted">Password</label>
                            <input 
                                type="password" 
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        
                        <button type="submit" className="btn btn-primary w-100 btn-login mb-3">
                            LOGIN
                        </button>

                        {/* --- LINK MENUJU REGISTER --- */}
                        <div className="text-center">
                            <span className="text-muted me-1">Belum punya akun?</span>
                            <Link to="/register" className="text-decoration-none fw-bold">
                                Daftar disini
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;