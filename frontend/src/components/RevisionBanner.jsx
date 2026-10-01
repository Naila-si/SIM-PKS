import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RevisionBanner = ({ statusPersetujuan, catatanRevisi, pksId }) => {
  if (!statusPersetujuan || !statusPersetujuan.startsWith('Revisi')) {
    return null;
  }

  return (
    <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 mb-6 shadow-xs relative overflow-hidden">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
              PKS Dikembalikan Untuk Direvisi ({statusPersetujuan})
            </h3>
            {pksId && (
              <Link
                to={`/pks/${pksId}/edit`}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                <span>Edit Data PKS Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
          </div>
          <p className="text-xs font-semibold text-rose-800 mt-1">
            Catatan Revisi dari Penilai:
          </p>
          <div className="mt-2 p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-900 font-mono whitespace-pre-wrap">
            "{catatanRevisi || 'Tidak ada catatan revisi spesifik.'}"
          </div>
          <p className="text-[11px] text-rose-700 mt-2 font-medium">
            💡 <b>Alur Revisi:</b> Silakan edit data PKS sesuai catatan di atas, unduh dokumen draft (.docx) baru, lalu serahkan dokumen fisik kembali. Pemeriksaan akan dimulai ulang dari Pengelola PKS.
          </p>
        </div>
      </div>
    </div>
  );
};
