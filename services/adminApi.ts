import type {
  AdminUser,
  Program,
  Registration,
  ContactMessage,
  Member,
  Course,
  UploadedFileItem,
  PorslineForm,
  FormResponse,
  FormAnalytics,
  AdminStats,
} from '../types';

const API_BASE = '/api';
const TOKEN_KEY = 'uisace_admin_token';
const USER_KEY = 'uisace_admin_user';

// --- Token & Session Management ---

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): AdminUser | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setUser(user: AdminUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  removeSession();
  window.location.href = '/admin/login';
}

// --- Authenticated Fetch Helper ---

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type if body is FormData (let browser handle multipart boundary)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeSession();
    // Redirect if we are on an admin page
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
    throw new Error('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `خطا در برقراری ارتباط با سرور (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

// --- Auth Endpoints ---

export async function loginAdmin(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'نام کاربری یا رمز عبور اشتباه است');
  }

  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function getMe(): Promise<AdminUser> {
  return authFetch(`${API_BASE}/admin/me`);
}

// --- Users Management Endpoints ---

export async function getAdminUsers(): Promise<AdminUser[]> {
  return authFetch(`${API_BASE}/admin/users`);
}

export async function createAdminUser(userData: {
  username: string;
  password: string;
  role?: string;
}): Promise<AdminUser> {
  return authFetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function deleteAdminUser(id: number): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAdminUserPassword(id: number, password: string): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/users/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  });
}

// --- File Upload ---

export async function uploadMedia(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);

  return authFetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    body: formData,
  });
}

// --- Programs (Events) Management ---

export async function getAdminPrograms(): Promise<Program[]> {
  const res = await fetch(`${API_BASE}/programs`);
  if (!res.ok) {
    throw new Error('خطا در دریافت لیست رویدادها');
  }
  return res.json();
}

export async function createProgram(program: Omit<Program, 'id'>): Promise<Program> {
  return authFetch(`${API_BASE}/admin/programs`, {
    method: 'POST',
    body: JSON.stringify(program),
  });
}

export async function updateProgram(id: number, program: Partial<Program>): Promise<Program> {
  return authFetch(`${API_BASE}/admin/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(program),
  });
}

export async function deleteProgram(id: number): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/programs/${id}`, {
    method: 'DELETE',
  });
}

// --- Registrations Management ---

export async function getAdminRegistrations(): Promise<Registration[]> {
  return authFetch(`${API_BASE}/admin/registrations`);
}

export async function updateRegistrationStatus(
  id: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<Registration> {
  return authFetch(`${API_BASE}/admin/registrations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteRegistration(id: number): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/registrations/${id}`, {
    method: 'DELETE',
  });
}

// --- Contact Messages Management ---

export async function getAdminContactMessages(): Promise<ContactMessage[]> {
  return authFetch(`${API_BASE}/admin/contact`);
}

export async function updateContactStatus(
  id: number,
  status: 'unread' | 'read' | 'replied'
): Promise<ContactMessage> {
  return authFetch(`${API_BASE}/admin/contact/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteContactMessage(id: number): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/contact/${id}`, {
    method: 'DELETE',
  });
}

// --- Members Management ---

export async function getAdminMembers(): Promise<Member[]> {
  const res = await fetch(`${API_BASE}/members`);
  if (!res.ok) throw new Error('خطا در دریافت اعضا');
  return res.json();
}

export async function createMember(member: Omit<Member, 'id'>): Promise<Member> {
  return authFetch(`${API_BASE}/admin/members`, {
    method: 'POST',
    body: JSON.stringify(member),
  });
}

export async function updateMember(id: number, member: Partial<Member>): Promise<Member> {
  return authFetch(`${API_BASE}/admin/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(member),
  });
}

export async function deleteMember(id: number): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/members/${id}`, {
    method: 'DELETE',
  });
}

// --- Courses Management ---

export async function getAdminCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE}/courses`);
  if (!res.ok) throw new Error('خطا در دریافت دوره‌ها');
  return res.json();
}

export async function createCourse(course: Course): Promise<Course> {
  return authFetch(`${API_BASE}/admin/courses`, {
    method: 'POST',
    body: JSON.stringify(course),
  });
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<Course> {
  return authFetch(`${API_BASE}/admin/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  });
}

export async function deleteCourse(id: string): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/courses/${id}`, {
    method: 'DELETE',
  });
}

// --- File Manager Endpoints ---

export async function getAdminFiles(): Promise<{ files: UploadedFileItem[]; total: number }> {
  return authFetch(`${API_BASE}/admin/files`);
}

export async function uploadAdminFiles(
  files: File[],
  folder: string = 'general'
): Promise<{ files: UploadedFileItem[]; count: number }> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('folder', folder);

  return authFetch(`${API_BASE}/admin/files`, {
    method: 'POST',
    body: formData,
  });
}

export async function deleteAdminFile(path: string): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/files`, {
    method: 'DELETE',
    body: JSON.stringify({ path }),
  });
}

export async function renameAdminFile(
  oldPath: string,
  newName: string
): Promise<{ message: string; file: UploadedFileItem }> {
  return authFetch(`${API_BASE}/admin/files/rename`, {
    method: 'PUT',
    body: JSON.stringify({ oldPath, newName }),
  });
}

export async function replaceAdminFile(
  targetPath: string,
  file: File
): Promise<{ message: string; file: UploadedFileItem }> {
  const formData = new FormData();
  formData.append('path', targetPath);
  formData.append('file', file);

  return authFetch(`${API_BASE}/admin/files/replace`, {
    method: 'POST',
    body: formData,
  });
}

// --- Porsline / Form Builder Endpoints ---

export async function getAdminForms(params?: {
  type?: string;
  status?: string;
  search?: string;
}): Promise<PorslineForm[]> {
  const query = new URLSearchParams();
  if (params?.type && params.type !== 'all') query.set('type', params.type);
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString();
  return authFetch(`${API_BASE}/admin/forms${qs ? `?${qs}` : ''}`);
}

export async function getAdminFormById(id: number): Promise<PorslineForm> {
  return authFetch(`${API_BASE}/admin/forms/${id}`);
}

export async function createAdminForm(form: Partial<PorslineForm>): Promise<PorslineForm> {
  return authFetch(`${API_BASE}/admin/forms`, {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

export async function updateAdminForm(
  id: number,
  form: Partial<PorslineForm>
): Promise<PorslineForm> {
  return authFetch(`${API_BASE}/admin/forms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(form),
  });
}

export async function deleteAdminForm(id: number): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/forms/${id}`, {
    method: 'DELETE',
  });
}

export async function getAdminFormResponses(
  formId: number
): Promise<{ form: PorslineForm; responses: FormResponse[]; analytics: FormAnalytics }> {
  return authFetch(`${API_BASE}/admin/forms/${formId}/responses`);
}

export async function deleteAdminFormResponse(responseId: number): Promise<{ message: string }> {
  return authFetch(`${API_BASE}/admin/forms/responses/${responseId}`, {
    method: 'DELETE',
  });
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('خطا در دریافت آمار');
  return res.json();
}

