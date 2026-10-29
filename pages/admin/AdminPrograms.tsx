import React, { useEffect, useState } from 'react';
import {
  getAdminPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  uploadMedia,
  uploadAdminFiles,
  getAdminForms,
  getAdminMembers,
} from '../../services/adminApi';
import type { Program, PorslineForm, Member, ProgramCollaborator } from '../../types';
import FilePickerModal from '../../components/admin/FilePickerModal';

interface ProgramFormData {
  title: string;
  date: string;
  dateISO: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  price: number;
  durationHours: number;
  status: 'upcoming' | 'past';
  registrationLink: string;
  galleryImages: string; // comma or newline separated
}

const initialFormData: ProgramFormData = {
  title: '',
  date: '',
  dateISO: new Date().toISOString().split('T')[0],
  shortDescription: '',
  fullDescription: '',
  imageUrl: '',
  price: 0,
  durationHours: 2,
  status: 'upcoming',
  registrationLink: '',
  galleryImages: '',
};

const AdminPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState<ProgramFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Secondary Images State
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
  const [newSecondaryUrl, setNewSecondaryUrl] = useState('');
  const [showRawUrlArea, setShowRawUrlArea] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [filePickerTarget, setFilePickerTarget] = useState<'main' | 'secondary'>('secondary');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Available Porsline forms for registration link
  const [availableForms, setAvailableForms] = useState<PorslineForm[]>([]);

  // Association Members for Collaborators
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [programCollaborators, setProgramCollaborators] = useState<ProgramCollaborator[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [collabRole, setCollabRole] = useState<string>('دبیر رویداد');
  const [customCollabName, setCustomCollabName] = useState<string>('');
  const [isCustomCollab, setIsCustomCollab] = useState<boolean>(false);

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await getAdminPrograms();
      setPrograms(data);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در بارگذاری برنامه‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
    const loadFormsAndMembers = async () => {
      try {
        const [forms, members] = await Promise.all([
          getAdminForms().catch(() => []),
          getAdminMembers().catch(() => []),
        ]);
        setAvailableForms(forms);
        setMembersList(members);
      } catch (e) {
        // ignore
      }
    };
    loadFormsAndMembers();
  }, []);

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData(initialFormData);
    setSecondaryImages([]);
    setNewSecondaryUrl('');
    setShowRawUrlArea(false);
    setProgramCollaborators([]);
    setSelectedMemberId('');
    setCollabRole('دبیر رویداد');
    setCustomCollabName('');
    setIsCustomCollab(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (prog: Program) => {
    setEditingProgram(prog);
    const existingImages = prog.gallery?.images || [];
    setSecondaryImages(existingImages);
    setNewSecondaryUrl('');
    setShowRawUrlArea(false);

    // Initialize collaborators
    if (prog.collaboratorDetails && prog.collaboratorDetails.length > 0) {
      setProgramCollaborators(prog.collaboratorDetails);
    } else if (prog.collaborators && prog.collaborators.length > 0) {
      const mapped = prog.collaborators.map((id) => {
        const found = membersList.find((m) => m.id === id);
        return {
          memberId: id,
          name: found?.name || 'همکار رویداد',
          role: found?.memberships?.[0]?.position || 'همکار رویداد',
          imageUrl: found?.imageUrl,
        };
      });
      setProgramCollaborators(mapped);
    } else {
      setProgramCollaborators([]);
    }

    setSelectedMemberId('');
    setCollabRole('دبیر رویداد');
    setCustomCollabName('');
    setIsCustomCollab(false);

    setFormData({
      title: prog.title || '',
      date: prog.date || '',
      dateISO: prog.dateISO || '',
      shortDescription: prog.shortDescription || '',
      fullDescription: prog.fullDescription || '',
      imageUrl: prog.imageUrl || '',
      price: prog.price || 0,
      durationHours: prog.durationHours || 0,
      status: prog.status || 'upcoming',
      registrationLink: prog.registrationLink || '',
      galleryImages: existingImages.join('\n'),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleAddCollaborator = () => {
    if (isCustomCollab) {
      if (!customCollabName.trim()) {
        alert('لطفاً نام فرد مهمان یا همکار را وارد کنید');
        return;
      }
      setProgramCollaborators([
        ...programCollaborators,
        {
          memberId: 0,
          name: customCollabName.trim(),
          role: collabRole.trim() || 'کادر رویداد',
        },
      ]);
      setCustomCollabName('');
    } else {
      if (!selectedMemberId) {
        alert('لطفاً یک عضو از لیست اعضای انجمن انتخاب کنید');
        return;
      }
      const member = membersList.find((m) => m.id === Number(selectedMemberId));
      if (!member) return;

      const alreadyExists = programCollaborators.some((c) => c.memberId === member.id);
      if (alreadyExists) {
        alert('این فرد قبلاً به تیم این رویداد اضافه شده است.');
        return;
      }

      setProgramCollaborators([
        ...programCollaborators,
        {
          memberId: member.id,
          name: member.name,
          role: collabRole.trim() || 'همکار رویداد',
          imageUrl: member.imageUrl,
        },
      ]);
      setSelectedMemberId('');
    }
  };

  const handleRemoveCollaborator = (index: number) => {
    setProgramCollaborators(programCollaborators.filter((_, i) => i !== index));
  };

  const handleUpdateCollaboratorRole = (index: number, newRole: string) => {
    const updated = [...programCollaborators];
    updated[index].role = newRole;
    setProgramCollaborators(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const result = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      showToast('تصویر شاخص با موفقیت آپلود شد');
    } catch (err: any) {
      alert(err?.message || 'خطا در آپلود تصویر');
    } finally {
      setUploadingImage(false);
    }
  };

  // Secondary Images Handlers
  const handleAddSecondaryUrl = () => {
    const url = newSecondaryUrl.trim();
    if (!url) return;
    const updated = [...secondaryImages, url];
    setSecondaryImages(updated);
    setFormData((prev) => ({ ...prev, galleryImages: updated.join('\n') }));
    setNewSecondaryUrl('');
    showToast('عکس ثانویه با لینک اضافه شد');
  };

  const handleSecondaryFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    try {
      setUploadingSecondary(true);
      const fileArray = Array.from(fileList) as File[];
      const res = await uploadAdminFiles(fileArray);
      const newUrls = res.files.map((f) => f.url);
      const updated = [...secondaryImages, ...newUrls];
      setSecondaryImages(updated);
      setFormData((prev) => ({ ...prev, galleryImages: updated.join('\n') }));
      showToast(`${newUrls.length} عکس ثانویه با موفقیت آپلود و اضافه شد`);
    } catch (err: any) {
      alert(err?.message || 'خطا در آپلود عکس‌های ثانویه');
    } finally {
      setUploadingSecondary(false);
      e.target.value = '';
    }
  };

  const handleRemoveSecondary = (index: number) => {
    const updated = secondaryImages.filter((_, i) => i !== index);
    setSecondaryImages(updated);
    setFormData((prev) => ({ ...prev, galleryImages: updated.join('\n') }));
  };

  const handleMoveSecondary = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= secondaryImages.length) return;
    const updated = [...secondaryImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSecondaryImages(updated);
    setFormData((prev) => ({ ...prev, galleryImages: updated.join('\n') }));
  };

  const handleSetSecondaryAsMain = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    showToast('تصویر به عنوان عکس شاخص تنظیم شد');
  };

  const handleFilePickerSelect = (url: string) => {
    if (filePickerTarget === 'main') {
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      showToast('عکس شاخص از رسانه‌ها انتخاب شد');
    } else {
      const updated = [...secondaryImages, url];
      setSecondaryImages(updated);
      setFormData((prev) => ({ ...prev, galleryImages: updated.join('\n') }));
      showToast('عکس به گالری ثانویه افزوده شد');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('عنوان رویداد الزامی است.');
      return;
    }

    if (!formData.date.trim()) {
      setFormError('تاریخ نمایشی شمسی الزامی است.');
      return;
    }

    try {
      setSubmitting(true);

      const parsedGalleryImages = showRawUrlArea
        ? formData.galleryImages
            .split('\n')
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : secondaryImages;

      const payload = {
        title: formData.title.trim(),
        date: formData.date.trim(),
        dateISO: formData.dateISO.trim(),
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        imageUrl: formData.imageUrl.trim(),
        price: Number(formData.price) || 0,
        durationHours: Number(formData.durationHours) || 0,
        status: formData.status,
        collaborators: programCollaborators.map((c) => c.memberId).filter((id) => id > 0),
        collaboratorDetails: programCollaborators,
        sponsors: editingProgram?.sponsors || [],
        gallery: {
          images: parsedGalleryImages,
          videos: editingProgram?.gallery?.videos || [],
        },
      };

      if (editingProgram) {
        await updateProgram(editingProgram.id, payload);
        showToast('رویداد با موفقیت ویرایش شد.');
      } else {
        await createProgram(payload);
        showToast('رویداد جدید با موفقیت ایجاد شد.');
      }

      setModalOpen(false);
      await loadPrograms();
    } catch (err: any) {
      setFormError(err?.message || 'خطا در ثبت رویداد');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      await deleteProgram(id);
      showToast('رویداد با موفقیت حذف شد.');
      setDeleteConfirmId(null);
      await loadPrograms();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف رویداد');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Programs
  const filteredPrograms = programs.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.title?.toLowerCase().includes(query) ||
      p.shortDescription?.toLowerCase().includes(query) ||
      p.date?.includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-emerald-400/40">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت رویدادها و برنامه‌ها</h1>
          <p className="text-sm text-slate-400 mt-1">
            ایجاد رویداد جدید، ویرایش اطلاعات، تنظیم قیمت و وضعیت رویدادها
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ایجاد رویداد جدید
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="جستجو بر اساس عنوان یا تاریخ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">وضعیت:</span>
          {(['all', 'upcoming', 'past'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {st === 'all' ? 'همه' : st === 'upcoming' ? 'پیش‌رو' : 'پایان‌یافته'}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">در حال بارگذاری لیست رویدادها...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-base font-semibold text-slate-300">هیچ رویدادی یافت نشد</p>
            <p className="text-xs mt-1">با زدن دکمه «ایجاد رویداد جدید»، اولین رویداد را ثبت کنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">رویداد</th>
                  <th className="py-4 px-4">تاریخ برگزاری</th>
                  <th className="py-4 px-4">هزینه (تومان)</th>
                  <th className="py-4 px-4">وضعیت</th>
                  <th className="py-4 px-4">ثبت‌نام‌ها</th>
                  <th className="py-4 px-6 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredPrograms.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prog.imageUrl || 'https://via.placeholder.com/100'}
                          alt={prog.title}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-700 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <h4 className="font-bold text-white text-sm truncate">{prog.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {prog.shortDescription || 'بدون توضیحات کوتاه'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300 font-medium">
                      {prog.date}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      {!prog.price || prog.price === 0 ? (
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md">
                          رایگان
                        </span>
                      ) : (
                        <span className="text-white font-mono font-medium">
                          {Number(prog.price).toLocaleString('fa-IR')}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          prog.status === 'upcoming'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {prog.status === 'upcoming' ? 'پیش‌رو' : 'پایان‌یافته'}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300 font-mono">
                      {prog.registeredCount || 0} نفر
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prog)}
                          title="ویرایش رویداد"
                          className="p-2 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(prog.id)}
                          title="حذف رویداد"
                          className="p-2 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-xl font-black text-white">
                {editingProgram ? `ویرایش رویداد: ${editingProgram.title}` : 'ایجاد رویداد جدید'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Row 1: Title & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">عنوان رویداد *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: کارگاه آموزش مقدماتی پایتون"
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">وضعیت رویداد</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'upcoming' | 'past' })}
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="upcoming">پیش‌رو (Upcoming)</option>
                    <option value="past">پایان یافته (Past)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Date & DateISO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تاریخ نمایشی (شمسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="مثال: ۲۵ آبان ۱۴۰۳"
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تاریخ میلادی برای مرتب‌سازی (dateISO)
                  </label>
                  <input
                    type="date"
                    dir="ltr"
                    value={formData.dateISO}
                    onChange={(e) => setFormData({ ...formData, dateISO: e.target.value })}
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Price & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    هزینه شرکت (تومان - ۰ یعنی رایگان)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    dir="ltr"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مدت زمان برگزاری (به ساعت)
                  </label>
                  <input
                    type="number"
                    min="0"
                    dir="ltr"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Primary Image URL, Upload & Media Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  تصویر شاخص رویداد (بنر اصلی)
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... یا انتخاب از رسانه‌ها یا آپلود کنید"
                    className="flex-1 bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFilePickerTarget('main');
                        setFilePickerOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-600 transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>انتخاب از رسانه‌ها</span>
                    </button>

                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors whitespace-nowrap shadow-md shadow-blue-600/20">
                      {uploadingImage ? (
                        <span>در حال آپلود...</span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>آپلود مستقیم</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="mt-3 flex items-center justify-between bg-slate-900/50 p-2.5 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0"
                      />
                      <span className="text-xs text-slate-300 font-mono truncate" dir="ltr">
                        {formData.imageUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      title="حذف تصویر شاخص"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Row 5: Short Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  خلاصه کوتاه توضیحات (جهت نمایش در کارت‌ها)
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="توضیح کوتاه درباره موضوع کارگاه یا همایش..."
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 6: Full Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  توضیحات کامل رویداد (صفحه جزئیات)
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="سرفصل‌ها، ملزومات، اهداف دوره یا رویداد..."
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 7: Registration Link (Optional) */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    لینک ثبت‌نام در رویداد (اختیاری)
                  </label>
                  {availableForms.length > 0 && (
                    <span className="text-[11px] text-blue-400 font-medium">
                      می‌توانید لینک خارجی وارد کنید یا فرم پرسلاین انتخاب فرمایید
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.registrationLink}
                    onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                    placeholder="https://evand.com/... یا /form/xyz"
                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />

                  {availableForms.length > 0 && (
                    <select
                      value={formData.registrationLink}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({ ...formData, registrationLink: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- انتخاب از پرسلاین انجمن --</option>
                      {availableForms.map((f) => (
                        <option key={f.id} value={`/form/${f.slug || f.id}`}>
                          {f.type === 'registration'
                            ? '📝 [ثبت‌نام]'
                            : f.type === 'survey'
                            ? '📊 [نظرسنجی]'
                            : f.type === 'quiz'
                            ? '🎯 [کوئیز]'
                            : '📋 [فرم]'}{' '}
                          {f.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Row 8: Secondary Images & Event Gallery */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-700/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <h4 className="text-sm font-bold text-white">
                      تصاویر ثانویه و گالری رویداد
                    </h4>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                      {secondaryImages.length} عکس
                    </span>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setFilePickerTarget('secondary');
                        setFilePickerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>انتخاب از رسانه‌ها</span>
                    </button>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm">
                      {uploadingSecondary ? (
                        <span>در حال آپلود...</span>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>آپلود عکس‌های جدید</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingSecondary}
                        onChange={handleSecondaryFilesUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowRawUrlArea(!showRawUrlArea)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                        showRawUrlArea
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {showRawUrlArea ? 'بستن حالت متنی' : 'ویرایش متنی URLها'}
                    </button>
                  </div>
                </div>

                {/* Add by Single URL Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={newSecondaryUrl}
                    onChange={(e) => setNewSecondaryUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSecondaryUrl();
                      }
                    }}
                    placeholder="یا آدرس اینترنتی عکس را اینجا وارد کرده و اینتر بزنید (https://...)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddSecondaryUrl}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    افزودن با لینک
                  </button>
                </div>

                {/* Raw URL textarea if toggled */}
                {showRawUrlArea && (
                  <div className="pt-2 animate-fade-in">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      ویرایش دسته‌جمعی لینک‌ها (هر خط یک آدرس تصویر):
                    </label>
                    <textarea
                      rows={3}
                      dir="ltr"
                      value={formData.galleryImages}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, galleryImages: val });
                        const parsed = val.split('\n').map((u) => u.trim()).filter(Boolean);
                        setSecondaryImages(parsed);
                      }}
                      placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Secondary Images Preview Grid */}
                {secondaryImages.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    هنوز تصویر ثانویه‌ای به این رویداد اضافه نشده است. می‌توانید آپلود کنید یا لینک وارد نمایید.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {secondaryImages.map((imgUrl, index) => (
                      <div
                        key={`${imgUrl}-${index}`}
                        className="group bg-slate-800 rounded-xl p-2 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between"
                      >
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-950 relative">
                          <img
                            src={imgUrl}
                            alt={`گالری ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="mt-2 text-[10px] text-slate-400 font-mono truncate" dir="ltr" title={imgUrl}>
                          {imgUrl}
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveSecondary(index, 'up')}
                                title="انتقال به قبل"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                              >
                                ◀
                              </button>
                            )}
                            {index < secondaryImages.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveSecondary(index, 'down')}
                                title="انتقال به بعد"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                              >
                                ▶
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSetSecondaryAsMain(imgUrl)}
                              title="تنظیم به عنوان بنر اصلی"
                              className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700 text-[10px]"
                            >
                              ★
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSecondary(index)}
                            title="حذف این عکس"
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collaborators & Team in this event */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span>👥</span>
                      <span>تیم برگزاری و همکاران رویداد</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      افرادی که در برگزاری این رویداد حضور داشته‌اند را همراه با نقش آن‌ها مشخص کنید (عکس و وظیفه آن‌ها در صفحه رویداد نمایش می‌یابد).
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-lg shrink-0">
                    {programCollaborators.length} همکار
                  </span>
                </div>

                {/* Added Collaborators List */}
                {programCollaborators.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    هنوز فرد یا کادری برای این رویداد ثبت نشده است. از فرم زیر اضافه کنید.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {programCollaborators.map((collab, index) => {
                      const member = collab.memberId ? membersList.find((m) => m.id === collab.memberId) : undefined;
                      const avatar = collab.imageUrl || member?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

                      return (
                        <div
                          key={`${collab.memberId}-${index}`}
                          className="flex items-center justify-between gap-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={avatar}
                              alt={collab.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-600"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
                              }}
                            />
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-white truncate">
                                {collab.name || member?.name || 'همکار'}
                              </span>
                              <input
                                type="text"
                                value={collab.role}
                                onChange={(e) => handleUpdateCollaboratorRole(index, e.target.value)}
                                placeholder="وظیفه در رویداد..."
                                className="mt-0.5 bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-[10px] text-blue-300 w-full focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(index)}
                            className="text-slate-400 hover:text-rose-400 p-1 text-xs shrink-0"
                            title="حذف از تیم این رویداد"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Collaborator Row */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300">افزودن همکار / کادر جدید:</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomCollab(!isCustomCollab)}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      {isCustomCollab ? '← انتخاب از اعضای انجمن' : '+ افزودن فرد آزاد / مهمان (خارج از انجمن)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      {isCustomCollab ? (
                        <input
                          type="text"
                          value={customCollabName}
                          onChange={(e) => setCustomCollabName(e.target.value)}
                          placeholder="نام و نام خانوادگی فرد مهمان..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- انتخاب عضو انجمن --</option>
                          {membersList.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.memberships?.[0]?.position || 'عضو'})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={collabRole}
                        onChange={(e) => setCollabRole(e.target.value)}
                        placeholder="وظیفه در رویداد (مثلاً دبیر، مدرس)..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={handleAddCollaborator}
                        className="w-full h-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>+ افزودن به رویداد</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick role suggestions */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-500">پیشنهادات وظیفه:</span>
                    {['دبیر رویداد', 'مدرس کارگاه', 'سخنران', 'منتور', 'مدیر اجرایی', 'کادر اجرایی', 'طراح گرافیک', 'عکاس'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCollabRole(r)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/80 transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingProgram ? 'ذخیره تغییرات رویداد' : 'ایجاد و انتشار رویداد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">تایید حذف رویداد</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              آیا از حذف این رویداد اطمینان دارید؟ این عملیات قابل بازگشت نخواهد بود.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Picker Modal for Selecting from Media Library */}
      <FilePickerModal
        isOpen={filePickerOpen}
        onClose={() => setFilePickerOpen(false)}
        onSelect={handleFilePickerSelect}
        title={filePickerTarget === 'main' ? 'انتخاب تصویر شاخص رویداد' : 'انتخاب تصویر ثانویه برای رویداد'}
        onlyImages={true}
      />
    </div>
  );
};

export default AdminPrograms;

