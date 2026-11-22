import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';

const ALLOWED_DIMENSIONS = ['category', 'region', 'status', 'transaction_date', 'customer_name'] as const;
const ALLOWED_METRICS = ['amount', 'quantity', 'id'] as const;
const ALLOWED_AGGREGATIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'] as const;

const querySchema = z.object({
  datasetId: z.string().default('ds-global-tx'),
  dimension: z.enum(ALLOWED_DIMENSIONS).default('category'),
  metric: z.enum(ALLOWED_METRICS).default('amount'),
  aggregation: z.enum(ALLOWED_AGGREGATIONS).default('SUM'),
  chartType: z.enum(['line', 'bar', 'stacked_bar', 'area', 'donut', 'scatter', 'kpi', 'table']).default('bar'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  filters: z.record(z.any()).optional().default({}),
  sortBy: z.enum(['dimension', 'value']).default('value'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(500).default(50),
});

export async function executeAnalyticsQuery(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const params = querySchema.parse(req.body);

  // Validate aggregation with metric type
  if ((params.aggregation === 'SUM' || params.aggregation === 'AVG') && params.metric === 'id') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_AGGREGATION', message: `Cannot apply ${params.aggregation} on non-numeric identifier.` },
    });
  }

  const whereConditions: string[] = ['organization_id = ?'];
  const queryParams: any[] = [orgId];

  if (params.startDate) {
    whereConditions.push('transaction_date >= ?');
    queryParams.push(params.startDate);
  }
  if (params.endDate) {
    whereConditions.push('transaction_date <= ?');
    queryParams.push(params.endDate);
  }

  // Allowlisted filter conditions
  if (params.filters) {
    if (params.filters.category) {
      whereConditions.push('category = ?');
      queryParams.push(params.filters.category);
    }
    if (params.filters.region) {
      whereConditions.push('region = ?');
      queryParams.push(params.filters.region);
    }
    if (params.filters.status) {
      whereConditions.push('status = ?');
      queryParams.push(params.filters.status);
    }
  }

  const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const orderCol = params.sortBy === 'dimension' ? params.dimension : 'aggregated_value';
  const orderDirection = params.sortOrder.toUpperCase();

  const sql = `
    SELECT ${params.dimension} AS dimension_key,
           ${params.aggregation}(${params.metric}) AS aggregated_value,
           COUNT(*) AS record_count
    FROM transactions
    ${whereSql}
    GROUP BY ${params.dimension}
    ORDER BY ${orderCol} ${orderDirection}
    LIMIT ?
  `;

  queryParams.push(params.limit);

  const startTime = Date.now();
  const rows = await query<any>(sql, queryParams);
  const executionTimeMs = Date.now() - startTime;

  // Compute total and summary
  const totalValue = rows.reduce((acc, r) => acc + Number(r.aggregated_value || 0), 0);
  const totalRecords = rows.reduce((acc, r) => acc + Number(r.record_count || 0), 0);

  res.json({
    success: true,
    data: {
      results: rows.map((r) => ({
        dimension: r.dimension_key,
        value: Number(r.aggregated_value || 0),
        count: Number(r.record_count || 0),
      })),
      summary: {
        totalValue,
        totalRecords,
        groupCount: rows.length,
        executionTimeMs,
      },
      meta: {
        dimension: params.dimension,
        metric: params.metric,
        aggregation: params.aggregation,
        chartType: params.chartType,
      },
    },
  });
}

export async function drillDownRecords(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const { dimension, value, limit = 50 } = req.query;

  if (!dimension || typeof dimension !== 'string' || !ALLOWED_DIMENSIONS.includes(dimension as any)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_DIMENSION', message: 'Invalid drill-down dimension.' } });
  }

  const records = await query<any>(
    `SELECT id, external_id, transaction_date, category, region, customer_name, quantity, amount, status, data_origin, created_at
     FROM transactions
     WHERE organization_id = ? AND ?? = ?
     ORDER BY transaction_date DESC
     LIMIT ?`,
    [orgId, dimension, value, Number(limit)]
  );

  res.json({
    success: true,
    data: {
      dimension,
      filterValue: value,
      totalCount: records.length,
      records,
    },
  });
}

export async function getSavedAnalyses(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const analyses = await query<any>(
    `SELECT id, title, dataset_id, chart_type, dimension, metric, aggregation, filters, created_at
     FROM saved_analyses
     WHERE organization_id = ?
     ORDER BY created_at DESC`,
    [orgId]
  );

  res.json({ success: true, data: analyses });
}

export async function saveAnalysis(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const userId = req.user?.id || 'usr-analyst-01';

  const schema = z.object({
    title: z.string().min(3),
    datasetId: z.string().default('ds-global-tx'),
    chartType: z.enum(['line', 'bar', 'stacked_bar', 'area', 'donut', 'scatter', 'kpi', 'table']).default('bar'),
    dimension: z.enum(ALLOWED_DIMENSIONS),
    metric: z.enum(ALLOWED_METRICS),
    aggregation: z.enum(ALLOWED_AGGREGATIONS),
    filters: z.record(z.any()).optional().default({}),
  });

  const body = schema.parse(req.body);
  const id = `sa-${Date.now()}`;

  await query(
    `INSERT INTO saved_analyses (id, organization_id, created_by, title, dataset_id, chart_type, dimension, metric, aggregation, filters)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, orgId, userId, body.title, body.datasetId, body.chartType, body.dimension, body.metric, body.aggregation, JSON.stringify(body.filters)]
  );

  res.status(201).json({ success: true, data: { id, ...body } });
}

