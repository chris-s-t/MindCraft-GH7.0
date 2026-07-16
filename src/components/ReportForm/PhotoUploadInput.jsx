import { Camera, X } from 'lucide-react';

export default function PhotoUploadInput({ photo, setPhoto, onPhotoChange }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-slate-500 font-sans mb-1">Lampiran Foto</label>
      {photo ? (
        <div className="relative rounded overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center group">
          <img src={photo} alt="Upload preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => setPhoto('')}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label className="border border-dashed border-slate-300 hover:border-[var(--accent-color)] rounded bg-slate-50 h-20 flex flex-col items-center justify-center cursor-pointer transition text-slate-500 hover:text-slate-700">
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-xs">Klik untuk unggah foto bahaya</span>
          <input
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
