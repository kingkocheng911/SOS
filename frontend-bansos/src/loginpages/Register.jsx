import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "./AuthStyle.css"; // Gunakan CSS yang sama

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [nik, setNik] = useState("");
    
    const [validation, setValidation] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            name: name,
            email: email,
            password: password,
            password_confirmation: passwordConfirm,
            nik: nik
        };

        try {
            await axios.post('http://localhost:8000/api/register', formData);
            alert("Registrasi Berhasil! Silakan Login.");
            navigate('/login');
        } catch (error) {
            setValidation(error.response.data);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                
                <div className="text-center mb-4">
                    <h3 className="auth-title">Buat Akun Baru</h3>
                    <p className="auth-subtitle">Lengkapi data diri sesuai KTP untuk mendaftar</p>
                </div>

                <form onSubmit={handleRegister}>
                    
                    {/* Input Nama */}
                    <div className="mb-3">
                        <label className="form-label-custom">Nama Lengkap</label>
                        <div className="input-group">
                            <span className="input-group-text input-group-text-custom"><i className="bi bi-person"></i></span>
                            <input 
                                type="text" 
                                className="form-control form-control-custom form-control-icon" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Sesuai KTP"
                                required
                            />
                        </div>
                        {validation.name && <div className="text-danger small mt-1">{validation.name[0]}</div>}
                    </div>

                    {/* Input NIK */}
                    <div className="mb-3">
                        <label className="form-label-custom">NIK (Nomor Induk Kependudukan)</label>
                        <div className="input-group">
                            <span className="input-group-text input-group-text-custom"><i className="bi bi-card-heading"></i></span>
                            <input 
                                type="text" 
                                className="form-control form-control-custom form-control-icon" 
                                value={nik} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val)) setNik(val); 
                                }} 
                                placeholder="16 Digit Angka"
                                maxLength={16}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                            {validation.nik && <div className="text-danger small">{validation.nik[0]}</div>}
                            <small className="text-muted ms-auto" style={{fontSize: '0.75rem'}}>{nik.length}/16</small>
                        </div>
                    </div>

                    {/* Input Email */}
                    <div className="mb-3">
                        <label className="form-label-custom">Alamat Email</label>
                        <div className="input-group">
                            <span className="input-group-text input-group-text-custom"><i className="bi bi-envelope"></i></span>
                            <input 
                                type="email" 
                                className="form-control form-control-custom form-control-icon" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="contoh@email.com"
                                required
                            />
                        </div>
                        {validation.email && <div className="text-danger small mt-1">{validation.email[0]}</div>}
                    </div>

                    {/* Row untuk Password agar rapi */}
                    <div className="row g-2 mb-3">
                        <div className="col-md-6">
                            <label className="form-label-custom">Password</label>
                            <input 
                                type="password" 
                                className="form-control form-control-custom" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Min 8 char"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label-custom">Ulangi Password</label>
                            <input 
                                type="password" 
                                className="form-control form-control-custom" 
                                value={passwordConfirm} 
                                onChange={(e) => setPasswordConfirm(e.target.value)} 
                                placeholder="Konfirmasi"
                                required
                            />
                        </div>
                    </div>
                    {validation.password && <div className="text-danger small mt-1 mb-2">{validation.password[0]}</div>}

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-primary-custom w-100 mt-2 mb-3"
                        disabled={loading}
                    >
                        {loading ? 'Mendaftarkan...' : 'DAFTAR SEKARANG'}
                    </button>
                </form>

                <div className="text-center pt-3 border-top">
                    <small className="text-muted">
                        Sudah punya akun? <Link to="/login" className="auth-link">Login Disini</Link>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Register;