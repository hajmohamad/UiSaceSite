import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminMembers,
  createMember,
  updateMember,
  deleteMember,
  uploadMedia,
} from '../../services/adminApi';
import type { Member, Membership } from '../../types';

const POSITION_SUGGESTIONS = [
  'دبیر انجمن',
  'نایب دبیر انجمن',
  'عضو شورای مرکزی',
  'مسئول روابط عمومی',
  'مسئول آموزش و کارگاه‌ها',
  'مسئول فنی و وب‌سایت',
  'مسئول گرافیک و مدیا',
  'مسئول پادکست و نشریه',
  'عضو علی‌البدل',
  'همکار فعال',
];

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350';

const AdminMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Member Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bio, setBio] = useState('');
  const [memberships, setMemberships] = useState<Membership[]>([]);

  // New Membership Row temporary inputs
  const [newMembershipYear, setNewMembershipYear] = useState<number>(1404);
  const [newMembershipPosition, setNewMembershipPosition] = useState<string>('عضو شورای مرکزی');

  // New Year Modal State
  const [newYearModalOpen, setNewYearModalOpen] = useState(false);
  const [targetNewYear, setTargetNewYear] = useState<number>(1405);
  const [selectedMemberIdsForNewYear, setSelectedMemberIdsForNewYear] = useState<number[]>([]);
  const [defaultRoleForNewYear, setDefaultRoleForNewYear] = useState<string>('عضو شورای مرکزی');
  const [batchAdding, setBatchAdding] = useState(false);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getAdminMembers();
      setMembers(data || []);
    } catch (err: any) {
      console.error(err);
      showToast('خطا در بارگذاری لیست اعضا');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Compute all unique years across all members
  const allYears = useMemo(() => {
    const yearSet = new Set<number>();
    members.forEach((m) => {
      (m.memberships || []).forEach((ms) => {
        if (ms.year) yearSet.add(ms.year);
      });
    });
    // Ensure recent years like 1403, 1404 are present
    yearSet.add(1404);
    yearSet.add(1403);
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        search.trim() === '' ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.bio && m.bio.toLowerCase().includes(search.toLowerCase())) ||
        (m.memberships || []).some((ms) =>
          ms.position.toLowerCase().includes(search.toLowerCase())
        );

      const matchYear =
        selectedYear === 'all' ||
        (m.memberships || []).some((ms) => ms.year === Number(selectedYear));

      return matchSearch && matchYear;
    });
  }, [members, search, selectedYear]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingMember(null);
    setName('');
    setImageUrl('');
    setBio('');
    const defaultYear = allYears[0] || 1404;
    setMemberships([
      {
        year: defaultYear,
        position: 'عضو شورای مرکزی',
      },
    ]);
    setNewMembershipYear(defaultYear);
    setNewMembershipPosition('عضو شورای مرکزی');
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setName(m.name || '');
    setImageUrl(m.imageUrl || '');
    setBio(m.bio || '');
    const mList = m.memberships ? [...m.memberships] : [];
    setMemberships(mList);
    const defaultYear = allYears[0] || 1404;
    setNewMembershipYear(defaultYear);
    setNewMembershipPosition('عضو شورای مرکزی');
    setFormError(null);
    setModalOpen(true);
  };

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadMedia(file);
      setImageUrl(res.url);
      showToast('تصویر پروفایل با موفقیت آپلود شد.');
    } catch (err: any) {
      alert(err?.message || 'خطا در آپلود تصویر');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add Membership Row
  const handleAddMembershipRow = () => {
    if (!newMembershipPosition.trim()) {
      alert('لطفاً سمت یا عنوان نقش را وارد کنید');
      return;
    }
    // Prevent duplicate year if position already exists for that year
    const exists = memberships.some(
      (ms) => ms.year === newMembershipYear && ms.position === newMembershipPosition.trim()
    );
    if (exists) {
      alert('این سمت برای همین سال قبلاً در لیست ثبت شده است.');
      return;
    }

    setMemberships([
      ...memberships,
      {
        year: Number(newMembershipYear),
        position: newMembershipPosition.trim(),
      },
    ]);
    setNewMembershipPosition('عضو شورای مرکزی');
  };

  // Remove Membership Row
  const handleRemoveMembershipRow = (index: number) => {
    setMemberships(memberships.filter((_, i) => i !== index));
  };

  // Save Member (Create or Update)
  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('لطفاً نام و نام خانوادگی عضو را وارد کنید.');
      return;
    }

    if (memberships.length === 0) {
      setFormError('حداقل یک سابقه عضویت (سال و سمت) برای عضو الزامی است.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        name: name.trim(),
        imageUrl: imageUrl.trim() || DEFAULT_AVATAR,
        bio: bio.trim(),
        memberships: memberships.map((ms) => ({
          year: Number(ms.year),
          position: ms.position.trim(),
        })),
      };

      if (editingMember) {
        await updateMember(editingMember.id, payload);
        showToast('مشخصات عضو با موفقیت ویرایش شد.');
      } else {
        await createMember(payload);
        showToast('عضو جدید با موفقیت اضافه شد.');
      }

      setModalOpen(false);
      await loadMembers();
    } catch (err: any) {
      setFormError(err?.message || 'خطا در ذخیره اطلاعات عضو');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deleteConfirmId) return;
    try {
      setDeleting(true);
      await deleteMember(deleteConfirmId);
      showToast('عضو با موفقیت حذف شد.');
      setDeleteConfirmId(null);
      await loadMembers();
    } catch (err: any) {
      showToast(err?.message || 'خطا در حذف عضو');
    } finally {
      setDeleting(false);
    }
  };

  // Batch add members to new year
  const handleAddNewYearBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNewYear || targetNewYear < 1390) {
      alert('لطفاً یک سال معتبر وارد کنید (مثلاً 1405)');
      return;
    }

    if (selectedMemberIdsForNewYear.length === 0) {
      // Just activate the year in the filter tabs
      setSelectedYear(String(targetNewYear));
      setNewYearModalOpen(false);
      showToast(`سال ${targetNewYear} به لیست دوره‌ها اضافه شد. اکنون می‌توانید اعضا را به این سال اضافه کنید.`);
      return;
    }

    try {
      setBatchAdding(true);
      for (const id of selectedMemberIdsForNewYear) {
        const mem = members.find((m) => m.id === id);
        if (!mem) continue;
        const currentList = mem.memberships ? [...mem.memberships] : [];
        if (!currentList.some((ms) => ms.year === targetNewYear)) {
          currentList.push({
            year: targetNewYear,
            position: defaultRoleForNewYear.trim() || 'عضو شورای مرکزی',
          });
          await updateMember(mem.id, {
            name: mem.name,
            imageUrl: mem.imageUrl,
            bio: mem.bio,
            memberships: currentList,
          });
        }
      }
      showToast(`سال ${targetNewYear} با ${selectedMemberIdsForNewYear.length} عضو با موفقیت راه‌اندازی شد.`);
      setNewYearModalOpen(false);
      setSelectedYear(String(targetNewYear));
      await loadMembers();
    } catch (err: any) {
      alert(err?.message || 'خطا در ثبت دوره جدید');
    } finally {
      setBatchAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl">
              👥
            </span>
            مدیریت اعضای انجمن و دوره‌ها
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            ثبت، ویرایش و سوابق اعضای شورای مرکزی و همکاران، و تعریف سال‌های تحصیلی جدید انجمن
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              const nextYear = (allYears[0] || 1404) + 1;
              setTargetNewYear(nextYear);
              setSelectedMemberIdsForNewYear([]);
              setNewYearModalOpen(true);
            }}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-600/60 flex items-center gap-2"
          >
            <span>🗓️</span>
            <span>+ تعریف سال / دوره جدید</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>افزودن عضو جدید</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs block">کل اعضای ثبت‌شده</span>
            <span className="text-2xl font-black text-white mt-1 block">{members.length} نفر</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
            👤
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs block">تعداد دوره‌ها / سال‌ها</span>
            <span className="text-2xl font-black text-white mt-1 block">{allYears.length} دوره</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl">
            🎓
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs block">اعضای دوره فعلی ({allYears[0] || 1404})</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {
                members.filter((m) =>
                  (m.memberships || []).some((ms) => ms.year === (allYears[0] || 1404))
                ).length
              }{' '}
              نفر
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
            ⚡
          </div>
        </div>
      </div>

      {/* Year Filter Tabs */}
      <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/70 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 px-2 shrink-0">فیلتر دوره:</span>
        <button
          onClick={() => setSelectedYear('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedYear === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          همه دوره‌ها ({members.length})
        </button>
        {allYears.map((yr) => {
          const count = members.filter((m) =>
            (m.memberships || []).some((ms) => ms.year === yr)
          ).length;
          return (
            <button
              key={yr}
              onClick={() => setSelectedYear(String(yr))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedYear === String(yr)
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <span>سال {yr}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/40">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/70">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام، سمت (مثلاً دبیر)، یا سوابق..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Members Grid / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs">در حال بارگذاری اطلاعات اعضا...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl p-12 text-center text-slate-400">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="font-bold text-sm text-slate-300">هیچ عضوی با این مشخصات یافت نشد.</p>
          <p className="text-xs text-slate-500 mt-1">
            می‌توانید فیلتر سال را تغییر دهید یا با دکمه بالا عضو جدید اضافه کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const sortedMs = member.memberships
              ? [...member.memberships].sort((a, b) => b.year - a.year)
              : [];
            const primaryPos = sortedMs[0]?.position || 'همکار انجمن';
            const primaryYear = sortedMs[0]?.year;

            return (
              <div
                key={member.id}
                className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition-all shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Avatar & Info */}
                  <div className="flex items-start gap-4 mb-3">
                    <img
                      src={member.imageUrl || DEFAULT_AVATAR}
                      alt={member.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 ring-2 ring-slate-800 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-blue-400 font-semibold mt-0.5 truncate">
                        {primaryPos}
                      </p>
                      {primaryYear && (
                        <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-900/70 border border-slate-700 px-2 py-0.5 rounded-md font-mono">
                          دوره {primaryYear}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio snippet */}
                  {member.bio && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3 bg-slate-900/30 p-2.5 rounded-xl border border-slate-700/40">
                      {member.bio}
                    </p>
                  )}

                  {/* Memberships Badges */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      سوابق در دوره‌ها:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sortedMs.map((ms, idx) => (
                        <span
                          key={`${ms.year}-${idx}`}
                          className="text-[11px] bg-slate-700/70 text-slate-200 border border-slate-600/60 px-2 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <span className="font-mono text-amber-400 font-bold">{ms.year}:</span>
                          <span>{ms.position}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-700/70 flex items-center justify-between gap-2">
                  <Link
                    to={`/members/${member.id}`}
                    target="_blank"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>مشاهده در سایت</span>
                    <span>↗</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(member)}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold rounded-xl border border-blue-500/30 transition-all flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>ویرایش</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(member.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="حذف عضو"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{editingMember ? '✏️ ویرایش مشخصات عضو' : '✨ افزودن عضو جدید به انجمن'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitMember} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نام و نام خانوادگی <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: علی محمدی"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  تصویر پروفایل
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrl || DEFAULT_AVATAR}
                    alt="پیش‌نمایش"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-600 ring-2 ring-slate-700 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="آدرس تصویر (URL) یا از دکمه زیر آپلود کنید..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{uploadingImage ? 'در حال آپلود...' : 'انتخاب و آپلود عکس از دستگاه'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  درباره عضو / بیوگرافی و رزومه کوتاه
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="توضیحاتی در مورد سوابق تحصیلی، حوزه‌های تخصصی، یا علاقه‌مندی‌ها..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Memberships by Year Section */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>🎓</span>
                    <span>سوابق عضویت و سمت‌ها در سال‌های مختلف</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {memberships.length} سابقه ثبت شده
                  </span>
                </div>

                {/* Current Memberships list */}
                {memberships.length === 0 ? (
                  <div className="py-4 text-center text-xs text-rose-300 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    هیچ سابقه‌ای ثبت نشده است. لطفاً حداقل یک سال و سمت اضافه کنید.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberships.map((ms, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 bg-slate-800 p-2.5 rounded-xl border border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                            سال {ms.year}
                          </span>
                          <span className="text-xs text-white font-semibold">{ms.position}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMembershipRow(index)}
                          className="text-slate-400 hover:text-rose-400 text-xs p-1"
                          title="حذف این سابقه"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new membership row */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] text-slate-400 mb-1">سال دوره:</label>
                    <input
                      type="number"
                      value={newMembershipYear}
                      onChange={(e) => setNewMembershipYear(Number(e.target.value))}
                      placeholder="1404"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] text-slate-400 mb-1">عنوان سمت / مسئولیت:</label>
                    <input
                      type="text"
                      value={newMembershipPosition}
                      onChange={(e) => setNewMembershipPosition(e.target.value)}
                      placeholder="مثال: دبیر انجمن، عضو شورا، مسئول وب‌سایت..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-full sm:w-auto sm:self-end">
                    <button
                      type="button"
                      onClick={handleAddMembershipRow}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      + افزودن سابقه
                    </button>
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">سمت‌های متداول:</span>
                  <div className="flex flex-wrap gap-1">
                    {POSITION_SUGGESTIONS.slice(0, 6).map((pos) => (
                      <button
                        type="button"
                        key={pos}
                        onClick={() => setNewMembershipPosition(pos)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/80 transition-colors"
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingMember ? 'ذخیره تغییرات' : 'افزودن عضو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Define New Year / Council Modal */}
      {newYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🗓️ تعریف دوره یا سال جدید انجمن</span>
              </h2>
              <button
                onClick={() => setNewYearModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewYearBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  سال تحصیلی / دوره جدید <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={targetNewYear}
                  onChange={(e) => setTargetNewYear(Number(e.target.value))}
                  placeholder="مثال: 1405"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  پس از ثبت، تب این سال بلافاصله در فیلترها و در صفحه عمومی «اعضای انجمن» نمایش داده خواهد شد.
                </p>
              </div>

              {/* Optional: Pick existing members to carry over to new year */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    انتقال اعضای قبلی به این سال (اختیاری):
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {selectedMemberIdsForNewYear.length} عضو انتخاب شده
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto bg-slate-900/60 p-2 rounded-xl border border-slate-700/80 space-y-1.5">
                  {members.map((m) => {
                    const isChecked = selectedMemberIdsForNewYear.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isChecked ? 'bg-blue-600/20 text-blue-300' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMemberIdsForNewYear([...selectedMemberIdsForNewYear, m.id]);
                            } else {
                              setSelectedMemberIdsForNewYear(
                                selectedMemberIdsForNewYear.filter((id) => id !== m.id)
                              );
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-600"
                        />
                        <img
                          src={m.imageUrl || DEFAULT_AVATAR}
                          alt={m.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-semibold">{m.name}</span>
                        <span className="text-[10px] text-slate-400">
                          ({m.memberships?.[0]?.position || 'عضو'})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {selectedMemberIdsForNewYear.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    سمت پیش‌فرض برای اعضای منتقل‌شده:
                  </label>
                  <input
                    type="text"
                    value={defaultRoleForNewYear}
                    onChange={(e) => setDefaultRoleForNewYear(e.target.value)}
                    placeholder="عضو شورای مرکزی"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    می‌توانید بعداً سمت هر فرد را به صورت جداگانه از لیست ویرایش کنید.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewYearModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={batchAdding}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  {batchAdding && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>ثبت دوره جدید</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-bold text-base text-white">حذف عضو انجمن</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              آیا از حذف این عضو از سامانه اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteMember}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-1.5"
              >
                {deleting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>حذف نهایی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
