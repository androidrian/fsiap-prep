import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { ProgressProvider } from './storage/ProgressContext'
import './styles.css'
import './styles/study.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
