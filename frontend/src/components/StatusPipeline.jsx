import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const stages = [
  { key: 'Draft', label: '1. Draft' },
  { key: 'Menunggu Penyerahan', label: '2. Serah Fisik' },
  { key: 'Pemeriksaan Pengelola', label: '3. Pengelola' },
  { key: 'Pemeriksaan Kabag', label: '4. Kabag' },
  { key: 'Pemeriksaan Pimpinan', label: '5. Pimpinan' },
  { key: 'Disetujui', label: '6. Disetujui (Final)' },
];

export const StatusPipeline = ({ statusPersetujuan }) => {
  const isRevision = statusPersetujuan && statusPersetujuan.startsWith('Revisi');

  const getStageIndex = (status) => {
    switch (status) {
      case 'Draft': return 0;
      case 'Menunggu Penyerahan': return 1;
      case 'Pemeriksaan Pengelola':
      case 'Disetujui Pengelola': return 2;
      case 'Revisi Pengelola': return 2;
      case 'Pemeriksaan Kabag':
      case 'Disetujui Kabag': return 3;
      case 'Revisi Kabag': return 3;
      case 'Pemeriksaan Pimpinan':
      case 'Disetujui Pimpinan': return 4;
      case 'Revisi Pimpinan': return 4;
      case 'Disetujui': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(statusPersetujuan);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Tahapan Persetujuan Dokumen (12-Stage Workflow)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {stages.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let bgStyle = 'bg-slate-50 border-slate-200 text-slate-400';
          let icon = <Clock className="w-3.5 h-3.5 mr-1" />;

          if (isDone) {
            bgStyle = 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold';
            icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
          } else if (isCurrent) {
            if (isRevision) {
              bgStyle = 'bg-rose-50 border-rose-300 text-rose-700 font-bold ring-2 ring-rose-300';
              icon = <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />;
            } else if (statusPersetujuan === 'Disetujui') {
              bgStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
              icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />;
            } else {
              bgStyle = 'bg-[#00529C]/10 border-[#00529C] text-[#00529C] font-bold ring-2 ring-[#00529C]/20';
              icon = <Clock className="w-3.5 h-3.5 mr-1 text-[#00529C] animate-spin" />;
            }
          }

          return (
            <div
              key={stage.key}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${bgStyle}`}
            >
              <div className="flex items-center truncate">
                {icon}
                <span className="truncate">{stage.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
