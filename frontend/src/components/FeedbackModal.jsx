export default function FeedbackModal({ open, type = "success", title, message, buttonText = "Done", onClose }) {
  if (!open) return null;
  const success = type === "success";
  return (
    <div className="confirm-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div className="confirm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className={`confirm-modal-icon ${success ? "success" : "danger"}`}>{success ? "✓" : "!"}</div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className={`confirm-submit ${success ? "" : "danger"}`} onClick={onClose}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
}
