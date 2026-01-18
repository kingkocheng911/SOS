import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; 
// Ganti Eye/EyeOff dengan Sun dan Moon
import { Mail, Lock, LogIn, Sun, Moon } from "lucide-react"; 
import { Toaster, toast } from "sonner"; 
import "./AuthStyle.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // State untuk mengatur apakah password terlihat atau tidak
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading("Memproses data..."); 
        
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/login", {
                email: email,
                password: password
            });

            const responseData = response.data.data || response.data; 
            const token = responseData.token;
            const user = responseData.user;
            
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            toast.dismiss(loadingToast); 
            toast.success(`Selamat datang, ${user.name}!`); 

            setTimeout(() => {
                const role = user.role.toLowerCase();
                if (role === 'admin') window.location.href = "/dashboard";
                else if (role === 'kades') window.location.href = "/kades/dashboard";
                else if (role === 'warga') window.location.href = "/home";
                else window.location.href = "/";
            }, 1000);

        } catch (error) {
            console.error("Login Error:", error);
            toast.dismiss(loadingToast);
            const pesan = error.response?.data?.message || "Email atau Password Salah!";
            toast.error(pesan); 
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Toaster position="top-center" richColors />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="auth-card"
                style={{ marginTop: '70px' }} 
            >
                {/* --- FLOATING LOGO --- */}
                <div className="position-absolute start-50 translate-middle" style={{ top: '0px', zIndex: 20 }}>
                     <motion.div
                        animate={{ y: [0, -8, 0] }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-white rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                        style={{ width: '130px', height: '130px', border: '4px solid #fff', overflow: 'hidden' }} 
                     >
                        <img 
                            src="/logodesa.png" 
                            alt="Logo" 
                            style={{ width: '115%', height: '115%', objectFit: 'contain' }} 
                        />
                     </motion.div>
                </div>

                <div className="text-center mt-5 pt-4 mb-4">
                    <h3 className="fw-bold text-dark mb-1 mt-3">Selamat Datang</h3>
                    <p className="text-muted small">Masuk ke Portal Bansos Terpadu</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label-custom">Email Address</label>
                        <div className="input-wrapper">
                            <input 
                                type="email" 
                                className="form-control-modern"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                            <Mail size={18} className="input-icon" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label-custom">Password</label>
                        <div className="input-wrapper position-relative">
                            
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control-modern"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                style={{ paddingRight: '45px' }} 
                            />
                            
                            {/* Ikon Gembok (Kiri) */}
                            <Lock size={18} className="input-icon" />

                            {/* --- TOMBOL MATAHARI / BULAN --- */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="position-absolute border-0 bg-transparent p-0 d-flex align-items-center"
                                style={{ 
                                    right: '15px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    // Jika show (Matahari) warna oranye, jika hide (Bulan) warna abu
                                    color: showPassword ? '#f59e0b' : '#94a3b8', 
                                    cursor: 'pointer',
                                    zIndex: 20,
                                    transition: 'color 0.3s ease'
                                }}
                                title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
                            >
                                {showPassword ? (
                                    <Sun size={19} /> // Password Terlihat (Terang)
                                ) : (
                                    <Moon size={19} /> // Password Tersembunyi (Gelap)
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
                        disabled={loading}
                        style={{ background: 'linear-gradient(to right, #2563eb, #3b82f6)', border: 'none' }}
                    >
                        {loading ? 'Memproses...' : (
                            <>MASUK SEKARANG <LogIn size={18} /></>
                        )}
                    </motion.button>

                    <div className="text-center mt-4 pt-3 border-top">
                        <span className="text-muted small">Belum memiliki akun? </span>
                        <Link to="/register" className="text-primary fw-bold text-decoration-none small ms-1">
                            Daftar Disini
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default Login;