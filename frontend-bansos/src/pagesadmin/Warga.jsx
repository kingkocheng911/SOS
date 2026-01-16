import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataWarga.css'; // IMPORT CSS BARU DI SINI

export default function DataWarga() {
    // 1. STATE UTAMA (TIDAK BERUBAH)
    const [formData, setFormData] = useState({
        nama: '',
        nik: '',
        no_telp: '',
        pekerjaan: '',
        gaji: '',
        tanggungan: '',
        // Field Alamat Dipecah
        dukuh: '',
        rw: '',
        rt: '',
        alamat: '' // Ini untuk detail jalan/nomor rumah
    });

    // 2. STATE TAMBAHAN UNTUK WILAYAH & UI (TIDAK BERUBAH)
    const [loading, setLoading] = useState(false);
    const [isUnemployed, setIsUnemployed] = useState(false);
    
    // State untuk menyimpan data wilayah dari API (TIDAK BERUBAH)
    const [masterWilayah, setMasterWilayah] = useState([]); 
    const [listRw, setListRw] = useState([]); 
    const [listRt, setListRt] = useState([]);

    // 3. AMBIL DATA WILAYAH SAAT HALAMAN DIBUKA (TIDAK BERUBAH)
    useEffect(() => {
        axios.get('http://localhost:8000/api/wilayah-desa')
            .then(res => {
                setMasterWilayah(res.data);
            })
            .catch(err => console.error("Gagal ambil wilayah:", err));
    }, []);

    // --- LOGIKA DROPDOWN BERTINGKAT (TIDAK BERUBAH) ---
    
    // Saat Dukuh Dipilih
    const handleDukuhChange = (e) => {
        const dukuhDipilih = e.target.value;
        
        // Reset RW dan RT saat dukuh ganti
        setFormData(prev => ({ ...prev, dukuh: dukuhDipilih, rw: '', rt: '' }));
        setListRt([]); 

        // Cari RW yang sesuai dengan Dukuh ini
        const dataDukuh = masterWilayah.find(d => d.nama_dukuh === dukuhDipilih);
        setListRw(dataDukuh ? dataDukuh.list_rw : []);
    };

    // Saat RW Dipilih
    const handleRwChange = (e) => {
        const rwDipilih = e.target.value;

        // Reset RT saat RW ganti
        setFormData(prev => ({ ...prev, rw: rwDipilih, rt: '' }));

        // Cari RT yang sesuai dengan RW ini
        const dataRw = listRw.find(r => r.rw === rwDipilih);
        setListRt(dataRw ? dataRw.list_rt : []);
    };

    // --- HANDLE INPUT BIASA (TIDAK BERUBAH) ---
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'number' && value < 0) return; 

        setFormData({
            ...formData,
            [name]: value
        });
    };

    // --- HANDLE CHECKBOX TIDAK BEKERJA (TIDAK BERUBAH) ---
    const handleUnemployedChange = (e) => {
        const checked = e.target.checked;
        setIsUnemployed(checked);

        if (checked) {
            setFormData(prev => ({
                ...prev,
                pekerjaan: 'Tidak Bekerja',
                gaji: 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                pekerjaan: '',
                gaji: ''
            }));
        }
    };

    // --- SUBMIT DATA (TIDAK BERUBAH) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Frontend mengirim data terpisah (dukuh, rt, rw, alamat).
            // Pastikan Controller Backend sudah kamu update untuk menggabungkannya ("menjahitnya").
            const response = await axios.post('http://localhost:8000/api/warga', formData); 
            
            if (response.data.status) {
                alert('Berhasil! ' + response.data.message); // Sesuaikan key response (message/pesan)
                // Reset Form Total
                setFormData({
                    nama: '', nik: '', no_telp: '',
                    pekerjaan: '', gaji: '', tanggungan: '',
                    dukuh: '', rw: '', rt: '', alamat: ''
                });
                setIsUnemployed(false);
                setListRw([]);
                setListRt([]);
            }
        } catch (error) {
            console.error("Error:", error);
            const msg = error.response?.data?.message || 'Terjadi kesalahan input';
            alert(msg);
        }
        setLoading(false);
    };

    return (
        // Menggunakan class dari DataWarga.css
        <div className="warga-page">
            <div className="warga-card">
                
                {/* Header Card */}
                <div className="card-header">
                    <h2 className="card-title">Formulir Data Warga</h2>
                    <p className="card-subtitle">Lengkapi data di bawah ini untuk pendataan bansos.</p>
                </div>

                <form onSubmit={handleSubmit} className="warga-form">
                    
                    {/* Grid 2 Kolom untuk NIK & Nama */}
                    <div className="form-row cols-2">
                        <div className="form-group">
                            <label className="form-label">Nama Lengkap</label>
                            <input 
                                type="text" name="nama" required 
                                value={formData.nama} onChange={handleChange}
                                className="form-input"
                                placeholder="Sesuai KTP"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">NIK (16 Digit)</label>
                            <input 
                                type="text" name="nik" required maxLength="16"
                                value={formData.nik} onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: 320123..."
                            />
                        </div>
                    </div>

                    {/* No Telp */}
                    <div className="form-group">
                        <label className="form-label">No. Handphone / WhatsApp</label>
                        <input 
                            type="number" name="no_telp" required 
                            value={formData.no_telp} onChange={handleChange}
                            className="form-input"
                            placeholder="0812..."
                        />
                    </div>

                    <hr className="form-divider" />

                    {/* --- BAGIAN ALAMAT BARU (DROPDOWN) --- */}
                    <div>
                        <h3 className="form-label" style={{fontSize: '1.1rem', marginBottom: '1rem'}}>Alamat Domisili</h3>
                        
                        {/* Grid 3 Kolom untuk Dukuh, RW, RT */}
                        <div className="form-row cols-3" style={{ marginBottom: '1rem' }}>
                            
                            {/* Dropdown Dukuh */}
                            <div className="form-group">
                                <label className="label-small">Dukuh / Dusun</label>
                                <select 
                                    name="dukuh"
                                    value={formData.dukuh} 
                                    onChange={handleDukuhChange}
                                    required
                                    className="form-select"
                                >
                                    <option value="">-- Pilih --</option>
                                    {masterWilayah.map((item, index) => (
                                        <option key={index} value={item.nama_dukuh}>{item.nama_dukuh}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dropdown RW */}
                            <div className="form-group">
                                <label className="label-small">RW</label>
                                <select 
                                    name="rw"
                                    value={formData.rw} 
                                    onChange={handleRwChange}
                                    required
                                    disabled={!formData.dukuh}
                                    className="form-select"
                                >
                                    <option value="">-- Pilih --</option>
                                    {listRw.map((item, index) => (
                                        <option key={index} value={item.rw}>RW {item.rw}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dropdown RT */}
                            <div className="form-group">
                                <label className="label-small">RT</label>
                                <select 
                                    name="rt"
                                    value={formData.rt} 
                                    onChange={handleChange} 
                                    required
                                    disabled={!formData.rw}
                                    className="form-select"
                                >
                                    <option value="">-- Pilih --</option>
                                    {listRt.map((rt, index) => (
                                        <option key={index} value={rt}>RT {rt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Detail Alamat (Jalan/No Rumah) */}
                        <div className="form-group">
                            <label className="form-label">Detail Jalan / Nomor Rumah</label>
                            <textarea 
                                name="alamat" required rows="2"
                                value={formData.alamat} onChange={handleChange}
                                className="form-textarea"
                                placeholder="Contoh: Jl. Merpati No. 45, Gang Buntu..."
                            ></textarea>
                        </div>
                    </div>

                    <hr className="form-divider" />

                    {/* Bagian Ekonomi */}
                    <div>
                        <div className="checkbox-wrapper">
                            <h3 className="form-label" style={{fontSize: '1.1rem', margin: 0}}>Informasi Ekonomi</h3>
                            
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={isUnemployed} 
                                    onChange={handleUnemployedChange}
                                    style={{ width: '16px', height: '16px' }}
                                />
                                <span style={{fontSize: '0.85rem', fontWeight: 600, color: '#4b5563'}}>Tidak Bekerja</span>
                            </label>
                        </div>

                        <div className="form-row cols-2">
                            <div className="form-group">
                                <label className="form-label">Pekerjaan</label>
                                <input 
                                    type="text" name="pekerjaan" required 
                                    value={formData.pekerjaan} onChange={handleChange}
                                    disabled={isUnemployed}
                                    className="form-input"
                                    placeholder={isUnemployed ? "Tidak Bekerja" : "Contoh: Buruh, Pedagang..."}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Penghasilan Bulanan (Rp)</label>
                                <input 
                                    type="number" name="gaji" required min="0"
                                    value={formData.gaji} onChange={handleChange}
                                    disabled={isUnemployed}
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tanggungan */}
                    <div className="form-group">
                        <label className="form-label">Jumlah Tanggungan (Orang)</label>
                        <div className="input-with-unit">
                            <input 
                                type="number" name="tanggungan" required min="0"
                                value={formData.tanggungan} onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: 2"
                            />
                            <span className="unit-text">Orang</span>
                        </div>
                        <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '4px'}}>*Istri dan anak yang belum menikah.</p>
                    </div>

                    {/* Tombol Aksi */}
                    <div style={{ paddingTop: '1rem' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-submit"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Menyimpan...
                                </>
                            ) : 'Simpan Data Warga'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}