import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ClassProvider } from './context/ClassContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ClassProvider>
        <App />
      </ClassProvider>
    </AuthProvider>
  </StrictMode>,
)
