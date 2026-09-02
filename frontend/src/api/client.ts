import axios from 'axios';
import type {
  User,
  Consultation,
  Comment,
  PaginatedComments,
  AnalyzeResponse,
  BatchAnalyzeResult,
  DashboardStats,
  SentimentByConsultation,
  TrendPoint,
  KeywordCount,
  ReportOut,
  ModelMetrics,
} from '../types';

const api = axios.create({
  baseURL: 'https://e-sentiment.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('esentiment_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (err.message) return err.message;
  }
  return 'Something went wrong. Please try again.';
}

// ---------------- Auth ----------------
export async function login(email: string, password: string) {
  const res = await api.post<{ access_token: string; user: User }>('/auth/login', {
    email,
    password,
  });
  return res.data;
}

export async function fetchMe() {
  const res = await api.get<User>('/auth/me');
  return res.data;
}

// ---------------- Consultations ----------------
export async function fetchConsultations(params?: { status?: string; search?: string }) {
  const res = await api.get<Consultation[]>('/consultations', { params });
  return res.data;
}

export async function fetchConsultation(id: number) {
  const res = await api.get<Consultation>(`/consultations/${id}`);
  return res.data;
}

export async function createConsultation(payload: Partial<Consultation>) {
  const res = await api.post<Consultation>('/consultations', payload);
  return res.data;
}

export async function updateConsultation(id: number, payload: Partial<Consultation>) {
  const res = await api.put<Consultation>(`/consultations/${id}`, payload);
  return res.data;
}

export async function deleteConsultation(id: number) {
  await api.delete(`/consultations/${id}`);
}

// ---------------- Comments ----------------
export async function submitComment(payload: {
  consultation_id: number;
  comment_text: string;
  submitter_name?: string;
}) {
  const res = await api.post<{ comment: Comment; message: string }>('/comments', payload);
  return res.data;
}

export async function fetchComments(params: {
  page?: number;
  page_size?: number;
  search?: string;
  sentiment?: string;
  consultation_id?: number;
  date_from?: string;
  date_to?: string;
}) {
  const res = await api.get<PaginatedComments>('/comments', { params });
  return res.data;
}

export async function fetchComment(id: number) {
  const res = await api.get<Comment>(`/comments/${id}`);
  return res.data;
}

// ---------------- AI Analyze ----------------
export async function analyzeText(text: string) {
  const res = await api.post<AnalyzeResponse>('/analyze', { text });
  return res.data;
}

export async function analyzeBatch(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post<BatchAnalyzeResult>('/analyze/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ---------------- Dashboard ----------------
export async function fetchDashboardStats() {
  const res = await api.get<DashboardStats>('/dashboard/stats');
  return res.data;
}

export async function fetchSentimentByConsultation() {
  const res = await api.get<SentimentByConsultation[]>('/dashboard/by-consultation');
  return res.data;
}

export async function fetchTrends() {
  const res = await api.get<TrendPoint[]>('/dashboard/trends');
  return res.data;
}

export async function fetchKeywords(limit = 15) {
  const res = await api.get<KeywordCount[]>('/dashboard/keywords', { params: { limit } });
  return res.data;
}

// ---------------- Reports ----------------
export async function generateReport(consultation_id?: number) {
  const res = await api.post<ReportOut>('/reports/generate', { consultation_id });
  return res.data;
}

export async function fetchReports() {
  const res = await api.get<ReportOut[]>('/reports');
  return res.data;
}

export async function fetchModelMetrics() {
  const res = await api.get<ModelMetrics>('/reports/model-metrics');
  return res.data;
}

export async function downloadCsvExport(consultationId?: number) {
  const params = consultationId ? { consultation_id: consultationId } : {};
  const res = await api.get('/reports/export/csv', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  const disposition = res.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename=([^;]+)/);
  link.download = match?.[1]?.trim() || 'esentiment_export.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default api;
