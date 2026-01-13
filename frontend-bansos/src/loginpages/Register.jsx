import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [nik, setNik] = useState(""); // <--- STATE BARU UNTUK NIK
    
    const [validation, setValidation] = useState([]);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // Data yang dikirim ke Backend
        const formData = {
            name: name,
            email: email,
            password: password,
            password_confirmation: passwordConfirm,
            nik: nik // <--- KIRIM NIK
        };

        try {
            await axios.post('http://localhost:8000/api/register', formData);
            
            // Jika sukses
            alert("Registrasi Berhasil! Silakan Login.");
            navigate('/login');

        } catch (error) {
            // Jika error (misal NIK sudah dipakai)
            setValidation(error.response.data);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg border-0 rounded-4 p-4" style={{ width: '400px' }}>
                <div className="text-center mb-4">
                    <h3 className="fw-bold text-success">Daftar Akun</h3>
                    <p className="text-muted small">Silakan isi data diri sesuai KTP</p>
                </div>

                <form onSubmit={handleRegister}>
                    
                    {/* INPUT NAMA */}
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Nama Lengkap</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Masukkan Nama Sesuai KTP"
                            required
                        />
                        {validation.name && (
                            <div className="text-danger small mt-1">{validation.name[0]}</div>
                        )}
                    </div>

                    {/* INPUT NIK (BARU) */}
                    <div className="mb-3">
                        <label className="form-label fw-bold small">NIK (Nomor Induk Kependudukan)</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={nik} 
                            onChange={(e) => {
                                // Hanya boleh angka
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) { 
                                    setNik(value); 
                                }
                            }} 
                            placeholder="16 Digit Angka"
                            maxLength={16}
                            required
                        />
                        <div className="d-flex justify-content-between">
                            {validation.nik && <div className="text-danger small">{validation.nik[0]}</div>}
                            <small className="text-muted ms-auto">{nik.length}/16</small>
                        </div>
                    </div>

                    {/* INPUT EMAIL */}
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Alamat Email</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="contoh@email.com"
                            required
                        />
                        {validation.email && (
                            <div className="text-danger small mt-1">{validation.email[0]}</div>
                        )}
                    </div>

                    {/* INPUT PASSWORD */}
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Minimal 8 karakter"
                            required
                        />
                        {validation.password && (
                            <div className="text-danger small mt-1">{validation.password[0]}</div>
                        )}
                    </div>

                        {/* INPUT KONFIRMASI PASSWORD (BARU) */}
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Ulangi Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={passwordConfirm} 
                            onChange={(e) => setPasswordConfirm(e.target.value)} 
                            placeholder="Ketik ulang password Anda"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-2 fw-bold mt-2">
                        DAFTAR SEKARANG
                    </button>
                </form>

                <div className="text-center mt-3">
                    <small className="text-muted">
                        Sudah punya akun? <Link to="/login" className="text-success fw-bold text-decoration-none">Login Disini</Link>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Register;