import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // (Jika ada style bawaan)
import 'bootstrap/dist/css/bootstrap.min.css' // Import Bootstrap di sini
import axios from 'axios' // <--- 1. JANGAN LUPA IMPORT AXIOS

// --- 2. TAMBAHKAN BLOK KODE INI ---
// Cek apakah ada token tersimpan di memori browser?
const token = localStorage.getItem('token');
if (token) {
    // Jika ada, tempelkan token ke setiap request yang dikirim axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
// ----------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)