import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './application/context/AuthContext'
import { ThemeProvider } from './application/context/ThemeContext'
import { BrowserRouter } from 'react-router-dom'
import { CustomToaster } from './presentation/shared/CustomToast.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CustomToaster />
          <App />
        </AuthProvider>
      </ThemeProvider >
    </BrowserRouter>
  </React.StrictMode >,
)