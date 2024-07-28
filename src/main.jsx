import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './Contexts/AuthContext.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
// import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';

// import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js';

// GlobalWorkerOptions.workerSrc = pdfWorker;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)