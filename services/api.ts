import type { Member, Program, Course, Job } from '../types';
import { MEMBERS, PROGRAMS, courses as initialCourses } from '../arvanconstan';

const API_BASE = '/api';

/**
 * دریافت آمار کلی وب‌سایت برای صفحه اصلی
 */
export async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback stats:', err);
  }

  // Fallback
  return {
    membersCount: MEMBERS.length,
    programsCount: PROGRAMS.length,
    upcomingProgramsCount: PROGRAMS.filter(p => p.status === 'upcoming').length,
    coursesCount: initialCourses.length,
    jobsCount: 20,
    registrationsCount: 0,
  };
}

/**
 * دریافت لیست برنامه‌ها با قابلیت فیلتر بر اساس وضعیت، سال و جستجو
 */
export async function getPrograms(params?: {
  status?: string;
  year?: string | number;
  search?: string;
}): Promise<Program[]> {
  try {
    const url = new URL(`${window.location.origin}${API_BASE}/programs`);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.year && params.year !== 'all') url.searchParams.set('year', String(params.year));
    if (params?.search) url.searchParams.set('search', params.search);

    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback programs:', err);
  }

  // Fallback to constants
  let result = [...PROGRAMS];
  if (params?.status) {
    result = result.filter(p => p.status === params.status);
  }
  if (params?.year && params.year !== 'all') {
    result = result.filter(p => new Date(p.dateISO).getFullYear() === Number(params.year));
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q)
    );
  }
  return result;
}

/**
 * دریافت جزئیات یک برنامه با شناسه
 */
export async function getProgramById(id: number | string): Promise<Program | undefined> {
  try {
    const res = await fetch(`${API_BASE}/programs/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback for program ID:', id, err);
  }

  return PROGRAMS.find(p => p.id === Number(id));
}

/**
 * دریافت لیست اعضای انجمن با فیلتر سال
 */
export async function getMembers(year?: string | number): Promise<Member[]> {
  try {
    const url = new URL(`${window.location.origin}${API_BASE}/members`);
    if (year && year !== 'all') url.searchParams.set('year', String(year));

    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback members:', err);
  }

  if (year && year !== 'all') {
    return MEMBERS.filter(m => m.memberships.some(ms => ms.year === Number(year)));
  }
  return MEMBERS;
}

/**
 * دریافت جزئیات یک عضو و برنامه‌های همکار او
 */
export async function getMemberById(id: number | string): Promise<{
  member: Member;
  collaboratedPrograms: Program[];
} | undefined> {
  try {
    const res = await fetch(`${API_BASE}/members/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.member) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback for member ID:', id, err);
  }

  const member = MEMBERS.find(m => m.id === Number(id));
  if (!member) return undefined;

  const collaboratedPrograms = PROGRAMS.filter(p => p.collaborators.includes(member.id));
  return { member, collaboratedPrograms };
}

/**
 * دریافت لیست دوره‌های آموزشی
 */
export async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE}/courses`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback courses:', err);
  }

  return initialCourses;
}

/**
 * دریافت جزئیات یک دوره با شناسه
 */
export async function getCourseById(id: string): Promise<Course | undefined> {
  try {
    const res = await fetch(`${API_BASE}/courses/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback for course ID:', id, err);
  }

  return initialCourses.find(c => c.id === id);
}

/**
 * دریافت لیست فرصت‌های شغلی
 */
export async function getJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback jobs:', err);
  }

  return [];
}

/**
 * دریافت جزئیات یک فرصت شغلی با شناسه
 */
export async function getJobById(id: string): Promise<Job | undefined> {
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback for job ID:', id, err);
  }

  return undefined;
}

/**
 * ثبت نام در رویداد (با ارسال فرم و فایل رسید)
 */
export async function postRegistration(formData: FormData) {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || `خطا در ارسال اطلاعات: ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * ارسال پیام از فرم تماس با ما
 */
export async function postContact(formData: { name: string; email: string; message: string }) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || `خطا در ارسال پیام: ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}
