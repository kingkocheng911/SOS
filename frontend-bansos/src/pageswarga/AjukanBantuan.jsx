import React from "react";
import { Toaster, toast } from 'sonner'; 
import './AjukanBantuan.css';

const AjukanBantuan = ({ 
    user, 
    jenisBansos, 
    setJenisBansos, 
    daftarProgram, 
    alasan, 
    setAlasan, 
    isSubmitting, 
    handleSubmitPengajuan, 
    setActiveTab 
}) => {
    
    // Logika Cek Kelengkapan Profil
    const profilLengkap = 
        user.alamat && 
        (user.nomor_hp || user.no_telp) && 
        user.pekerjaan && 
        (user.gaji !== null && user.gaji !== undefined);

    // --- Wrapper untuk menangani Submit & Notifikasi ---
    const handleLocalSubmit = async (e) => {
        e.preventDefault(); // 1. Mencegah reload browser bawaan
        
        console.log("Tombol diklik, memproses..."); // Debugging di Console

        try {
            // Panggil fungsi kirim dari parent
            // PASTIKAN handleSubmitPengajuan di Parent (HomeWarga) tidak melakukan window.location.reload()
            await handleSubmitPengajuan(e);

            console.log("Sukses submit, memunculkan toast...");

            // Tampilkan Notifikasi Sukses
            toast.success("Pengajuan Berhasil Dikirim!", {
                description: "Data Anda sedang dalam proses verifikasi.",
                duration: 5000, // Tampil selama 5 detik
            });

            // Opsional: Bersihkan form setelah sukses
            setAlasan(""); 
            setJenisBansos("");
            
        } catch (error) {
            console.error("Error saat submit:", error);
            
            // Tampilkan Notifikasi Gagal
            toast.error("Gagal Mengirim Pengajuan", {
                description: "Silakan periksa koneksi atau coba lagi nanti.",
                duration: 4000,
            });
        }
    };

    if (!profilLengkap) {
        return (
            <div className="form-container warning-mode animate-fade-in">
                <div className="warning-illustration">
                    <div className="pulse-orange"></div>
                    <i className="bi bi-person-bounding-box warning-main-icon"></i>
                </div>
                
                <h3 className="warning-title">Lengkapi Profil Anda</h3>
                <p className="warning-text">
                    Sistem mendeteksi bahwa data profil Anda belum lengkap. Mohon lengkapi 
                    <strong> Alamat, Nomor HP, Pekerjaan, dan Gaji</strong> untuk melanjutkan pengajuan bantuan.
                </p>
                
                <button 
                    className="btn-action-primary shadow-sm" 
                    onClick={() => setActiveTab("profil")}
                >
                    <i className="bi bi-arrow-right-circle-fill me-2"></i> Buka Pengaturan Profil
                </button>
            </div>
        );
    }

    return (
        <div className="form-container-upgrade animate-fade-in">
            {/* PENTING: Toaster ditaruh di sini.
               richColors = agar berwarna (Hijau/Merah)
               position = posisi di atas tengah
               style zIndex = agar di atas navbar/modal
            */}
            <Toaster 
                position="top-center" 
                richColors 
                closeButton 
                style={{ zIndex: 99999 }} 
            />

            {/* Step Progress Indicator */}
            <div className="step-indicator">
                <div className="step active">
                    <div className="step-number">1</div>
                    <span>Data Diri</span>
                </div>
                <div className="step-line"></div>
                <div className="step active">
                    <div className="step-number">2</div>
                    <span>Pilih Program</span>
                </div>
                <div className="step-line"></div>
                <div className="step">
                    <div className="step-number">3</div>
                    <span>Verifikasi</span>
                </div>
            </div>

            <div className="form-content-wrapper">
                <div className="form-info-sidebar">
                    <div className="info-card-blue">
                        <h6><i className="bi bi-shield-check me-2"></i>Verifikasi Otomatis</h6>
                        <p>Data NIK Anda akan diverifikasi langsung dengan database kependudukan desa.</p>
                    </div>
                    <div className="info-card-light">
                        <h6>Tips Pengajuan:</h6>
                        <ul className="small text-muted ps-3">
                            <li>Gunakan bahasa yang sopan.</li>
                            <li>Jelaskan alasan secara mendetail.</li>
                            <li>Pastikan nomor WhatsApp aktif.</li>
                        </ul>
                    </div>
                </div>

                <div className="form-main-area">
                    <form onSubmit={handleLocalSubmit}>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="label-modern">Nama Lengkap</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-person"></i>
                                    <input type="text" className="input-modern readonly" value={user.name || ''} readOnly />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="label-modern">NIK Kependudukan</label>
                                <div className="input-with-icon">
                                    <i className="bi bi-card-text"></i>
                                    <input type="text" className="input-modern readonly" value={user.nik || ''} readOnly />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="label-modern">Pilih Program Bantuan</label>
                            <select 
                                className="input-modern select-custom" 
                                value={jenisBansos} 
                                onChange={(e) => setJenisBansos(e.target.value)} 
                                required
                            >
                                <option value="">-- Pilih Program --</option>
                                {daftarProgram.map((prog) => (
                                    <option key={prog.id} value={prog.id}>{prog.nama_program}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="label-modern">Alasan Pengajuan</label>
                            <textarea 
                                className="input-modern area-custom" 
                                rows="4" 
                                placeholder="Jelaskan mengapa Anda layak menerima bantuan ini..." 
                                value={alasan} 
                                onChange={(e) => setAlasan(e.target.value)} 
                                required
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-submit-modern" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span> Mengirim...</>
                            ) : (
                                <><i className="bi bi-send-check-fill me-2"></i> Kirim Pengajuan Bantuan</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AjukanBantuan;