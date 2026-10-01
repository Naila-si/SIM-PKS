import React from 'react';

const persetujuanStyles = {
  'Draft': 'bg-slate-100 text-slate-700 border-slate-300',
  'Menunggu Penyerahan': 'bg-amber-50 text-amber-700 border-amber-300',
  'Pemeriksaan Pengelola': 'bg-blue-50 text-blue-700 border-blue-300',
  'Disetujui Pengelola': 'bg-indigo-50 text-indigo-700 border-indigo-300',
  'Revisi Pengelola': 'bg-rose-50 text-rose-700 border-rose-300',
  'Pemeriksaan Kabag': 'bg-cyan-50 text-cyan-700 border-cyan-300',
  'Disetujui Kabag': 'bg-teal-50 text-teal-700 border-teal-300',
  'Revisi Kabag': 'bg-orange-50 text-orange-700 border-orange-300',
  'Pemeriksaan Pimpinan': 'bg-purple-50 text-purple-700 border-purple-300',
  'Disetujui Pimpinan': 'bg-violet-50 text-violet-700 border-violet-300',
  'Revisi Pimpinan': 'bg-pink-50 text-pink-700 border-pink-300',
  'Disetujui': 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs',
};

const pksStyles = {
  'Aktif': 'bg-emerald-100 text-emerald-800 border-emerald-400 font-semibold',
  'Segera Berakhir': 'bg-amber-100 text-amber-800 border-amber-400 font-semibold animate-pulse',
  'Berakhir': 'bg-rose-100 text-rose-800 border-rose-400 font-semibold',
};

export const StatusBadge = ({ status, type = 'persetujuan' }) => {
  if (!status) return null;

  const stylesMap = type === 'pks' ? pksStyles : persetujuanStyles;
  const style = stylesMap[status] || 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style} transition-all`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {status}
    </span>
  );
};
