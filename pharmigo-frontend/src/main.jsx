import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// ─── MODE SWITCH ──────────────────────────────────────────────
// Change the import below to switch between modes:
//   AppStatic  → No backend needed. Uses in-memory mock data.
//   AppDynamic → Requires Django backend running at localhost:8000.
// ─────────────────────────────────────────────────────────────
import App from './AppStatic.jsx'  // ← swap to AppStatic for offline mode

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
