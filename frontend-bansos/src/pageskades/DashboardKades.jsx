import React from "react";

const DashboardKades = () => {
  // Mengambil data user dari localStorage untuk mendapatkan data profil
  let user = {};
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) user = JSON.parse(savedUser);
  } catch (e) {
    console.error("Gagal memuat data user", e);
  }

  /** * PERUBAHAN DI SINI:
   * Karena folder 'uploads' ada di folder public backend, 
   * kita langsung arahkan URL ke folder tersebut.
   */
  const fotoUrl = user.foto 
    ? `http://127.0.0.1:8000/uploads/${user.foto}` 
    : "https://ui-avatars.com/api/?name=Kepala+Desa&background=0d6efd&color=fff";

  return (
    <div className="container-fluid p-4">
      {/* Header Statis */}
      <div className="mb-4 text-start">
        <h2 className="fw-bold text-dark">Selamat Datang, Bapak Kepala Desa</h2>
        <p className="text-secondary">Sistem Informasi Validasi Bantuan Sosial (V.1.0)</p>
      </div>

      <div className="row g-4">
        {/* Kolom Kiri: Instruksi Kerja (Statis) */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4 text-start">
            <h5 className="fw-bold mb-3">Instruksi Verifikasi Data</h5>
            <div className="d-flex align-items-start mb-3">
              <div className="badge bg-primary rounded-circle me-3 p-2" style={{ width: '32px', height: '32px' }}>01</div>
              <p className="mb-0 text-muted text-start">Buka menu <strong>Persetujuan</strong> di sidebar kiri untuk melihat daftar warga yang sudah lolos seleksi awal oleh sistem.</p>
            </div>
            <div className="d-flex align-items-start mb-3">
              <div className="badge bg-primary rounded-circle me-3 p-2" style={{ width: '32px', height: '32px' }}>02</div>
              <p className="mb-0 text-muted text-start">Periksa kembali NIK dan profil warga. Pastikan data di lapangan sesuai dengan data yang masuk ke sistem.</p>
            </div>
            <div className="d-flex align-items-start">
              <div className="badge bg-primary rounded-circle me-3 p-2" style={{ width: '32px', height: '32px' }}>03</div>
              <p className="mb-0 text-muted text-start">Gunakan tombol <strong>Setujui</strong> untuk memasukkan warga ke daftar penerima, atau <strong>Tolak</strong> jika data tidak valid.</p>
            </div>
          </div>

          <div className="alert alert-info border-0 shadow-sm p-4 text-start">
            <h6 className="fw-bold"><i className="bi bi-info-circle-fill me-2"></i>Catatan Penting</h6>
            <p className="small mb-0">Setiap keputusan persetujuan yang Anda ambil akan langsung tercatat di sistem dan tidak dapat diubah tanpa koordinasi dengan Admin Bansos.</p>
          </div>
        </div>

        {/* Kolom Kanan: Info Profil (Foto Dinamis dari folder /uploads) */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm text-center p-4 h-100">
            <div className="py-3">
              {/* BAGIAN FOTO DINAMIS */}
              <div className="mb-3 d-flex justify-content-center">
                <img 
                  src={fotoUrl} 
                  alt="Profil Kades" 
                  className="rounded-circle shadow-sm border border-3 border-white"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  // Jika gambar tidak ditemukan di folder uploads, munculkan avatar inisial
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Kades&background=0d6efd&color=fff"; }}
                />
              </div>
              
              <h5 className="fw-bold mb-0">Kepala Desa</h5>
              <p className="text-muted small">Hak Akses: Verifikator Akhir</p>
            </div>
            <hr className="opacity-25" />
            <div className="text-start px-2">
              <p className="small text-muted mb-2"><i className="bi bi-calendar3 me-2 text-primary"></i> Periode Aktif: 2026</p>
              <p className="small text-muted mb-0"><i className="bi bi-geo-alt-fill me-2 text-primary"></i> Lokasi: Kantor Desa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardKades;