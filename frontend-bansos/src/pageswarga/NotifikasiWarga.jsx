import React from "react";
import "./NotifikasiWarga.css"; // Pastikan import file CSS-nya

const NotifikasiWarga = ({ notifikasiList }) => {
    return (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
            {/* Header dengan aksen gradasi tipis */}
            <div className="card-header bg-white border-0 p-4 pb-0">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="bi bi-bell-fill text-primary fs-4"></i>
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0">Pusat Notifikasi</h5>
                            <p className="text-muted small mb-0">Kelola informasi bantuan Anda di sini</p>
                        </div>
                    </div>
                    <span className="badge rounded-pill bg-primary px-3 py-2 shadow-sm">
                        {notifikasiList.length} Notifikasi
                    </span>
                </div>
                <hr className="mt-4 mb-0 opacity-10" />
            </div>

            <div className="card-body p-4">
                <div className="notif-scroll-area pe-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {notifikasiList.length > 0 ? (
                        notifikasiList.map((notif, idx) => (
                            <div 
                                key={idx} 
                                className={`notif-card p-4 mb-3 rounded-4 border-0 shadow-sm animate-fade-in-up ${
                                    notif.is_read ? 'bg-light text-muted' : 'bg-white border-start border-primary'
                                }`}
                                style={{ 
                                    animationDelay: `${idx * 0.1}s`,
                                    cursor: 'pointer' 
                                }}
                            >
                                <div className="d-flex justify-content-between">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className={`badge ${notif.is_read ? 'bg-secondary' : 'bg-primary'} bg-opacity-10 text-${notif.is_read ? 'secondary' : 'primary'} small me-2`}>
                                                {notif.is_read ? 'Sudah Dibaca' : 'Pesan Baru'}
                                            </span>
                                            <small className="text-muted">
                                                <i className="bi bi-clock me-1"></i>
                                                {notif.created_at ? new Date(notif.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                }) : "Tadi"}
                                            </small>
                                        </div>
                                        
                                        {/* Logic teks pesan (fallback) */}
                                        <p className={`mb-0 lh-base ${notif.is_read ? 'text-secondary' : 'fw-semibold text-dark'}`} style={{ fontSize: '1.05rem' }}>
                                            {notif.message || notif.pesan || "Ada pembaruan status pada pengajuan bantuan sosial Anda."}
                                        </p>
                                    </div>

                                    {!notif.is_read && (
                                        <div className="ms-3">
                                            <span className="animate-pulse-red d-block bg-danger rounded-circle" style={{ width: '12px', height: '12px' }}></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5">
                            <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
                                <i className="bi bi-chat-square-dots text-muted display-4"></i>
                            </div>
                            <h6 className="fw-bold text-muted">Belum ada notifikasi</h6>
                            <p className="text-muted small">Pemberitahuan resmi akan tampil di sini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotifikasiWarga;