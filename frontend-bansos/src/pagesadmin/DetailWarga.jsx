import React from 'react';
import './DetailWarga.css';

function DetailWarga({ data, isEditing, setIsEditing, onClose, onUpdate, onHapus, setData, readOnly = false }) {
    if (!data) return null;

    const listDukuh = ["Krajan", "Mulyoasri", "Sidodadi", "Sari Mulyo", "Wonosari"];

    const handleAlamatChange = (field, value) => {
        const currentDukuh = field === 'dukuh' ? value : (data.dukuh || "");
        const currentRT = field === 'rt' ? value : (data.rt || "");
        const currentRW = field === 'rw' ? value : (data.rw || "");

        setData({
            ...data,
            [field]: value,
            alamat: `Dukuh ${currentDukuh}, RT ${currentRT}/RW ${currentRW}`
        });
    };

    const getAvatarUrl = (name) => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=128&bold=true`;
    };

    return (
        <div className="modal d-block modal-overlay-custom">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-content-custom shadow-lg">
                    <div className="modal-header modal-header-custom text-white border-0">
                        <h5 className="modal-title fw-bold">
                            {isEditing ? "Form Pembaruan Data" : `Profil Penduduk`}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        {isEditing && !readOnly ? (
                            <form onSubmit={onUpdate}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="label-text mb-1">Nama Lengkap</label>
                                        <input type="text" className="form-control form-input-custom" value={data.nama || data.name || ''} 
                                            onChange={(e) => setData({...data, nama: e.target.value, name: e.target.value})} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="label-text mb-1">Nomor Induk Kependudukan</label>
                                        <input type="text" className="form-control form-input-custom" value={data.nik || ''} 
                                            onChange={(e) => setData({...data, nik: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="label-text mb-1">Profesi / Pekerjaan</label>
                                        <input type="text" className="form-control form-input-custom" value={data.pekerjaan || ''} 
                                            onChange={(e) => setData({...data, pekerjaan: e.target.value})} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="label-text mb-1">Kontak Telepon</label>
                                        <input type="text" className="form-control form-input-custom" value={data.no_telp || ''} 
                                            onChange={(e) => setData({...data, no_telp: e.target.value})} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="label-text mb-1">Estimasi Gaji (Rp)</label>
                                        <input type="number" className="form-control form-input-custom" value={data.gaji || ''} 
                                            onChange={(e) => setData({...data, gaji: e.target.value})} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="label-text mb-1">Jumlah Tanggungan</label>
                                        <input type="number" className="form-control form-input-custom" value={data.tanggungan || ''} 
                                            onChange={(e) => setData({...data, tanggungan: e.target.value})} />
                                    </div>
                                </div>

                                <div className="p-3 address-section rounded-3 mb-3">
                                    <label className="label-text fw-bold text-primary mb-2 d-block">Penyesuaian Domisili</label>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <label className="label-text" style={{fontSize: '10px'}}>Wilayah Dukuh</label>
                                            <select className="form-select form-select-sm form-input-custom shadow-none" value={data.dukuh || ''}
                                                onChange={(e) => handleAlamatChange('dukuh', e.target.value)}>
                                                <option value="">Pilih Dukuh</option>
                                                {listDukuh.map((d, i) => <option key={i} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="label-text" style={{fontSize: '10px'}}>RT</label>
                                            <input type="text" className="form-control form-select-sm form-input-custom shadow-none" placeholder="00"
                                                value={data.rt || ''} onChange={(e) => handleAlamatChange('rt', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="label-text" style={{fontSize: '10px'}}>RW</label>
                                            <input type="text" className="form-control form-select-sm form-input-custom shadow-none" placeholder="00"
                                                value={data.rw || ''} onChange={(e) => handleAlamatChange('rw', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mt-4">
                                    <button type="submit" className="btn btn-success w-100 fw-bold py-2 shadow-sm" style={{borderRadius: '10px'}}>Simpan Data</button>
                                    <button type="button" className="btn btn-outline-secondary w-100 py-2" style={{borderRadius: '10px'}} onClick={() => setIsEditing(false)}>Batalkan</button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center">
                                <div className="avatar-container mb-3 mx-auto shadow-sm rounded-circle">
                                   <img 
                                    src={data.foto_profile || getAvatarUrl(data.nama || data.name)} 
                                    alt="profile" 
                                    className="rounded-circle w-100 h-100 shadow-inner"
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = getAvatarUrl(data.nama || data.name); 
                                    }}
                                />
                            </div>

                                <h4 className="fw-bold mb-1 text-dark">{data.nama || data.name}</h4>
                                <div className="badge badge-nik px-3 py-2 rounded-pill mb-4">
                                    ID: {data.nik || "Tidak Terdaftar"}
                                </div>
                                
                                <div className="info-card-custom p-4 mb-4 text-start shadow-sm">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="label-text">Pekerjaan Saat Ini</div>
                                            <div className="value-text">{data.pekerjaan || "N/A"}</div>
                                        </div>
                                        <div className="col-6 text-end">
                                            <div className="label-text">Penghasilan Bulanan</div>
                                            <div className="value-text text-success">
                                                Rp {Number(data.gaji || 0).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="label-text">Beban Tanggungan</div>
                                            <div className="value-text">{data.tanggungan || "0"} Personel</div>
                                        </div>
                                        <div className="col-6 text-end">
                                            <div className="label-text">Nomor Handphone</div>
                                            <div className="value-text">{data.no_telp || "N/A"}</div>
                                        </div>
                                        <div className="col-12 mt-2 pt-2 border-top">
                                            <div className="label-text">Lokasi Tempat Tinggal</div>
                                            <div className="value-text text-primary">
                                                {data.dukuh ? `Dukuh ${data.dukuh}, Lingkungan RW ${data.rw || '0'}, Unit RT ${data.rt || '0'}` : (data.alamat || "Alamat belum diatur")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!readOnly ? (
                                    <div className="d-flex gap-3">
                                        <button className="btn btn-edit-custom w-100 fw-bold" onClick={() => setIsEditing(true)}>Modifikasi</button>
                                        <button className="btn btn-outline-danger w-100 fw-bold" style={{borderRadius:'10px'}} onClick={() => onHapus(data.id)}>Hapus Permanen</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-dark w-100 fw-bold py-2 shadow-sm" style={{borderRadius:'10px'}} onClick={onClose}>Keluar Detail</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailWarga;