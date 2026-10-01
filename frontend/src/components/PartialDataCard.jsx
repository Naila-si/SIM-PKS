import React from 'react';
import { Lock, AlertCircle, Building2, Calendar, User } from 'lucide-react';

export const PartialDataCard = ({ pks }) => {
  return (
    <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
            Tampilan Data Parsial (Status: Menunggu Penyerahan Dokumen Fisik)
          </h3>
          <p className="text-xs text-amber-800 mt-0.5">
            Dokumen draft telah diunduh oleh Petugas JR. Detail ruang lingkup lengkap masih dikunci hingga Petugas JR menyerahkan dokumen fisik secara langsung.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-amber-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="font-semibold text-slate-400 block text-[11px] uppercase">Perusahaan Mitra</span>
          <span className="font-bold text-slate-900 flex items-center mt-1">
            <Building2 className="w-4 h-4 mr-1 text-[#00529C]" />
            {pks.mitra?.namaPerusahaan || '-'}
          </span>
          <span className="text-slate-500 block text-[11px] mt-0.5">PJ: {pks.mitra?.penanggungJawab || '-'} ({pks.mitra?.kontak || '-'})</span>
        </div>

        <div>
          <span className="font-semibold text-slate-400 block text-[11px] uppercase">Rencana Masa Berlaku</span>
          <span className="font-bold text-slate-900 flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-1 text-slate-500" />
            {pks.tanggalMulai ? new Date(pks.tanggalMulai).toLocaleDateString('id-ID') : '-'} s/d {pks.tanggalBerakhir ? new Date(pks.tanggalBerakhir).toLocaleDateString('id-ID') : '-'}
          </span>
        </div>
      </div>

      <div className="bg-amber-100/60 p-3 rounded-xl border border-amber-200/80 text-amber-900 text-xs flex items-center">
        <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-amber-700" />
        <span>
          <b>Pemberitahuan Pengelola:</b> Mohon tunggu Petugas JR ({pks.pembuat?.nama || 'Petugas'}) mengantarkan berkas dokumen fisik PKS ke meja kerja Anda, lalu klik konfirmasi penyerahan fisik untuk membuka rincian lengkap.
        </span>
      </div>
    </div>
  );
};
