import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalDetailAktivitas } from './ModalDetailAktivitas';
import {
  X, CheckCircle2, PlusCircle, Settings, FileText, ThumbsUp, ShieldCheck, Clock, Download
} from 'lucide-react';

export const ModalRiwayatPks = ({ isOpen, pksData, onClose }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);

  if (!isOpen) return null;

  const data = pksData || {};

  const timelineEvents = data.riwayat_aktivitas || [];

  const handleExport = () => {
    alert(`Mengekspor riwayat lengkap PKS ${data.nomorPKS}...`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal (Matching Image 2) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-extrabold text-[#001D38] tracking-tight">Riwayat PKS</h2>
            <p className="text-xs text-slate-500 mt-0.5">Seluruh aktivitas yang pernah terjadi pada PKS ini.</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold bg-[#EBF3FF] text-[#00529C] border border-blue-200 inline-flex items-center">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00529C] text-white flex items-center justify-center font-bold text-[9px] mr-1.5">✓</span>
              Status Persetujuan: {data.statusPersetujuan || 'Disetujui'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Card 1: Informasi PKS (Matching Image 2 Box) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">i</span>
              <h3 className="text-xs font-extrabold text-slate-800">Informasi PKS</h3>
            </div>

            <div className="grid grid-cols-3 gap-y-3.5 gap-x-6 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOMOR PKS</p>
                <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.nomor_pks || data.nomorPKS || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BIDANG</p>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">{data.bidang || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JENIS PKS</p>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">{data.jenis_pks || data.jenisPKS || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PERUSAHAAN / INSTANSI</p>
                <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.mitra?.nama_mitra || data.perusahaan || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TANGGAL MULAI</p>
                <p className="font-medium text-slate-800 text-xs mt-0.5">{data.tanggal_mulai || data.tanggalMulai || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TANGGAL BERAKHIR</p>
                <p className="font-medium text-slate-800 text-xs mt-0.5">{data.tanggal_berakhir || data.tanggalBerakhir || '-'}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Timeline Aktivitas (Matching Image 2) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Clock className="w-4 h-4 text-[#00529C]" />
              <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">Timeline Aktivitas</h3>
            </div>

            <div className="relative pl-6 space-y-3.5 before:absolute before:left-3.5 before:top-3.5 before:bottom-3.5 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((ev) => {
                const IconComp = ev.icon;
                return (
                  <div key={ev.id} className="relative group">
                    {/* Circle Node Icon */}
                    <span className={`absolute -left-[35px] top-3.5 w-6 h-6 rounded-full flex items-center justify-center shadow-xs shrink-0 z-10 ${ev.color}`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </span>

                    {/* Event Content Card Box */}
                    <div
                      onClick={() => setSelectedActivity({ ...ev, nomorPKS: data.nomorPKS })}
                      className="bg-white hover:bg-slate-50/70 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:border-blue-300"
                    >
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-900 text-xs">{ev.title}</p>
                        {ev.actorRole && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
                            <span>👤 {ev.actorRole}</span>
                            {ev.actorUser && <span className="text-slate-400">• User: {ev.actorUser}</span>}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-500 font-medium">{ev.tanggal}</p>
                        {ev.waktu && <p className="text-[10px] text-slate-400">{ev.waktu}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions (Matching Image 2) */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2.5 bg-[#0F2238] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl shadow-md flex items-center transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Ekspor Riwayat
          </button>
        </div>

      </div>

      {/* Sub-modal Detail Aktivitas */}
      {selectedActivity && (
        <ModalDetailAktivitas
          isOpen={!!selectedActivity}
          activityData={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>,
    document.body
  );
};

export default ModalRiwayatPks;
