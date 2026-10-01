import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400 font-sans">
      <p>© {new Date().getFullYear()} PT Jasa Raharja Kanwil Riau. Sistem Informasi Manajemen Perjanjian Kerja Sama (SIM PKS).</p>
    </footer>
  );
};
