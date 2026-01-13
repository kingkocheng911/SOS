import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. IMPORT BROWSER ROUTER (Wajib agar navigasi jalan)
import { BrowserRouter } from 'react-router-dom' 

import './index.css' 
import 'bootstrap/dist/css/bootstrap.min.css' 
import axios from 'axios' 

// --- SETUP AXIOS (Memasang Token Otomatis) ---
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
// ---------------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. BUNGKUS APP DENGAN BROWSER ROUTER */}
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </React.StrictMode>,
)