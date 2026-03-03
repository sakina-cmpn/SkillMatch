import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/routes'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from './app/components/ui/sonner'
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton duration={4000} />
    </AuthProvider>
  </React.StrictMode>
)
