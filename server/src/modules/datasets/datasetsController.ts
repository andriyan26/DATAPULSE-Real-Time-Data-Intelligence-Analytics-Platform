import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';
import { logAudit } from '../../utils/auditLogger';
import { broadcastOrgEvent } from '../../sockets/socketServer';

export async function getDatasets(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';

  const datasets = await query<any>(
    `SELECT d.*, 
            (SELECT COUNT(*) FROM dataset_columns WHERE dataset_id = d.id) as column_count
     FROM datasets d
     WHERE d.organization_id = ?
     ORDER BY d.created_at DESC`,
    [orgId]
  );

  res.json({ success: true, data: datasets });
}

export async function getDatasetDetails(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const { id } = req.params;

  const datasets = await query<any>(
    `SELECT * FROM datasets WHERE id = ? AND organization_id = ? LIMIT 1`,
    [id, orgId]
  );

  if (datasets.length === 0) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dataset not found.' } });
  }

  const columns = await query<any>(
    `SELECT * FROM dataset_columns WHERE dataset_id = ? ORDER BY is_dimension DESC, is_metric DESC`,
    [id]
  );

  res.json({ success: true, data: { ...datasets[0], columns } });
}

export async function getDatasetRecords(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const { id } = req.params;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  const search = (req.query.search as string || '').trim();
  const category = (req.query.category as string || '').trim();
  const status = (req.query.status as string || '').trim();
  const offset = (page - 1) * limit;

  const conditions = ['organization_id = ?', 'dataset_id = ?'];
  const params: any[] = [orgId, id];

  if (search) {
    conditions.push('(customer_name LIKE ? OR external_id LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const whereSql = `WHERE ${conditions.join(' AND ')}`;

  const [countRes] = await query<any>(`SELECT COUNT(*) as total FROM transactions ${whereSql}`, params);
  const total = Number(countRes?.total || 0);

  const records = await query<any>(
    `SELECT * FROM transactions ${whereSql} ORDER BY transaction_date DESC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

export async function importDatasetCSV(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const userId = req.user?.id || 'usr-analyst-01';

  // Support JSON payload with parsed rows or raw CSV string
  const { datasetId = 'ds-global-tx', fileName = 'imported_records.csv', rows = [], duplicateStrategy = 'skip' } = req.body;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_DATA', message: 'No records provided for ingestion.' },
    });
  }

  const jobId = `job-${Date.now()}`;
  let processed = 0;
  let valid = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    processed++;
    const externalId = row.external_id || row.externalId || `TX-${Date.now()}-${processed}`;
    const amount = parseFloat(row.amount);

    if (isNaN(amount) || amount <= 0) {
      failed++;
      errors.push(`Row ${processed}: Invalid numeric amount "${row.amount}"`);
      continue;
    }

    try {
      const existing = await query<any>('SELECT id FROM transactions WHERE external_id = ? AND organization_id = ?', [externalId, orgId]);
      if (existing.length > 0) {
        if (duplicateStrategy === 'skip') {
          continue;
        } else if (duplicateStrategy === 'error') {
          failed++;
          errors.push(`Row ${processed}: Duplicate external_id "${externalId}" rejected.`);
          continue;
        }
      }

      const txId = `tx-imp-${Date.now()}-${processed}`;
      const dateStr = row.transaction_date || row.transactionDate || new Date().toISOString().slice(0, 10);
      const category = row.category || 'Enterprise Cloud';
      const region = row.region || 'North America';
      const client = row.customer_name || row.customerName || 'Inbound Partner';
      const quantity = parseInt(row.quantity, 10) || 1;
      const status = row.status || 'completed';

      await query(
        `INSERT INTO transactions (id, organization_id, dataset_id, external_id, transaction_date, category, region, customer_name, quantity, amount, status, data_origin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CSV_IMPORT')
         ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = VALUES(status), updated_at = NOW()`,
        [txId, orgId, datasetId, externalId, dateStr, category, region, client, quantity, amount, status]
      );
      valid++;
    } catch (err: any) {
      failed++;
      errors.push(`Row ${processed}: ${err.message}`);
    }
  }

  // Update dataset row count
  await query(`UPDATE datasets SET row_count = row_count + ? WHERE id = ?`, [valid, datasetId]);

  // Insert import job record
  await query(
    `INSERT INTO import_jobs (id, organization_id, dataset_id, file_name, status, total_rows, processed_rows, valid_rows, failed_rows, duplicate_strategy, error_summary)
     VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?)`,
    [jobId, orgId, datasetId, fileName, rows.length, processed, valid, failed, duplicateStrategy, JSON.stringify(errors.slice(0, 5))]
  );

  // Broadcast real-time event
  broadcastOrgEvent(orgId, 'dataset.imported', {
    jobId,
    datasetId,
    fileName,
    validRows: valid,
    failedRows: failed,
    timestamp: new Date().toISOString(),
  });

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'DATASET_CSV_IMPORT',
    entityType: 'datasets',
    entityId: datasetId,
    details: { fileName, validRows: valid, failedRows: failed },
  });

  res.json({
    success: true,
    data: {
      jobId,
      totalRows: rows.length,
      validRows: valid,
      failedRows: failed,
      errors: errors.slice(0, 10),
    },
  });
}

