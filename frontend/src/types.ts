export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Consultation {
  id: number;
  title: string;
  description: string;
  department: string;
  start_date: string;
  end_date: string;
  status: 'Draft' | 'Active' | 'Closed';
  created_at: string;
  comment_count: number;
}

export interface SentimentResultOut {
  sentiment: Sentiment;
  confidence: number;
  processed_text: string;
  keywords: string[];
  model_version: string;
  analyzed_at: string;
}

export interface Comment {
  id: number;
  consultation_id: number;
  consultation_title?: string;
  comment_text: string;
  submitted_at: string;
  submitter_name: string;
  status: string;
  sentiment_result?: SentimentResultOut | null;
}

export interface PaginatedComments {
  items: Comment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalyzeResponse {
  sentiment: Sentiment;
  confidence: number;
  processed_text: string;
  keywords: string[];
  probabilities: Record<string, number>;
  model_version: string;
}

export interface BatchAnalyzeResult {
  total_rows: number;
  processed: number;
  failed: number;
  comments: Comment[];
  errors: string[];
}

export interface DashboardStats {
  total_comments: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  average_confidence: number;
  total_consultations: number;
  active_consultations: number;
}

export interface SentimentByConsultation {
  consultation_id: number;
  consultation_title: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface TrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

export interface ReportOut {
  id: number;
  consultation_id: number | null;
  generated_at: string;
  file_path: string;
  total_comments: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  labels: string[];
  confusion_matrix: number[][];
  train_size: number;
  test_size: number;
  model_version: string;
}
