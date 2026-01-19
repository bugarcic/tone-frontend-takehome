export function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
      <span className="text-red-400">⚠️</span>
      <p className="flex-1 text-red-300 text-sm">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 transition-colors text-sm"
        >
          ✕
        </button>
      )}
    </div>
  );
}
