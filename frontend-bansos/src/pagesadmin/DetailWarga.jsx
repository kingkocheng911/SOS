import React from 'react';

function DetailWarga({ data, isEditing, setIsEditing, onClose, onUpdate, onHapus, setData, readOnly = false }) {
    if (!data) return null;

    // Daftar Dukuh
    const listDukuh = ["Krajan", "Mulyoasri", "Sidodadi", "Sari Mulyo", "Wonosari"];

    // Handler khusus untuk input alamat
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

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            {isEditing ? "Edit Data Warga" : `Profil: ${data.nama || data.name}`}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        {isEditing && !readOnly ? (
                            /* MODE EDIT (Hanya bisa jika bukan readOnly) */
                            <form onSubmit={onUpdate}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold">Nama Lengkap</label>
                                        <input type="text" className="form-control" value={data.nama || data.name || ''} 
                                            onChange={(e) => setData({...data, nama: e.target.value, name: e.target.value})} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold">NIK</label>
                                        <input type="text" className="form-control" value={data.nik || ''} 
                                            onChange={(e) => setData({...data, nik: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold">Pekerjaan</label>
                                        <input type="text" className="form-control" value={data.pekerjaan || ''} 
                                            onChange={(e) => setData({...data, pekerjaan: e.target.value})} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold">No. Telp</label>
                                        <input type="text" className="form-control" value={data.no_telp || ''} 
                                            onChange={(e) => setData({...data, no_telp: e.target.value})} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold">Gaji (Rp)</label>
                                        <input type="number" className="form-control" value={data.gaji || ''} 
                                            onChange={(e) => setData({...data, gaji: e.target.value})} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold">Tanggungan</label>
                                        <input type="number" className="form-control" value={data.tanggungan || ''} 
                                            onChange={(e) => setData({...data, tanggungan: e.target.value})} />
                                    </div>
                                </div>

                                <div className="p-3 bg-light rounded border mb-3">
                                    <label className="form-label small fw-bold text-primary mb-2">Detail Alamat</label>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <label className="x-small text-muted mb-1">Dukuh</label>
                                            <select className="form-select form-select-sm" value={data.dukuh || ''}
                                                onChange={(e) => handleAlamatChange('dukuh', e.target.value)}>
                                                <option value="">Pilih Dukuh</option>
                                                {listDukuh.map((d, i) => <option key={i} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="x-small text-muted mb-1">RT</label>
                                            <input type="text" className="form-control form-control-sm" placeholder="00"
                                                value={data.rt || ''} onChange={(e) => handleAlamatChange('rt', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="x-small text-muted mb-1">RW</label>
                                            <input type="text" className="form-control form-control-sm" placeholder="00"
                                                value={data.rw || ''} onChange={(e) => handleAlamatChange('rw', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 mt-4">
                                    <button type="submit" className="btn btn-success w-100 fw-bold">Simpan Perubahan</button>
                                    <button type="button" className="btn btn-light w-100" onClick={() => setIsEditing(false)}>Batal</button>
                                </div>
                            </form>
                        ) : (
                            /* MODE LIHAT (READ-ONLY atau DEFAULT) */
                            <div className="text-center">
                                <div className="avatar mb-3 mx-auto bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width:'80px', height:'80px'}}>
                                    <i className="bi bi-person-circle fs-1 text-primary"></i>
                                </div>
                                <h4 className="fw-bold mb-1">{data.nama || data.name}</h4>
                                <p className="text-muted mb-3">NIK: {data.nik || "-"}</p>
                                
                                <div className="card border-0 bg-light p-3 mb-4 text-start">
                                    <div className="row g-2 small">
                                        <div className="col-5 text-muted">Pekerjaan:</div>
                                        <div className="col-7 fw-bold text-end">{data.pekerjaan || "-"}</div>
                                        
                                        <div className="col-5 text-muted">Gaji:</div>
                                        <div className="col-7 fw-bold text-end text-success">
                                            Rp {Number(data.gaji || 0).toLocaleString('id-ID')}
                                        </div>
                                        
                                        <div className="col-5 text-muted">Tanggungan:</div>
                                        <div className="col-7 fw-bold text-end">{data.tanggungan || "0"} Orang</div>

                                        <div className="col-5 text-muted">No. Telp:</div>
                                        <div className="col-7 fw-bold text-end">{data.no_telp || "-"}</div>
                                        
                                        <div className="col-12 mt-2"><hr className="my-1"/></div>
                                        
                                        <div className="col-5 text-muted">Alamat:</div>
                                        <div className="col-7 fw-bold text-end text-primary">
                                            {data.dukuh ? `Dukuh ${data.dukuh}, RT ${data.rt || '0'}/RW ${data.rw || '0'}` : (data.alamat || "-")}
                                        </div>
                                    </div>
                                </div>

                                {/* Navigasi Tombol Berdasarkan Role */}
                                {!readOnly ? (
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-warning w-100 fw-bold" onClick={() => setIsEditing(true)}>Edit Data</button>
                                        <button className="btn btn-outline-danger w-100 fw-bold" onClick={() => onHapus(data.id)}>Hapus</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-secondary w-100 fw-bold" onClick={onClose}>Tutup</button>
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