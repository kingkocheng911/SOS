import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // useNavigate tidak wajib jika pakai window.location
import "./AuthStyle.css"; 

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/login", {
                email: email,
                password: password
            });

            const responseData = response.data.data || response.data; 
            const token = responseData.token;
            const user = responseData.user;
            
            // Simpan ke LocalStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Cek Role untuk Redirect
            const role = user.role.toLowerCase();

            if (role === 'admin') {
                window.location.href = "/dashboard";
            } else if (role === 'kades') {
                window.location.href = "/persetujuan"; // Kades masuk ke sini
            } else if (role === 'warga') {
                window.location.href = "/home";
            } else {
                // Fallback jika role tidak dikenali
                window.location.href = "/";
            }

        } catch (error) {
            console.error("Login Error:", error);
            const pesan = error.response?.data?.message || "Email atau Password Salah!";
            alert(pesan);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                
                {/* Header Section */}
                <div className="text-center">
                    <div className="mb-3">
                        <i className="bi bi-building-fill-check text-primary" style={{fontSize: '3rem'}}></i>
                    </div>
                    <h3 className="auth-title">Selamat Datang</h3>
                    <p className="auth-subtitle">Masuk ke Portal Bansos Terpadu</p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleLogin}>
                    
                    {/* Input Email */}
                    <div className="mb-3">
                        <label className="form-label-custom">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text input-group-text-custom">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input 
                                type="email" 
                                className="form-control form-control-custom form-control-icon"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div className="mb-4">
                        <label className="form-label-custom">Password</label>
                        <div className="input-group">
                            <span className="input-group-text input-group-text-custom">
                                <i className="bi bi-lock"></i>
                            </span>
                            <input 
                                type="password" 
                                className="form-control form-control-custom form-control-icon"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    
                    {/* Tombol Login */}
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-primary-custom w-100 mb-4"
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : 'MASUK SEKARANG'}
                    </button>

                    {/* Link ke Register */}
                    <div className="text-center">
                        <span className="text-muted small">Belum memiliki akun? </span>
                        <Link to="/register" className="auth-link small ms-1">
                            Daftar Disini
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default Login;