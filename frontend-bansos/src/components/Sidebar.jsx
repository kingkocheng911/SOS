import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  // Logic User & Role (Tetap)
  let user = {};
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) user = JSON.parse(savedUser);
  } catch (e) {
    console.error(e);
  }
  const role = user?.role?.toLowerCase();

  // Logic Notifikasi (Tetap)
  useEffect(() => {
    if (role === "warga") {
      const token = localStorage.getItem("token");
      axios
        .get("http://127.0.0.1:8000/api/notifikasi", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const unread = res.data.data?.filter((n) => n.is_read == 0).length;
          setNotifCount(unread || 0);
        })
        .catch(() => {});
    }
  }, [role]);

  // CSS Class Logic (Tetap)
  const getNavLinkClass = ({ isActive }) => {
    const baseClass = "nav-item d-flex align-items-center w-100 border-0 bg-transparent text-start mb-1 px-3 py-2 text-decoration-none";
    return isActive ? `${baseClass} active` : `${baseClass} text-secondary`;
  };

  return (
    <div className="sidebar-container d-flex flex-column h-100 shadow-sm"
    style={{ paddingTop: '100px' }}>
      {/* Brand & Logout sudah dihapus sesuai permintaan sebelumnya */}
      
      <div className="flex-grow-1 overflow-y-auto px-2 py-3">
        {/* === MENU KEPALA DESA (KADES) === */}
        {role === "kades" && (
          <>
            <div className="sidebar-title px-3 mb-2 small fw-bold text-uppercase text-muted opacity-50">Menu Kades</div>
            {/* Pastikan Path "to" ini sama dengan path di App.js */}
            <NavLink to="/kades/dashboard" className={getNavLinkClass}>
              <i className="bi bi-speedometer2 me-3"></i> Dashboard
            </NavLink>
            <NavLink to="/kades/persetujuan" className={getNavLinkClass}>
              <i className="bi bi-file-earmark-check-fill me-3"></i> Persetujuan
            </NavLink>
          </>
        )}

        {/* === MENU ADMIN === */}
        {role === "admin" && (
          <>
            <div className="sidebar-title px-3 mb-2 small fw-bold text-uppercase text-muted opacity-50">Menu Admin</div>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              <i className="bi bi-grid-fill me-3"></i> Dashboard
            </NavLink>
            <NavLink to="/warga" className={getNavLinkClass}>
              <i className="bi bi-people-fill me-3"></i> Data Warga
            </NavLink>
            <NavLink to="/program" className={getNavLinkClass}>
              <i className="bi bi-stack me-3"></i> Program Bantuan
            </NavLink>
            <NavLink to="/seleksi" className={getNavLinkClass}>
              <i className="bi bi-check-circle-fill me-3"></i> Seleksi
            </NavLink>
            <NavLink to="/penyaluran" className={getNavLinkClass}>
              <i className="bi bi-truck me-3"></i> Penyaluran
            </NavLink>
          </>
        )}

        {/* === MENU WARGA === */}
        {role === "warga" && (
          <>
            <div className="sidebar-title px-3 mb-2 small fw-bold text-uppercase text-muted opacity-50">Menu Utama</div>
            <NavLink to="/home" className={getNavLinkClass}>
              <i className="bi bi-house-door-fill me-3"></i> Beranda
            </NavLink>
            <NavLink to="/ajukan" className={getNavLinkClass}>
              <i className="bi bi-send-plus-fill me-3"></i> Ajukan Bantuan
            </NavLink>
            <NavLink to="/profil-warga" className={getNavLinkClass}>
              <i className="bi bi-person-badge-fill me-3"></i> Profil Warga
            </NavLink>
            <NavLink to="/notifikasi" className={getNavLinkClass}>
              <i className="bi bi-bell-fill me-3"></i> Notifikasi
              {notifCount > 0 && (
                <span className="badge bg-danger rounded-pill ms-auto small">{notifCount}</span>
              )}
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;