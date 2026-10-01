import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// PRD 1 Pages (Petugas)
import { ManajemenPksPage } from '../petugas/ManajemenPksPage';
import { PersetujuanPksPage } from '../petugas/PersetujuanPksPage';
import { PksCreatePage } from '../petugas/PksCreatePage';
import { PksDetailPage } from '../petugas/PksDetailPage';
import { PksEditPage } from '../petugas/PksEditPage';
import { PksRiwayatPage } from '../petugas/PksRiwayatPage';
import { AdendumListPage } from '../petugas/AdendumListPage';
import { AdendumCreatePage } from '../petugas/AdendumCreatePage';

// Shared / Partner Pages
import { ManajemenPerusahaanPage } from '../petugas/ManajemenPerusahaanPage';
import { MitraListPage } from '../pages/mitra/MitraListPage';
import { MitraCreatePage } from '../pages/mitra/MitraCreatePage';
import { MitraEditPage } from '../pages/mitra/MitraEditPage';
import { NotificationPage } from '../pages/notifications/NotificationPage';

// PRD 2 Pages
import { TemplateListPage } from '../pages/pengelola-pks/TemplateListPage';
import { TemplateFormPage } from '../pages/pengelola-pks/TemplateFormPage';

// PRD 5 Pages
import UserListPage from '../pages/admin/UserListPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* PKS & Approval Routes */}
          <Route path="/pks" element={<ManajemenPksPage />} />
          <Route path="/approval" element={<PersetujuanPksPage />} />
          <Route path="/approvals" element={<PersetujuanPksPage />} />
          <Route path="/persetujuan" element={<PersetujuanPksPage />} />
          <Route path="/pks/buat" element={<PksCreatePage />} />
          <Route path="/pks/:id" element={<PksDetailPage />} />
          <Route path="/pks/:id/edit" element={<PksEditPage />} />
          <Route path="/riwayat" element={<PksRiwayatPage />} />
          <Route path="/pks/:id/riwayat" element={<PksRiwayatPage />} />
          <Route path="/pks/:id/adendum" element={<AdendumListPage />} />
          <Route path="/pks/:id/adendum/new" element={<AdendumCreatePage />} />

          {/* User Management (PRD 5 - Admin Utama) */}
          <Route path="/pengguna" element={<UserListPage />} />
          <Route path="/admin/users" element={<UserListPage />} />

          {/* Mitra / Perusahaan Routes */}
          <Route path="/mitra" element={<ManajemenPerusahaanPage />} />
          <Route path="/perusahaan" element={<ManajemenPerusahaanPage />} />
          <Route path="/mitra/new" element={<MitraCreatePage />} />
          <Route path="/mitra/:id/edit" element={<MitraEditPage />} />

          {/* Template Routes */}
          <Route path="/template" element={<TemplateListPage />} />
          <Route path="/templates" element={<TemplateListPage />} />
          <Route path="/templates/new" element={<TemplateFormPage />} />

          {/* Notification Center */}
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/notifikasi" element={<NotificationPage />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
