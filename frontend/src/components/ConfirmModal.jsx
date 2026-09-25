export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" role="presentation" onMouseDown={onCancel}>
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onMouseDown={(e) => e.stopPropagation()}>
        <div className={`confirm-modal-icon ${danger ? "danger" : ""}`}>?</div>
        <h2 id="confirm-modal-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="confirm-cancel" onClick={onCancel}>{cancelText}</button>
          <button type="button" className={`confirm-submit ${danger ? "danger" : ""}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
