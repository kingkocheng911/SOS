import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataWarga.css'; 

export default function DataWarga() {
    // 1. STATE UTAMA (Tetap sama)
    const [formData, setFormData] = useState({
        nama: '', nik: '', no_telp: '', pekerjaan: '', gaji: '',
        tanggungan: '', dukuh: '', rw: '', rt: '', alamat: ''
    });

    const [loading, setLoading] = useState(false);
    const [isUnemployed, setIsUnemployed] = useState(false);
    const [masterWilayah, setMasterWilayah] = useState([]); 
    const [listRw, setListRw] = useState([]); 
    const [listRt, setListRt] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/wilayah-desa')
            .then(res => setMasterWilayah(res.data))
            .catch(err => console.error("Gagal ambil wilayah:", err));
    }, []);

    const handleDukuhChange = (e) => {
        const dukuhDipilih = e.target.value;
        setFormData(prev => ({ ...prev, dukuh: dukuhDipilih, rw: '', rt: '' }));
        setListRt([]); 
        const dataDukuh = masterWilayah.find(d => d.nama_dukuh === dukuhDipilih);
        setListRw(dataDukuh ? dataDukuh.list_rw : []);
    };

    const handleRwChange = (e) => {
        const rwDipilih = e.target.value;
        setFormData(prev => ({ ...prev, rw: rwDipilih, rt: '' }));
        const dataRw = listRw.find(r => r.rw === rwDipilih);
        setListRt(dataRw ? dataRw.list_rt : []);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number' && value < 0) return; 
        setFormData({ ...formData, [name]: value });
    };

    const handleUnemployedChange = (e) => {
        const checked = e.target.checked;
        setIsUnemployed(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, pekerjaan: 'Tidak Bekerja', gaji: 0 }));
        } else {
            setFormData(prev => ({ ...prev, pekerjaan: '', gaji: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/warga', formData); 
            if (response.data.status) {
                alert('Berhasil! ' + response.data.message);
                setFormData({
                    nama: '', nik: '', no_telp: '', pekerjaan: '', gaji: '',
                    tanggungan: '', dukuh: '', rw: '', rt: '', alamat: ''
                });
                setIsUnemployed(false);
                setListRw([]); setListRt([]);
                setTimeout(() => {
                    const mainContent = document.querySelector('main');
                    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan input');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="warga-page container-fluid py-4 animate-fade-in">
            <div className="warga-card shadow-sm">
                
                {/* Header Sesuai Gambar User */}
                <div className="card-header-modern">
                    <h2 className="card-title-modern">Tambah Data Warga Baru</h2>
                    <p className="card-subtitle-modern">Input data warga untuk seleksi otomatis program bantuan</p>
                </div>

                <form onSubmit={handleSubmit} className="warga-form p-4">
                    
                    {/* Baris 1: Nama & NIK */}
                    <div className="form-row cols-2 mb-4">
                        <div className="form-group slide-in-1">
                            <label className="form-label">Nama Lengkap</label>
                            <div className="custom-input-group">
                                <i className="bi bi-person icon-addon"></i>
                                <input 
                                    type="text" name="nama" required 
                                    value={formData.nama} onChange={handleChange}
                                    className="form-input-custom" placeholder="Nama Sesuai KTP"
                                />
                            </div>
                        </div>
                        <div className="form-group slide-in-1">
                            <label className="form-label">NIK (16 Digit)</label>
                            <div className="custom-input-group">
                                <i className="bi bi-card-heading icon-addon"></i>
                                <input 
                                    type="text" name="nik" required maxLength="16"
                                    value={formData.nik} onChange={handleChange}
                                    className="form-input-custom" placeholder="Contoh: 3301..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* No Telp */}
                    <div className="form-group mb-4 slide-in-2">
                        <label className="form-label">No. Handphone / WhatsApp</label>
                        <div className="custom-input-group">
                            <i className="bi bi-whatsapp icon-addon text-success"></i>
                            <input 
                                type="number" name="no_telp" required 
                                value={formData.no_telp} onChange={handleChange}
                                className="form-input-custom" placeholder="08123456789"
                            />
                        </div>
                    </div>

                    <div className="divider-text mb-4"><span>Domisili</span></div>

                    {/* Alamat Terintegrasi */}
                    <div className="alamat-container slide-in-3 mb-4">
                        <div className="form-row cols-3 mb-3">
                            <div className="form-group">
                                <label className="label-small">Dukuh</label>
                                <select name="dukuh" value={formData.dukuh} onChange={handleDukuhChange} required className="form-select-custom">
                                    <option value="">-- Pilih --</option>
                                    {masterWilayah.map((item, index) => (
                                        <option key={index} value={item.nama_dukuh}>{item.nama_dukuh}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label-small">RW</label>
                                <select name="rw" value={formData.rw} onChange={handleRwChange} required disabled={!formData.dukuh} className="form-select-custom">
                                    <option value="">-- Pilih --</option>
                                    {listRw.map((item, index) => (
                                        <option key={index} value={item.rw}>RW {item.rw}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label-small">RT</label>
                                <select name="rt" value={formData.rt} onChange={handleChange} required disabled={!formData.rw} className="form-select-custom">
                                    <option value="">-- Pilih --</option>
                                    {listRt.map((rt, index) => (
                                        <option key={index} value={rt}>RT {rt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label-small">Detail Jalan / Nomor Rumah</label>
                            <textarea name="alamat" required rows="2" value={formData.alamat} onChange={handleChange} className="form-input-custom" placeholder="Jl. Merpati No. 123..."></textarea>
                        </div>
                    </div>

                    <div className="divider-text mb-4"><span>Kondisi Ekonomi</span></div>

                    {/* Ekonomi Section */}
                    <div className="ekonomi-card slide-in-4 p-3 rounded-4 border mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0 fs-6 fw-bold color-primary">Pekerjaan & Penghasilan</h5>
                            <label className="modern-checkbox">
                                <input type="checkbox" checked={isUnemployed} onChange={handleUnemployedChange} />
                                <span className="checkmark"></span>
                                <span className="checkbox-text">Tidak Bekerja</span>
                            </label>
                        </div>
                        <div className="form-row cols-2">
                            <div className="form-group">
                                <input type="text" name="pekerjaan" required value={formData.pekerjaan} onChange={handleChange} disabled={isUnemployed} className="form-input-custom" placeholder="Jenis Pekerjaan" />
                            </div>
                            <div className="form-group">
                                <div className="custom-input-group">
                                    <span className="unit-addon">Rp</span>
                                    <input type="number" name="gaji" required min="0" value={formData.gaji} onChange={handleChange} disabled={isUnemployed} className="form-input-custom ps-5" placeholder="Gaji Bulanan" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group slide-in-5 mb-5">
                        <label className="form-label">Jumlah Tanggungan Keluarga</label>
                        <div className="custom-input-group w-50">
                            <input type="number" name="tanggungan" required min="0" value={formData.tanggungan} onChange={handleChange} className="form-input-custom" />
                            <span className="unit-addon-right">Orang</span>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-modern-submit slide-in-5">
                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-arrow-up-fill me-2"></i>}
                        Simpan Data Warga
                    </button>

                </form>
            </div>
        </div>
    );
}