import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Ganti Glasses/Mask dengan Sun dan Moon
import { User, Mail, Lock, CreditCard, ArrowRight, Sun, Moon } from 'lucide-react'; 
import { Toaster, toast } from 'sonner'; 
import "./AuthStyle.css";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [nik, setNik] = useState("");
    
    // State Password
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    // State untuk Toggle Lihat/Sembunyi (Terpisah untuk 2 input)
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [validation, setValidation] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(password !== passwordConfirm) {
            toast.error("Password konfirmasi tidak sama!");
            setLoading(false);
            return;
        }

        const formData = {
            name: name,
            email: email,
            password: password,
            password_confirmation: passwordConfirm,
            nik: nik
        };

        try {
            await axios.post('http://localhost:8000/api/register', formData);
            toast.success("Registrasi Berhasil! Mengalihkan ke login...");
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            const errorData = error.response?.data || {};
            setValidation(errorData);
            
            if (typeof errorData === 'object') {
                const firstError = Object.values(errorData)[0];
                if (firstError) toast.error(firstError[0]);
            } else {
                toast.error("Terjadi kesalahan saat pendaftaran");
            }
            setLoading(false);
        }
    };

    // Style dasar tombol intip (posisi & transisi)
    const baseToggleStyle = {
        right: '15px', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        cursor: 'pointer',
        zIndex: 20,
        transition: 'color 0.3s ease' // Efek transisi warna halus
    };

    return (
        <div className="auth-container">
            <Toaster position="top-center" richColors />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="auth-card"
                style={{ maxWidth: '520px' }} 
            >
                <div className="text-center mb-4">
                    <h3 className="fw-bold text-dark mb-1">Buat Akun Baru</h3>
                    <p className="text-muted small">Lengkapi data diri sesuai KTP</p>
                </div>

                <form onSubmit={handleRegister}>
                    {/* Nama */}
                    <div className="mb-3">
                        <label className="form-label-custom">Nama Lengkap</label>
                        <div className="input-wrapper">
                            <input 
                                type="text" className="form-control-modern" 
                                value={name} onChange={(e) => setName(e.target.value)} 
                                placeholder="Sesuai KTP" required
                            />
                            <User size={18} className="input-icon" />
                        </div>
                        {validation.name && <div className="text-danger small mt-1">{validation.name[0]}</div>}
                    </div>

                    {/* NIK */}
                    <div className="mb-3">
                        <label className="form-label-custom">NIK</label>
                        <div className="input-wrapper">
                            <input 
                                type="text" className="form-control-modern" 
                                value={nik} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val)) setNik(val); 
                                }} 
                                placeholder="16 Digit Angka" maxLength={16} required
                            />
                            <CreditCard size={18} className="input-icon" />
                        </div>
                        <div className="d-flex justify-content-end">
                             <small className="text-muted" style={{fontSize: '0.7rem'}}>{nik.length}/16</small>
                        </div>
                        {validation.nik && <div className="text-danger small mt-1">{validation.nik[0]}</div>}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label-custom">Email</label>
                        <div className="input-wrapper">
                            <input 
                                type="email" className="form-control-modern" 
                                value={email} onChange={(e) => setEmail(e.target.value)} 
                                placeholder="email@contoh.com" required
                            />
                            <Mail size={18} className="input-icon" />
                        </div>
                        {validation.email && <div className="text-danger small mt-1">{validation.email[0]}</div>}
                    </div>

                    {/* Password Row (2 Kolom) */}
                    <div className="row g-2 mb-4">
                        {/* Kolom Password Utama */}
                        <div className="col-md-6">
                            <label className="form-label-custom">Password</label>
                            <div className="input-wrapper position-relative">
                                <input 
                                    type={showPass ? "text" : "password"} 
                                    className="form-control-modern" 
                                    value={password} onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Min 8 char" required
                                    style={{ paddingRight: '40px' }}
                                />
                                <Lock size={18} className="input-icon" />
                                
                                {/* Tombol Matahari/Bulan 1 */}
                                <button type="button" onClick={() => setShowPass(!showPass)} 
                                    className="position-absolute border-0 bg-transparent p-0 d-flex align-items-center"
                                    style={{
                                        ...baseToggleStyle,
                                        color: showPass ? '#f59e0b' : '#94a3b8' // Oranye jika on, Abu jika off
                                    }} 
                                    title={showPass ? "Sembunyikan" : "Lihat"}
                                >
                                    {showPass ? <Sun size={19} /> : <Moon size={19} />}
                                </button>
                            </div>
                        </div>

                        {/* Kolom Konfirmasi Password */}
                        <div className="col-md-6">
                            <label className="form-label-custom">Ulangi Password</label>
                            <div className="input-wrapper position-relative">
                                <input 
                                    type={showConfirm ? "text" : "password"} 
                                    className="form-control-modern" 
                                    value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} 
                                    placeholder="Konfirmasi" required
                                    style={{ paddingRight: '40px' }}
                                />
                                <Lock size={18} className="input-icon" />

                                {/* Tombol Matahari/Bulan 2 */}
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} 
                                    className="position-absolute border-0 bg-transparent p-0 d-flex align-items-center"
                                    style={{
                                        ...baseToggleStyle,
                                        color: showConfirm ? '#f59e0b' : '#94a3b8' // Oranye jika on, Abu jika off
                                    }} 
                                    title={showConfirm ? "Sembunyikan" : "Lihat"}
                                >
                                    {showConfirm ? <Sun size={19} /> : <Moon size={19} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {validation.password && <div className="text-danger small mt-1 mb-2">{validation.password[0]}</div>}

                    {/* Tombol Daftar */}
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
                        disabled={loading}
                        style={{ background: 'linear-gradient(to right, #2563eb, #3b82f6)', border: 'none' }}
                    >
                        {loading ? 'Mendaftarkan...' : (
                             <>DAFTAR SEKARANG <ArrowRight size={18} /></>
                        )}
                    </motion.button>
                </form>

                <div className="text-center pt-3 border-top mt-3">
                    <small className="text-muted">
                        Sudah punya akun? <Link to="/login" className="text-primary fw-bold text-decoration-none ms-1">Login Disini</Link>
                    </small>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;