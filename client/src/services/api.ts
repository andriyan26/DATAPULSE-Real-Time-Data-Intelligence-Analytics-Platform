const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('datapulse_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('datapulse_token', token);
  } else {
    localStorage.removeItem('datapulse_token');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken(null);
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Server request failed');
  }

  return data.data;
}

export const api = {
  // Auth
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardOverview: () => request('/dashboard/overview'),

  // Analytics
  executeAnalyticsQuery: (params: any) => request('/analytics/query', { method: 'POST', body: JSON.stringify(params) }),
  getDrillDown: (dimension: string, value: string) => request(`/analytics/drilldown?dimension=${encodeURIComponent(dimension)}&value=${encodeURIComponent(value)}`),
  getSavedAnalyses: () => request('/analytics/saved'),
  saveAnalysis: (payload: any) => request('/analytics/saved', { method: 'POST', body: JSON.stringify(payload) }),

  // Datasets
  getDatasets: () => request('/datasets'),
  getDatasetDetails: (id: string) => request(`/datasets/${id}`),
  getDatasetRecords: (id: string, params: string = '') => request(`/datasets/${id}/records?${params}`),
  importCSV: (payload: any) => request('/datasets/import', { method: 'POST', body: JSON.stringify(payload) }),

  // Pipelines
  getDataSources: () => request('/pipelines/sources'),
  getPipelineRuns: () => request('/pipelines/runs'),
  retryPipeline: (id: string) => request(`/pipelines/${id}/retry`, { method: 'POST' }),
  triggerPipeline: (payload: any) => request('/pipelines/trigger', { method: 'POST', body: JSON.stringify(payload) }),

  // Data Quality
  getDataQuality: () => request('/data-quality'),
  updateQualityIssue: (id: string, status: string) => request(`/data-quality/issues/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Alerts
  getAlertRules: () => request('/alerts/rules'),
  createAlertRule: (payload: any) => request('/alerts/rules', { method: 'POST', body: JSON.stringify(payload) }),
  getIncidents: () => request('/alerts/incidents'),
  updateIncident: (id: string, status: string) => request(`/alerts/incidents/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getNotifications: () => request('/alerts/notifications'),
  markNotificationRead: (id: string) => request(`/alerts/notifications/${id}/read`, { method: 'PATCH' }),

  // AI Analyst
  chatAI: (message: string, conversationId?: string) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message, conversationId }) }),
  getConversations: () => request('/ai/conversations'),
  getConversationMessages: (id: string) => request(`/ai/conversations/${id}`),

  // Reports
  getReports: () => request('/reports'),
  exportCSV: async (payload: any) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/reports/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('CSV export failed');
    return res.blob();
  },

  // Audit
  getAuditLogs: (params: string = '') => request(`/audit-logs?${params}`),

  // Settings
  getWorkspaceSettings: () => request('/settings/workspace'),
  updateProfile: (payload: any) => request('/settings/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  updateUserRole: (id: string, role: string) => request(`/settings/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
};

