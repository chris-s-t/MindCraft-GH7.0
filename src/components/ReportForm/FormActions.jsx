export default function FormActions({ onClose, isSubmitting }) {
  return (
    <div className="flex gap-2.5 pt-1">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-600 rounded py-2 cursor-pointer font-semibold transition"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 neon-glow-btn text-white rounded py-2 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
      </button>
    </div>
  );
}
