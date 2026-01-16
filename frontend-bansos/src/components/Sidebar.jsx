import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  // 1. Ambil data user dari LocalStorage untuk cek Role
  let user = {};
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) user = JSON.parse(savedUser);
  } catch (e) {
    console.error("Error parsing user data", e);
  }

  const role = user?.role?.toLowerCase();

  // Style untuk link (Biasa vs Aktif)
  const getNavLinkClass = ({ isActive }) => {
    const baseClass = "list-group-item list-group-item-action py-3 border-0 fw-medium";
    // Jika aktif: Background biru, teks putih. Jika tidak: Teks abu-abu
    return isActive 
      ? `${baseClass} bg-primary text-white rounded-end-pill ms-2 me-0 shadow-sm` 
      : `${baseClass} text-secondary ms-2`;
  };

  return (
    <div className="d-flex flex-column pt-3">
      
      {/* === MENU KHUSUS ADMIN === */}
      {role === 'admin' && (
        <>
          <div className="px-4 mb-2 text-uppercase small text-muted fw-bold" style={{fontSize: '0.75rem'}}>
            Menu Admin
          </div>

          <NavLink to="/dashboard" className={getNavLinkClass}>
            <i className="bi bi-speedometer2 me-3"></i> Dashboard
          </NavLink>

          <NavLink to="/warga" className={getNavLinkClass}>
            <i className="bi bi-people me-3"></i> Data Warga
          </NavLink>

          <NavLink to="/program" className={getNavLinkClass}>
            <i className="bi bi-grid me-3"></i> Program Bantuan
          </NavLink>

          <NavLink to="/seleksi" className={getNavLinkClass}>
            <i className="bi bi-check-circle me-3"></i> Seleksi
          </NavLink>

          <NavLink to="/penyaluran" className={getNavLinkClass}>
            <i className="bi bi-box-seam me-3"></i> Penyaluran
          </NavLink>
        </>
      )}

      {/* === MENU KHUSUS KEPALA DESA === */}
      {role === 'kades' && (
        <>
          <div className="px-4 mb-2 text-uppercase small text-muted fw-bold" style={{fontSize: '0.75rem'}}>
            Menu Kades
          </div>

          {/* Kades diarahkan ke Persetujuan sebagai menu utamanya */}
          <NavLink to="/persetujuan" className={getNavLinkClass}>
            <i className="bi bi-file-earmark-check me-3"></i> Persetujuan
          </NavLink>

          {/* OPSI: Jika Kades boleh melihat riwayat penyaluran (Read Only) */}
          {/* <NavLink to="/penyaluran" className={getNavLinkClass}>
             <i className="bi bi-clock-history me-3"></i> Riwayat Penyaluran
          </NavLink> 
          */}
        </>
      )}

    </div>
  );
};

export default Sidebar;