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
    const [isEditing, setIsEditing] = useState(false);
    const [masterWilayah, setMasterWilayah] = useState([]);
    
    // State Dropdown Wilayah
    const [selectedDukuh, setSelectedDukuh] = useState("");
    const [selectedRW, setSelectedRW] = useState("");
    const [selectedRT, setSelectedRT] = useState("");
    const [detailJalan, setDetailJalan] = useState("");
    const [listOpsiRW, setListOpsiRW] = useState([]);
    const [listOpsiRT, setListOpsiRT] = useState([]);

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
            }
        }
    }, [isEditing, formData.alamat, masterWilayah]);

    const updateParentAlamat = (dukuh, rw, rt, jalan) => {
        let alamatLengkap = jalan;
        if (dukuh && rw && rt) {
            alamatLengkap = `${dukuh}, RW ${rw}, RT ${rt}, ${jalan}`;
        }
        handleProfileChange({ target: { name: "alamat", value: alamatLengkap } });
    };

    const handleLocalSubmit = async (e) => {
        e.preventDefault();
        await handleUpdateProfile(e); 
        setIsEditing(false);
    };

    return (
        <div className="profile-container-modern animate-fade-in">
            {/* Header / Cover */}
            <div className="profile-banner">
                {!isEditing && (
                    <button className="btn-edit-glass shadow-sm" onClick={() => setIsEditing(true)}>
                        <i className="bi bi-pencil-square me-2"></i>Edit Data
                    </button>
                )}
            </div>

            <div className="profile-main-content">
                <div className="row g-0">
                    {/* KOLOM KIRI: Foto Profil */}
                    <div className="col-md-4 col-lg-3 profile-sidebar">
                        <div className="avatar-container-left">
                            <div className="avatar-wrapper shadow">
                                <img 
                                    src={previewUrl || (user.foto ? `http://localhost:8000/uploads/profil/${user.foto}` : "https://via.placeholder.com/150")} 
                                    alt="User" 
                                    className="img-profile-left"
                                />
                                {isEditing && (
                                    <label htmlFor="upload-foto" className="upload-badge">
                                        <i className="bi bi-camera-fill"></i>
                                        <input type="file" id="upload-foto" className="d-none" onChange={onFileChange} accept="image/*" />
                                    </label>
                                )}
                            </div>
                            <div className="text-center mt-3 d-none d-md-block">
                                <span className={`status-badge-modern ${formData.program_id ? 'active' : 'inactive'}`}>
                                    {formData.program_id ? 'Penerima Bantuan' : 'Warga Desa'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: Detail Informasi */}
                    <div className="col-md-8 col-lg-9 profile-details-area">
                        <div className="profile-info-header">
                            <h2 className="fw-bold text-dark mb-1">{user.name}</h2>
                            <p className="text-muted mb-0">NIK: {user.nik}</p>
                        </div>

                        {!isEditing ? (
                            /* --- MODE VIEW --- */
                            <div className="info-grid-modern animate-slide-up">
                                <div className="info-item-card">
                                    <div className="icon-circle"><i className="bi bi-whatsapp"></i></div>
                                    <div className="info-label-group">
                                        <label>WhatsApp</label>
                                        <p>{formData.no_telp || "-"}</p>
                                    </div>
                                </div>
                                <div className="info-item-card">
                                    <div className="icon-circle"><i className="bi bi-briefcase"></i></div>
                                    <div className="info-label-group">
                                        <label>Pekerjaan</label>
                                        <p>{isUnemployed ? "Tidak Bekerja" : formData.pekerjaan}</p>
                                    </div>
                                </div>
                                <div className="info-item-card">
                                    <div className="icon-circle"><i className="bi bi-cash-stack"></i></div>
                                    <div className="info-label-group">
                                        <label>Penghasilan</label>
                                        <p className="text-success fw-bold">Rp {parseInt(formData.gaji || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <div className="info-item-card">
                                    <div className="icon-circle"><i className="bi bi-people"></i></div>
                                    <div className="info-label-group">
                                        <label>Tanggungan</label>
                                        <p>{formData.tanggungan} Orang</p>
                                    </div>
                                </div>
                                <div className="info-item-card full-width">
                                    <div className="icon-circle"><i className="bi bi-geo-alt"></i></div>
                                    <div className="info-label-group">
                                        <label>Alamat Domisili</label>
                                        <p>{formData.alamat || "Alamat belum dilengkapi"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* --- MODE EDIT --- */
                            <form onSubmit={handleLocalSubmit} className="edit-form-area animate-fade-in">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Nomor WhatsApp</label>
                                        <input type="number" name="no_telp" className="form-control custom-input" value={formData.no_telp} onChange={handleProfileChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Jumlah Tanggungan</label>
                                        <input type="number" name="tanggungan" className="form-control custom-input" value={formData.tanggungan} onChange={handleProfileChange} required />
                                    </div>
                                    <div className="col-12 mt-4">
                                        <div className="address-edit-box shadow-sm">
                                            <h6 className="fw-bold mb-3"><i className="bi bi-geo me-2"></i>Update Alamat</h6>
                                            <div className="row g-2">
                                                <div className="col-4">
                                                    <select className="form-select form-select-sm" value={selectedDukuh} onChange={(e) => {
                                                        const d = e.target.value; setSelectedDukuh(d);
                                                        const wil = masterWilayah.find(it => it.nama_dukuh === d);
                                                        setListOpsiRW(wil ? wil.list_rw : []);
                                                        updateParentAlamat(d, "", "", detailJalan);
                                                    }}>
                                                        <option value="">Dukuh</option>
                                                        {masterWilayah.map((w, i) => <option key={i} value={w.nama_dukuh}>{w.nama_dukuh}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-4">
                                                    <select className="form-select form-select-sm" value={selectedRW} disabled={!selectedDukuh} onChange={(e) => {
                                                        const r = e.target.value; setSelectedRW(r);
                                                        const wil = masterWilayah.find(it => it.nama_dukuh === selectedDukuh);
                                                        const dRW = wil?.list_rw.find(it => it.rw === r);
                                                        setListOpsiRT(dRW ? dRW.list_rt : []);
                                                        updateParentAlamat(selectedDukuh, r, "", detailJalan);
                                                    }}>
                                                        <option value="">RW</option>
                                                        {listOpsiRW.map((rw, i) => <option key={i} value={rw.rw}>{rw.rw}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-4">
                                                    <select className="form-select form-select-sm" value={selectedRT} disabled={!selectedRW} onChange={(e) => {
                                                        setSelectedRT(e.target.value);
                                                        updateParentAlamat(selectedDukuh, selectedRW, e.target.value, detailJalan);
                                                    }}>
                                                        <option value="">RT</option>
                                                        {listOpsiRT.map((rt, i) => <option key={i} value={rt}>{rt}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-12 mt-2">
                                                    <input type="text" className="form-control custom-input" placeholder="Nama Jalan / No Rumah" value={detailJalan} onChange={(e) => {
                                                        setDetailJalan(e.target.value);
                                                        updateParentAlamat(selectedDukuh, selectedRW, selectedRT, e.target.value);
                                                    }} required />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-3">
                                        <div className="form-check form-switch mb-3">
                                            <input className="form-check-input" type="checkbox" id="unemployed" checked={isUnemployed} onChange={handleUnemployedChange} />
                                            <label className="form-check-label small fw-bold" htmlFor="unemployed">Saya sedang tidak bekerja</label>
                                        </div>
                                    </div>
                                    {!isUnemployed && (
                                        <>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small">Pekerjaan</label>
                                                <input type="text" name="pekerjaan" className="form-control custom-input" value={formData.pekerjaan} onChange={handleProfileChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small">Gaji</label>
                                                <input type="number" name="gaji" className="form-control custom-input" value={formData.gaji} onChange={handleProfileChange} required />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-5">
                                    <button type="button" className="btn btn-light border px-4" onClick={() => setIsEditing(false)}>Batal</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isSubmitting}>
                                        {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilWarga;