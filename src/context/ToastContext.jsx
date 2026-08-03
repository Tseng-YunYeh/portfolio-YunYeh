import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timeoutRef = useRef(null)

  const showToast = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = Date.now() + Math.random()
    const t = { id, message, type }
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToasts([t])
    timeoutRef.current = setTimeout(() => {
      setToasts([])
      timeoutRef.current = null
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-root" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
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
