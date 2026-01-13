import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // Kita pakai CSS yang sama dengan Login

function Register() {
    // State untuk form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: ""
    });
    
    // State untuk error validasi dari server
    const [validationErrors, setValidationErrors] = useState({});
    
    const navigate = useNavigate();

    // Handle perubahan input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post("http://127.0.0.1:8000/api/register", formData);
            
            alert("Registrasi Berhasil! Silakan Login.");
            navigate("/login"); // Redirect ke halaman login
            
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Jika error validasi (email kembar / password beda)
                setValidationErrors(error.response.data);
            } else {
                alert("Terjadi kesalahan pada server.");
                console.error(error);
            }
        }
    };

    return (
        <div className="login-page">
            <div className="card login-card">
                
                {/* Header Biru */}
                <div className="login-header">
                    <h4>DAFTAR AKUN</h4>
                    <small>Buat akun warga baru</small>
                </div>

                <div className="login-body">
                    <form onSubmit={handleRegister}>
                        
                        {/* Nama Lengkap */}
                        <div className="mb-3">
                            <label className="form-label text-muted">Nama Lengkap</label>
                            <input 
                                type="text" name="name"
                                className="form-control"
                                value={formData.name} onChange={handleChange}
                                required 
                            />
                            {validationErrors.name && <small className="text-danger">{validationErrors.name[0]}</small>}
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                            <label className="form-label text-muted">Email Address</label>
                            <input 
                                type="email" name="email"
                                className="form-control"
                                value={formData.email} onChange={handleChange}
                                required 
                            />
                            {validationErrors.email && <small className="text-danger">{validationErrors.email[0]}</small>}
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                            <label className="form-label text-muted">Password</label>
                            <input 
                                type="password" name="password"
                                className="form-control"
                                value={formData.password} onChange={handleChange}
                                placeholder="Minimal 8 karakter"
                                required 
                            />
                            {validationErrors.password && <small className="text-danger">{validationErrors.password[0]}</small>}
                        </div>

                        {/* Konfirmasi Password */}
                        <div className="mb-4">
                            <label className="form-label text-muted">Konfirmasi Password</label>
                            <input 
                                type="password" name="password_confirmation"
                                className="form-control"
                                value={formData.password_confirmation} onChange={handleChange}
                                placeholder="Ulangi password"
                                required 
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100 btn-login mb-3">
                            DAFTAR SEKARANG
                        </button>

                        <div className="text-center">
                            <span className="text-muted me-1">Sudah punya akun?</span>
                            <Link to="/login" className="text-decoration-none fw-bold">Login disini</Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;