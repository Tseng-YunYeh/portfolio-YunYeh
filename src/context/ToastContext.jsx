import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = Date.now() + Math.random()
    const t = { id, message, type }
    setToasts((s) => [...s, t])
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-root" aria-live="polite" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} style={{ background: '#111', color: '#fff', padding: '8px 12px', borderRadius: 6, marginTop: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.2)' }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
