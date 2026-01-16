import React from "react";
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
    
    // 1. LOGIKA CEK KELENGKAPAN PROFIL
    const profilLengkap = 
        user.alamat && 
        (user.nomor_hp || user.no_telp) && 
        user.pekerjaan && 
        (user.gaji !== null && user.gaji !== undefined);

    // 2. TAMPILAN JIKA PROFIL BELUM LENGKAP (Warning State)
    if (!profilLengkap) {
        return (
            <div className="form-container warning-mode">
                <div className="warning-icon-wrapper">
                    <i className="bi bi-exclamation-triangle-fill warning-icon"></i>
                </div>
                
                <h3 className="warning-title">Profil Belum Lengkap</h3>
                
                <p className="warning-text">
                    Untuk menjamin validitas data, Anda wajib melengkapi data 
                    <strong className="text-dark"> Alamat, Nomor HP, Pekerjaan, dan Gaji</strong> sebelum mengajukan bantuan.
                </p>
                
                <button 
                    className="btn-primary-gradient btn-warning-action" 
                    onClick={() => setActiveTab("profil")}
                >
                    <i className="bi bi-pencil-square"></i> Lengkapi Profil
                </button>
            </div>
        );
    }

    // 3. TAMPILAN FORMULIR UTAMA (Ready State)
    return (
        <div className="form-container">
            {/* Header Form */}
            <div className="form-header">
                <div className="header-icon-box">
                    <i className="bi bi-file-earmark-text-fill text-primary fs-4"></i>
                </div>
                <div>
                    <h5 className="form-title">Formulir Pengajuan</h5>
                    <p className="form-subtitle">Isi data dengan jujur dan benar.</p>
                </div>
            </div>
            
            <form onSubmit={handleSubmitPengajuan}>
                <div className="row">
                    {/* Input Nama (Read Only) */}
                    <div className="col-md-6 input-group">
                        <label className="modern-label">Nama Lengkap</label>
                        <input 
                            type="text" 
                            className="modern-input read-only" 
                            value={user.name || user.nama || ''} 
                            readOnly 
                        />
                    </div>
                    
                    {/* Input NIK (Read Only) */}
                    <div className="col-md-6 input-group">
                        <label className="modern-label">Nomor Induk Kependudukan (NIK)</label>
                        <input 
                            type="text" 
                            className="modern-input read-only" 
                            value={user.nik || ''} 
                            readOnly 
                        />
                    </div>
                </div>
                
                {/* Pilihan Jenis Bantuan */}
                <div className="input-group">
                    <label className="modern-label">Program Bantuan</label>
                    <select 
                        className="modern-input" 
                        value={jenisBansos} 
                        onChange={(e) => setJenisBansos(e.target.value)} 
                        required
                        style={{cursor: 'pointer'}}
                    >
                        <option value="">-- Pilih Program Bantuan Sosial --</option>
                        {daftarProgram.map((prog) => (
                            <option key={prog.id} value={prog.id}>
                                {prog.nama_program}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Input Alasan */}
                <div className="input-group">
                    <label className="modern-label">Alasan Pengajuan</label>
                    <textarea 
                        className="modern-input" 
                        rows="5" 
                        placeholder="Ceritakan kondisi ekonomi keluarga Anda saat ini..." 
                        value={alasan} 
                        onChange={(e) => setAlasan(e.target.value)} 
                        required
                    ></textarea>
                    
                    <div className="input-helper">
                        <i className="bi bi-info-circle me-2 text-primary"></i>
                        <span>Pastikan alasan yang Anda tulis sesuai dengan fakta di lapangan untuk mempermudah proses verifikasi.</span>
                    </div>
                </div>

                {/* Tombol Submit dengan Loading State */}
                <div className="mt-4">
                    <button 
                        type="submit" 
                        className="btn-primary-gradient" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Sedang Mengirim Data...</span>
                            </>
                        ) : (
                            <>
                                <i className="bi bi-send-fill"></i> Kirim Permohonan Sekarang
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AjukanBantuan;