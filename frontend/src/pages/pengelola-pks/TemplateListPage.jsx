import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  RotateCcw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Copy,
  Check,
  Eye,
  Edit,
  Power
} from 'lucide-react';
import { templateService } from '../../services/templateService';
import { ModalUploadTemplate } from './ModalUploadTemplate';
import { ModalDetailTemplate } from './ModalDetailTemplate';
import { ModalPerbaruiTemplate } from './ModalPerbaruiTemplate';
import { ModalNonaktifkanTemplate } from './ModalNonaktifkanTemplate';

const SAMPLE_TEMPLATES = [
  {
    templateId: 1,
    namaTemplate: 'Template PKS Penjaminan RS',
    formatSize: 'Format: DOCX • 2.4 MB',
    bidang: 'PELAYANAN',
    jenisPks: 'Kerjasama Penjaminan Biaya',
    versi: 'v2.4',
    terakhirDiperbarui: '15 Okt 2023',
    oleh: 'Budi Santoso',
    status: 'Aktif',
  },
  {
    templateId: 2,
    namaTemplate: 'Template MoU Kerjasama Instansi',
    formatSize: 'Format: DOCX • 1.8 MB',
    bidang: 'IW',
    jenisPks: 'MoU Pertukaran Data Kenc',
    versi: 'v1.1',
    terakhirDiperbarui: '02 Okt 2023',
    oleh: 'Siti Aminah',
    status: 'Aktif',
  },
  {
    templateId: 3,
    namaTemplate: 'Draft Template SWDKLLJ Lama',
    formatSize: 'Format: DOCX • 3.1 MB',
    bidang: 'SW',
    jenisPks: 'Kerjasama Sumbangan Wa',
    versi: 'v4.0',
    terakhirDiperbarui: '20 Sep 2023',
    oleh: 'Budi Santoso',
    status: 'Nonaktif',
  },
  {
    templateId: 4,
    namaTemplate: 'PKS Layanan Ambulance V3',
    formatSize: 'Format: DOCX • 1.2 MB',
    bidang: 'PELAYANAN',
    jenisPks: 'Kerjasama Layanan Evakua',
    versi: 'v3.0',
    terakhirDiperbarui: '12 Sep 2023',
    oleh: 'Admin Pusat',
    status: 'Aktif',
  },
];

const PLACEHOLDERS = [
  '{{nomor_pks}}',
  '{{nama_perusahaan}}',
  '{{alamat}}',
  '{{nama_penanggung_jawab}}',
  '{{jabatan}}',
  '{{nomor_telepon}}',
  '{{email}}',
  '{{tanggal_mulai}}',
  '{{tanggal_berakhir}}',
];

export const TemplateListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [bidangFilter, setBidangFilter] = useState('Semua');
  const [jenisPksFilter, setJenisPksFilter] = useState('Semua');

  // Interactive Copy State
  const [copiedTag, setCopiedTag] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPerbaruiModalOpen, setIsPerbaruiModalOpen] = useState(false);
  const [isNonaktifkanModalOpen, setIsNonaktifkanModalOpen] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await templateService.getTemplates();
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        setTemplates(res.data);
      } else {
        setTemplates(SAMPLE_TEMPLATES);
      }
    } catch (err) {
      setTemplates(SAMPLE_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCopy = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleResetFilter = () => {
    setSortOrder('Terbaru');
    setBidangFilter('Semua');
    setJenisPksFilter('Semua');
  };

  const handleOpenDetail = (template) => {
    setSelectedTemplate(template);
    setIsDetailModalOpen(true);
  };

  const handleOpenPerbarui = (template) => {
    setSelectedTemplate(template);
    setIsPerbaruiModalOpen(true);
  };

  const handleOpenNonaktifkan = (template) => {
    setSelectedTemplate(template);
    setIsNonaktifkanModalOpen(true);
  };

  const handleNonaktifkanSuccess = () => {
    if (selectedTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.templateId === selectedTemplate.templateId ? { ...t, status: 'Nonaktif' } : t
        )
      );
    }
  };

  const filteredTemplates = templates.filter((t) => {
    if (bidangFilter !== 'Semua' && t.bidang !== bidangFilter) return false;
    if (jenisPksFilter !== 'Semua' && !t.jenisPks?.includes(jenisPksFilter)) return false;
    return true;
  });

  // Calculate Stats
  const totalCount = templates.length || 12;
  const activeCount = templates.filter((t) => t.status === 'Aktif').length || 10;
  const inactiveCount = templates.filter((t) => t.status === 'Nonaktif').length || 2;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Template PKS</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola template dokumen PKS yang digunakan sistem untuk menghasilkan draft dokumen secara otomatis.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Template
        </button>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Template */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Total Template</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
            <p className="text-[10px] text-blue-600 font-bold mt-0.5">+2 bulan ini</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Template Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Template Aktif</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{activeCount}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Seluruh bidang operasional</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Template Nonaktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Template Nonaktif</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{inactiveCount}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Diarsipkan karena kadaluarsa</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Terakhir Diperbarui */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Terakhir Diperbarui</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">15 Okt 2023</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Oleh: Admin Pusat</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Placeholder Info Box */}
      <div className="bg-blue-50/40 rounded-2xl p-5 border-2 border-dashed border-blue-200 space-y-3">
        <div className="flex items-center space-x-2 text-blue-800 font-bold text-xs">
          <Code2 className="w-4 h-4 text-blue-600" />
          <span>Placeholder yang dapat digunakan pada template Word</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {PLACEHOLDERS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleCopy(tag)}
              title="Klik untuk menyalin tag"
              className="px-3 py-1.5 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 rounded-xl text-xs font-mono font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer group"
            >
              <span>{tag}</span>
              {copiedTag === tag ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-blue-400 group-hover:text-blue-600 opacity-60 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Urutkan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Urutkan:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terlama">Terlama</option>
            </select>
          </div>

          {/* Bidang */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bidang:</label>
            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua">Semua</option>
              <option value="PELAYANAN">Pelayanan</option>
              <option value="IW">IW</option>
              <option value="SW">SW</option>
            </select>
          </div>

          {/* Jenis PKS */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Jenis PKS:</label>
            <select
              value={jenisPksFilter}
              onChange={(e) => setJenisPksFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua">Semua Jenis PKS</option>
              <option value="Penjaminan">Kerjasama Penjaminan Biaya</option>
              <option value="MoU">MoU Pertukaran Data</option>
              <option value="Sumbangan">Kerjasama Sumbangan Wajib</option>
            </select>
          </div>

          {/* Reset Filter */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all cursor-pointer h-[38px]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* 5. Templates Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat template dokumen...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <FileCode className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak Ada Template Dokumen</p>
            <p className="text-xs text-slate-400">Silakan ubah filter atau upload template baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/50 border-b border-slate-100 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Template</th>
                  <th className="px-4 py-4">Bidang</th>
                  <th className="px-4 py-4">Jenis PKS</th>
                  <th className="px-4 py-4">Versi</th>
                  <th className="px-4 py-4">Terakhir Diperbarui</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTemplates.map((item) => (
                  <tr key={item.templateId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nama Template + DOCX Icon + Size */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00529C] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{item.namaTemplate}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.formatSize || 'Format: DOCX • 2.4 MB'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Bidang Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                        item.bidang === 'IW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.bidang === 'SW'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {item.bidang || 'PELAYANAN'}
                      </span>
                    </td>

                    {/* Jenis PKS */}
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {item.jenisPks}
                    </td>

                    {/* Versi */}
                    <td className="px-4 py-4 font-semibold text-slate-600">
                      {item.versi || 'v1.0'}
                    </td>

                    {/* Terakhir Diperbarui */}
                    <td className="px-4 py-4 text-[11px]">
                      <p className="font-bold text-slate-800">{item.terakhirDiperbarui || '15 Okt 2023'}</p>
                      <p className="text-slate-400 font-normal text-[10px]">oleh: {item.oleh || 'Admin'}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Aksi Menu */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveActionId(activeActionId === item.templateId ? null : item.templateId)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeActionId === item.templateId && (
                          <div
                            className="origin-top-right absolute right-0 top-8 w-44 rounded-xl shadow-lg bg-white border border-slate-200 ring-1 ring-black/5 z-30 py-1 text-left"
                            onMouseLeave={() => setActiveActionId(null)}
                          >
                            <button
                              onClick={() => {
                                setActiveActionId(null);
                                handleOpenDetail(item);
                              }}
                              className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2 text-blue-600" />
                              Detail Template
                            </button>
                            <button
                              onClick={() => {
                                setActiveActionId(null);
                                handleOpenPerbarui(item);
                              }}
                              className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 mr-2 text-indigo-600" />
                              Perbarui Template
                            </button>
                            <button
                              onClick={() => {
                                setActiveActionId(null);
                                handleOpenNonaktifkan(item);
                              }}
                              className="flex items-center w-full px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 font-medium cursor-pointer border-t border-slate-100"
                            >
                              <Power className="w-3.5 h-3.5 mr-2 text-amber-600" />
                              Nonaktifkan
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            Menampilkan <span className="font-bold text-slate-800">1 - {filteredTemplates.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{totalCount}</span> template
          </p>

          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold bg-[#00529C] text-white">1</button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">2</button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">3</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Render All 4 Modals */}
      <ModalUploadTemplate
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchTemplates}
      />

      <ModalDetailTemplate
        isOpen={isDetailModalOpen}
        templateData={selectedTemplate}
        onClose={() => setIsDetailModalOpen(false)}
        onPerbaruiClick={(data) => {
          setSelectedTemplate(data);
          setIsPerbaruiModalOpen(true);
        }}
      />

      <ModalPerbaruiTemplate
        isOpen={isPerbaruiModalOpen}
        templateData={selectedTemplate}
        onClose={() => setIsPerbaruiModalOpen(false)}
        onSuccess={fetchTemplates}
      />

      <ModalNonaktifkanTemplate
        isOpen={isNonaktifkanModalOpen}
        templateData={selectedTemplate}
        onClose={() => setIsNonaktifkanModalOpen(false)}
        onSuccess={handleNonaktifkanSuccess}
      />
    </div>
  );
};

export default TemplateListPage;

