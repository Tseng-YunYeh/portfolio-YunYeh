import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return

    const previousScrollBehavior = document.documentElement.style.scrollBehavior
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.documentElement.style.scrollBehavior = 'auto'
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [open])

  if (!open) return null

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="confirm-dialog-header">
          <h2 id="confirm-dialog-title">{title}</h2>
          <button type="button" className="confirm-dialog-close" onClick={onCancel} aria-label="Close confirmation dialog">
            ✕
          </button>
        </div>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn btn-outline confirm-dialog-button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary confirm-dialog-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}