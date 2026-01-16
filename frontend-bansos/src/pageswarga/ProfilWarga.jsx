import React, { useState, useEffect } from "react";
import axios from "axios";
import './ProfilWarga.css'; 

const ProfilWarga = ({
    user,
    formData,
    handleProfileChange,
    isUnemployed,
    handleUnemployedChange,
    previewUrl,
    onFileChange,
    handleUpdateProfile,
    isSubmitting
}) => {
    // --- STATE & LOGIC (TIDAK BERUBAH) ---
    const [isEditing, setIsEditing] = useState(false);
    const [masterWilayah, setMasterWilayah] = useState([]);
    
    // State Dropdown Wilayah
    const [selectedDukuh, setSelectedDukuh] = useState("");
    const [selectedRW, setSelectedRW] = useState("");
    const [selectedRT, setSelectedRT] = useState("");
    const [detailJalan, setDetailJalan] = useState("");
    const [listOpsiRW, setListOpsiRW] = useState([]);
    const [listOpsiRT, setListOpsiRT] = useState([]);

    // 1. Ambil Data Wilayah
    useEffect(() => {
        const fetchWilayah = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/wilayah-desa");
                setMasterWilayah(response.data);
            } catch (error) {
                console.error("Gagal ambil data wilayah:", error);
            }
        };
        fetchWilayah();
    }, []);

    // 2. Parsing Alamat
    useEffect(() => {
        if (isEditing && formData.alamat && masterWilayah.length > 0) {
            const parts = formData.alamat.split(", ");
            if (parts.length >= 3 && parts[0].includes("Dukuh")) {
                const dukuhVal = parts[0];
                const rwVal = parts[1].replace("RW ", "");
                const rtVal = parts[2].replace("RT ", "");
                const jalanVal = parts.slice(3).join(", ");
                
                setSelectedDukuh(dukuhVal);
                
                const wilayah = masterWilayah.find(item => item.nama_dukuh === dukuhVal);
                if (wilayah) {
                    setListOpsiRW(wilayah.list_rw);
                    setSelectedRW(rwVal);
                    const dataRW = wilayah.list_rw.find(r => r.rw === rwVal);
                    if (dataRW) {
                        setListOpsiRT(dataRW.list_rt);
                        setSelectedRT(rtVal);
                    }
                }
                setDetailJalan(jalanVal);
            } else {
                setDetailJalan(formData.alamat);
            }
        }
    }, [isEditing, formData.alamat, masterWilayah]);

    // Helper Update
    const updateParentAlamat = (dukuh, rw, rt, jalan) => {
        let alamatLengkap = jalan;
        if (dukuh && rw && rt) {
            alamatLengkap = `${dukuh}, RW ${rw}, RT ${rt}, ${jalan}`;
        }
        handleProfileChange({
            target: { name: "alamat", value: alamatLengkap }
        });
    };

    // Handlers
    const handleDukuhChange = (e) => {
        const dukuh = e.target.value;
        setSelectedDukuh(dukuh);
        setSelectedRW(""); 
        setSelectedRT("");
        const wilayah = masterWilayah.find(item => item.nama_dukuh === dukuh);
        setListOpsiRW(wilayah ? wilayah.list_rw : []);
        setListOpsiRT([]);
        updateParentAlamat(dukuh, "", "", detailJalan);
    };

    const handleRWChange = (e) => {
        const rw = e.target.value;
        setSelectedRW(rw);
        setSelectedRT("");
        const wilayah = masterWilayah.find(item => item.nama_dukuh === selectedDukuh);
        const dataRW = wilayah?.list_rw.find(item => item.rw === rw);
        setListOpsiRT(dataRW ? dataRW.list_rt : []);
        updateParentAlamat(selectedDukuh, rw, "", detailJalan);
    };

    const handleRTChange = (e) => {
        const rt = e.target.value;
        setSelectedRT(rt);
        updateParentAlamat(selectedDukuh, selectedRW, rt, detailJalan);
    };

    const handleDetailChange = (e) => {
        const jalan = e.target.value;
        setDetailJalan(jalan);
        updateParentAlamat(selectedDukuh, selectedRW, selectedRT, jalan);
    };

    const handleLocalSubmit = async (e) => {
        e.preventDefault();
        await handleUpdateProfile(e); 
        setIsEditing(false);
    };

    // --- RENDER UI (BERSIH DARI INLINE STYLE) ---
    return (
        <div>
            {/* Header Gradient */}
            <div className="profile-cover">
                {/* Tombol Edit */}
                {!isEditing && (
                    <button 
                        className="btn btn-light btn-sm position-absolute top-0 end-0 shadow-sm fw-bold btn-edit-floating" 
                        onClick={() => setIsEditing(true)}
                    >
                        <i className="bi bi-pencil-square me-2"></i> Edit Data
                    </button>
                )}

                {/* Foto Profil */}
                <div className="profile-pic-container">
                    <img 
                        src={previewUrl || (user.foto ? `http://localhost:8000/uploads/profil/${user.foto}` : "https://via.placeholder.com/150")} 
                        alt="Foto Profil" 
                        className="profile-pic"
                    />
                    
                    {/* Tombol Kamera (Edit Mode) */}
                    {isEditing && (
                        <div className="position-absolute bottom-0 end-0">
                            <input type="file" id="upload-foto" className="d-none" onChange={onFileChange} accept="image/*" />
                            <label htmlFor="upload-foto" className="btn btn-primary btn-sm rounded-circle shadow">
                                <i className="bi bi-camera-fill"></i>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Data Diri */}
            <div className="profile-details-card">
                
                {/* Nama & Role */}
                <div className="mt-4 mb-4">
                    <h2 className="user-name-large mb-0">{user.name}</h2>
                    <p className="user-role">
                        NIK: {user.nik} • 
                        <span className={`ms-2 badge ${formData.program_id ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                            {formData.program_id ? 'Penerima Bantuan' : 'Warga Desa'}
                        </span>
                    </p>
                </div>

                {/* --- MODE BACA (VIEW) --- */}
                {!isEditing ? (
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Nomor WhatsApp</label>
                            <p>{formData.no_telp || "-"}</p>
                        </div>
                        <div className="info-item">
                            <label>Pekerjaan</label>
                            <p>{isUnemployed ? "Tidak Bekerja" : formData.pekerjaan}</p>
                        </div>
                        <div className="info-item">
                            <label>Penghasilan Bulanan</label>
                            <p className="text-success">Rp {parseInt(formData.gaji || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="info-item">
                            <label>Jumlah Tanggungan</label>
                            <p>{formData.tanggungan} Orang</p>
                        </div>
                        {/* Menggunakan class info-item-full dari CSS */}
                        <div className="info-item info-item-full">
                            <label>Alamat Domisili</label>
                            <p>{formData.alamat || "Belum diisi"}</p>
                        </div>
                    </div>
                ) : (
                    /* --- MODE EDIT (FORM) --- */
                    <form onSubmit={handleLocalSubmit} className="mt-4">
                        <div className="alert alert-info py-2 small">
                            <i className="bi bi-info-circle me-2"></i> Silakan update data terbaru Anda.
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Nomor WhatsApp</label>
                                <input type="number" name="no_telp" className="form-control" value={formData.no_telp} onChange={handleProfileChange} required />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Jumlah Tanggungan</label>
                                <input type="number" name="tanggungan" className="form-control" value={formData.tanggungan} onChange={handleProfileChange} required />
                            </div>

                            {/* Alamat Logic */}
                            <div className="col-12">
                                <div className="p-3 bg-light rounded border">
                                    <label className="form-label small fw-bold text-primary">Alamat Lengkap</label>
                                    <div className="row g-2">
                                        <div className="col-4">
                                            <select className="form-select form-select-sm" value={selectedDukuh} onChange={handleDukuhChange}>
                                                <option value="">Pilih Dukuh...</option>
                                                {masterWilayah.map((w, i) => <option key={i} value={w.nama_dukuh}>{w.nama_dukuh}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-4">
                                            <select className="form-select form-select-sm" value={selectedRW} onChange={handleRWChange} disabled={!selectedDukuh}>
                                                <option value="">RW...</option>
                                                {listOpsiRW.map((r, i) => <option key={i} value={r.rw}>{r.rw}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-4">
                                            <select className="form-select form-select-sm" value={selectedRT} onChange={handleRTChange} disabled={!selectedRW}>
                                                <option value="">RT...</option>
                                                {listOpsiRT.map((rt, i) => <option key={i} value={rt}>{rt}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-12 mt-2">
                                            <input type="text" className="form-control form-control-sm" placeholder="Nama Jalan / Patokan rumah..." value={detailJalan} onChange={handleDetailChange} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pekerjaan */}
                            <div className="col-12">
                                <div className="form-check mb-2">
                                    <input className="form-check-input" type="checkbox" id="unemployedCheck" checked={isUnemployed} onChange={handleUnemployedChange} />
                                    <label className="form-check-label small" htmlFor="unemployedCheck">Saya Tidak Bekerja</label>
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Pekerjaan</label>
                                <input type="text" name="pekerjaan" className="form-control" value={formData.pekerjaan} onChange={handleProfileChange} disabled={isUnemployed} required={!isUnemployed} />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Gaji / Penghasilan</label>
                                <input type="number" name="gaji" className="form-control" value={formData.gaji} onChange={handleProfileChange} disabled={isUnemployed} required={!isUnemployed} />
                            </div>
                        </div>

                        {/* Tombol Simpan */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-light border px-4" onClick={() => setIsEditing(false)}>Batal</button>
                            <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilWarga;