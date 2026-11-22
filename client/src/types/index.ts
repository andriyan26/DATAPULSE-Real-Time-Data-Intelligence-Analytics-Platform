export type UserRole = 'super_admin' | 'data_analyst' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  department: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

export interface MetricSummary {
  totalRecords: number;
  totalRevenue: number;
  completedTransactions: number;
  failedTransactions: number;
  liveTransactions: number;
  runningPipelines: number;
  totalPipelines: number;
  openIncidents: number;
  totalIncidents: number;
  qualityScore: number;
  growthRate: number;
}

export interface CapsuleDataPoint {
  day: number;
  label: string;
  value1: number;
  value2: number;
  status: 'solid' | 'striped' | 'outline';
  active: boolean;
}

export interface TransactionRecord {
  id: string;
  external_id: string;
  transaction_date: string;
  category: string;
  region: string;
  customer_name: string;
  quantity: number;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  data_origin: 'LIVE' | 'SIMULATED_DEMO' | 'CSV_IMPORT';
  created_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  code: string;
  description: string;
  row_count: number;
  source_type: 'csv' | 'rest_api' | 'mysql' | 'stream';
  quality_score: number;
  is_live: boolean;
  column_count?: number;
  columns?: DatasetColumn[];
  created_at: string;
}

export interface DatasetColumn {
  id: string;
  dataset_id: string;
  name: string;
  display_name: string;
  data_type: 'string' | 'number' | 'date' | 'boolean';
  is_dimension: boolean;
  is_metric: boolean;
  is_nullable: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'rest_api' | 'mysql' | 'kafka_stream';
  status: 'active' | 'not_configured' | 'error' | 'syncing';
  last_sync_at: string;
  created_at: string;
}

export interface PipelineRun {
  id: string;
  pipeline_name: string;
  source_name: string;
  source_type: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  started_at: string;
  finished_at?: string;
  rows_read: number;
  rows_inserted: number;
  rows_rejected: number;
  retry_count: number;
}

export interface DataQualityOverview {
  overallScore: number;
  rulesPassed: number;
  totalRules: number;
  activeIssuesCount: number;
  rules: any[];
  issues: any[];
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  metric_value: number;
  threshold_value: number;
  acknowledged_by_name?: string;
  resolved_by_name?: string;
  created_at: string;
}

export interface AlertRule {
  id: string;
  dataset_name: string;
  title: string;
  metric: string;
  operator: string;
  threshold: number;
  time_window: string;
  severity: 'info' | 'warning' | 'critical';
  is_enabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'pipeline' | 'dataset' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  structuredAnalysis?: {
    summary: string;
    sqlQuery: string;
    chartType: 'bar' | 'line' | 'donut' | 'kpi' | 'table';
    chartData: Array<{ label: string; value: number }>;
    metrics: Record<string, any>;
    suggestions: string[];
  };
  createdAt: string;
}

