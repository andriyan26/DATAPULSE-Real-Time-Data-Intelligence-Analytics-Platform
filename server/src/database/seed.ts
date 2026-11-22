import bcrypt from 'bcryptjs';
import { pool } from './db';

export async function runSeed() {
  console.log('🌱 Seeding DATAPULSE demo data...');
  const conn = await pool.getConnection();

  try {
    // 1. Clear existing demo data to ensure idempotency
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    await conn.query('TRUNCATE TABLE users;');
    await conn.query('TRUNCATE TABLE organizations;');
    await conn.query('TRUNCATE TABLE datasets;');
    await conn.query('TRUNCATE TABLE dataset_columns;');
    await conn.query('TRUNCATE TABLE transactions;');
    await conn.query('TRUNCATE TABLE data_sources;');
    await conn.query('TRUNCATE TABLE pipeline_runs;');
    await conn.query('TRUNCATE TABLE data_quality_rules;');
    await conn.query('TRUNCATE TABLE data_quality_issues;');
    await conn.query('TRUNCATE TABLE alert_rules;');
    await conn.query('TRUNCATE TABLE incidents;');
    await conn.query('TRUNCATE TABLE notifications;');
    await conn.query('TRUNCATE TABLE saved_analyses;');
    await conn.query('TRUNCATE TABLE audit_logs;');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

    const orgId = 'org-datapulse-core';

    // 2. Organization
    await conn.query(
      `INSERT INTO organizations (id, name, slug, plan) VALUES (?, ?, ?, ?)`,
      [orgId, 'PulseCore Intelligence Corp', 'pulsecore', 'enterprise']
    );

    // 3. Users with 4 RBAC Roles (passwords: Admin123!, Analyst123!, Manager123!, Viewer123!)
    const salt = await bcrypt.genSalt(10);
    const users = [
      {
        id: 'usr-admin-01',
        name: 'Alex Mercer',
        email: 'admin@datapulse.io',
        password: await bcrypt.hash('Admin123!', salt),
        role: 'super_admin',
        avatar_color: '#10B981',
        department: 'Executive Administration',
      },
      {
        id: 'usr-analyst-01',
        name: 'Priya Raman',
        email: 'analyst@datapulse.io',
        password: await bcrypt.hash('Analyst123!', salt),
        role: 'data_analyst',
        avatar_color: '#3B82F6',
        department: 'Data Intelligence',
      },
      {
        id: 'usr-manager-01',
        name: 'Maya Novak',
        email: 'manager@datapulse.io',
        password: await bcrypt.hash('Manager123!', salt),
        role: 'manager',
        avatar_color: '#8B5CF6',
        department: 'Global Operations',
      },
      {
        id: 'usr-viewer-01',
        name: 'David Chen',
        email: 'viewer@datapulse.io',
        password: await bcrypt.hash('Viewer123!', salt),
        role: 'viewer',
        avatar_color: '#F59E0B',
        department: 'Financial Strategy',
      },
    ];

    for (const u of users) {
      await conn.query(
        `INSERT INTO users (id, organization_id, name, email, password_hash, role, avatar_color, department)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, orgId, u.name, u.email, u.password, u.role, u.avatar_color, u.department]
      );
    }

    // 4. Primary Datasets
    const dataset1Id = 'ds-global-tx';
    const dataset2Id = 'ds-cloud-telemetry';
    const dataset3Id = 'ds-customer-churn';

    await conn.query(
      `INSERT INTO datasets (id, organization_id, name, code, description, row_count, source_type, quality_score, is_live, created_by)
       VALUES 
       (?, ?, 'Global Enterprise Transactions', 'global_tx_stream', 'Live B2B transaction telemetry across regions and categories', 150, 'stream', 98.40, 1, 'usr-admin-01'),
       (?, ?, 'Cloud Infrastructure Telemetry', 'cloud_telemetry', 'Server cluster health, memory metrics, and IOPS streams', 84, 'mysql', 99.10, 1, 'usr-analyst-01'),
       (?, ?, 'Customer Behavioral Signals', 'customer_churn', 'User engagement, feature utilization, and retention indicators', 45, 'csv', 96.20, 1, 'usr-analyst-01')`,
      [dataset1Id, orgId, dataset2Id, orgId, dataset3Id, orgId]
    );

    // 5. Dataset Columns for Global Enterprise Transactions
    const columns = [
      { id: 'col-1', name: 'external_id', display: 'Transaction Code', type: 'string', dim: true, metric: false },
      { id: 'col-2', name: 'transaction_date', display: 'Date', type: 'date', dim: true, metric: false },
      { id: 'col-3', name: 'category', display: 'Category', type: 'string', dim: true, metric: false },
      { id: 'col-4', name: 'region', display: 'Region', type: 'string', dim: true, metric: false },
      { id: 'col-5', name: 'customer_name', display: 'Client / Account', type: 'string', dim: true, metric: false },
      { id: 'col-6', name: 'quantity', display: 'Licenses / Units', type: 'number', dim: false, metric: true },
      { id: 'col-7', name: 'amount', display: 'Revenue Amount ($)', type: 'number', dim: false, metric: true },
      { id: 'col-8', name: 'status', display: 'Settlement Status', type: 'string', dim: true, metric: false },
    ];

    for (const c of columns) {
      await conn.query(
        `INSERT INTO dataset_columns (id, dataset_id, name, display_name, data_type, is_dimension, is_metric)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [c.id, dataset1Id, c.name, c.display, c.type, c.dim, c.metric]
      );
    }

    // 6. Generate 150 Realistic Transactions (covering recent 30-60 days)
    const categories = ['Enterprise Cloud', 'Hardware Edge', 'API Subscriptions', 'Consulting Services', 'Security Suite'];
    const regions = ['Asia Pacific', 'North America', 'Europe EMEA', 'Latin America'];
    const statuses = ['completed', 'completed', 'completed', 'completed', 'pending', 'processing', 'failed'];
    const clientNames = [
      'Halcyon Labs', 'Apex Dynamics', 'Acme FinTech', 'Vertex Global', 'Stellar Systems',
      'Nordic AI', 'OmniCorp Global', 'Beacon Tech', 'Solstice Media', 'Quantico Analytics',
      'Aether Cloud', 'Zenith Health', 'Boreal Networks', 'Cascade Data', 'Vanguard Logic'
    ];

    const today = new Date();
    for (let i = 1; i <= 150; i++) {
      const daysAgo = Math.floor(Math.random() * 45);
      const txDate = new Date(today);
      txDate.setDate(txDate.getDate() - daysAgo);
      const dateStr = txDate.toISOString().slice(0, 10);

      const category = categories[i % categories.length];
      const region = regions[i % regions.length];
      const status = statuses[i % statuses.length];
      const client = clientNames[i % clientNames.length];
      const quantity = Math.floor(Math.random() * 25) + 1;
      const baseAmount = (category === 'Enterprise Cloud' ? 12000 : category === 'Security Suite' ? 8500 : 4200);
      const amount = (baseAmount + (i * 137) % 7500) + (Math.random() * 50);

      await conn.query(
        `INSERT INTO transactions (id, organization_id, dataset_id, external_id, transaction_date, category, region, customer_name, quantity, amount, status, data_origin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SIMULATED_DEMO')`,
        [
          `tx-${String(i).padStart(4, '0')}`,
          orgId,
          dataset1Id,
          `TX-2026-${String(9000 + i)}`,
          dateStr,
          category,
          region,
          client,
          quantity,
          amount.toFixed(2),
          status,
        ]
      );
    }

    // 7. Data Sources
    await conn.query(
      `INSERT INTO data_sources (id, organization_id, name, type, connection_config, status, last_sync_at)
       VALUES
       ('src-1', ?, 'Stripe Billing Webhook Stream', 'rest_api', '{"endpoint":"https://api.stripe.com/v1/events","auth":"bearer_token"}', 'active', NOW()),
       ('src-2', ?, 'AWS Aurora Production Replica', 'mysql', '{"host":"aurora-prod.internal","port":3306,"database":"billing"}', 'active', NOW()),
       ('src-3', ?, 'Daily Revenue Settlement CSV', 'csv', '{"bucket":"s3://datapulse-daily-csv","format":"csv"}', 'active', NOW()),
       ('src-4', ?, 'Kafka Enterprise Event Bus', 'kafka_stream', '{"broker":"kafka.internal:9092","topic":"transactions"}', 'syncing', NOW())`,
      [orgId, orgId, orgId, orgId]
    );

    // 8. Pipeline Runs
    await conn.query(
      `INSERT INTO pipeline_runs (id, organization_id, source_id, pipeline_name, status, started_at, finished_at, rows_read, rows_inserted, rows_rejected, retry_count)
       VALUES
       ('pipe-1', ?, 'src-1', 'Payment Settlement Sync', 'completed', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NOW(), 3532, 3530, 2, 0),
       ('pipe-2', ?, 'src-2', 'Aurora Telemetry Mirror', 'running', DATE_SUB(NOW(), INTERVAL 4 MINUTE), NULL, 1200, 1198, 2, 0),
       ('pipe-3', ?, 'src-3', 'Batch CSV Ingestion #402', 'completed', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 115 MINUTE), 850, 845, 5, 1),
       ('pipe-4', ?, 'src-4', 'Kafka Event Stream Listener', 'running', DATE_SUB(NOW(), INTERVAL 12 HOUR), NULL, 48200, 48195, 5, 0)`,
      [orgId, orgId, orgId, orgId]
    );

    // 9. Data Quality Rules & Issues
    await conn.query(
      `INSERT INTO data_quality_rules (id, dataset_id, name, rule_type, target_column, threshold, severity)
       VALUES
       ('dqr-1', ?, 'Mandatory Transaction Code Null Check', 'null_check', 'external_id', 0.00, 'critical'),
       ('dqr-2', ?, 'Unique Transaction Code Duplicate Check', 'duplicate_check', 'external_id', 0.00, 'high'),
       ('dqr-3', ?, 'Positive Transaction Amount Range Check', 'range_check', 'amount', 0.00, 'critical'),
       ('dqr-4', ?, 'Valid ISO Date Format Check', 'format_check', 'transaction_date', 0.00, 'medium')`,
      [dataset1Id, dataset1Id, dataset1Id, dataset1Id]
    );

    await conn.query(
      `INSERT INTO data_quality_issues (id, dataset_id, rule_id, issue_title, description, affected_rows, severity, status)
       VALUES
       ('dqi-1', ?, 'dqr-2', 'Duplicate Transaction External ID in Batch #402', 'Detected 2 records sharing external ID TX-2026-9042 during batch sync', 2, 'high', 'investigating'),
       ('dqi-2', ?, 'dqr-3', 'Minor Decimal Precision Variance in Currency Conversion', 'Exchange rate rounding caused a 1-cent variance in 3 European records', 3, 'low', 'detected')`,
      [dataset1Id, dataset1Id]
    );

    // 10. Alert Rules & Incidents
    await conn.query(
      `INSERT INTO alert_rules (id, organization_id, dataset_id, title, metric, operator, threshold, time_window, severity)
       VALUES
       ('ar-1', ?, ?, 'EMEA Region Failure Surge > 5%', 'failed_rate', '>', 5.00, '1h', 'critical'),
       ('ar-2', ?, ?, 'Dataset Ingestion Freshness SLA > 30m', 'freshness_lag', '>', 30.00, '30m', 'warning'),
       ('ar-3', ?, ?, 'Transaction Volume Drop Below Baseline', 'volume_drop', '>', 25.00, '2h', 'critical')`,
      [orgId, dataset1Id, orgId, dataset1Id, orgId, dataset1Id]
    );

    await conn.query(
      `INSERT INTO incidents (id, organization_id, alert_rule_id, title, description, severity, status, metric_value, threshold_value)
       VALUES
       ('inc-1', ?, 'ar-1', 'Check-in with Halcyon Labs: Abnormal Error Surge in EMEA Region', 'Failed transaction spike reached 7.4% on Halcyon Labs API gateway', 'critical', 'OPEN', 7.40, 5.00),
       ('inc-2', ?, 'ar-2', 'Ingestion Delay in US-East Data Replica', 'Sync latency crossed 34 minutes due to network jitter on external database', 'warning', 'ACKNOWLEDGED', 34.00, 30.00),
       ('inc-3', ?, 'ar-3', 'Transient Latency Spike in Payment Gateway', 'Latency normalized after gateway reboot, resolved automatically', 'info', 'RESOLVED', 28.00, 25.00)`,
      [orgId, orgId, orgId]
    );

    // 11. In-App Notifications
    await conn.query(
      `INSERT INTO notifications (id, organization_id, title, message, type, is_read)
       VALUES
       ('nt-1', ?, 'Critical Incident Detected', 'Check-in with Halcyon Labs: Abnormal Error Surge in EMEA Region has triggered.', 'alert', 0),
       ('nt-2', ?, 'Pipeline Completed Successfully', 'Payment Settlement Sync finished processing 3,532 records with 0 fatal errors.', 'pipeline', 0),
       ('nt-3', ?, 'Data Quality Score Updated', 'Global Enterprise Transactions quality score evaluated at 98.4%.', 'dataset', 1)`,
      [orgId, orgId, orgId]
    );

    // 12. Saved Analyses
    await conn.query(
      `INSERT INTO saved_analyses (id, organization_id, created_by, title, dataset_id, chart_type, dimension, metric, aggregation, filters)
       VALUES
       ('sa-1', ?, 'usr-analyst-01', 'Monthly Revenue by Category', ?, 'bar', 'category', 'amount', 'SUM', '{"status":"completed"}'),
       ('sa-2', ?, 'usr-analyst-01', 'Regional Performance Breakdown', ?, 'donut', 'region', 'amount', 'SUM', '{}'),
       ('sa-3', ?, 'usr-analyst-01', 'Daily Transaction Volume Trend', ?, 'line', 'transaction_date', 'quantity', 'SUM', '{}')`,
      [orgId, dataset1Id, orgId, dataset1Id, orgId, dataset1Id]
    );

    // 13. Audit Logs
    await conn.query(
      `INSERT INTO audit_logs (id, organization_id, user_id, user_email, action, entity_type, entity_id, details)
       VALUES
       ('aud-1', ?, 'usr-admin-01', 'admin@datapulse.io', 'SYSTEM_INIT', 'system', 'system', '{"message":"DATAPULSE platform initialized with enterprise schema"}'),
       ('aud-2', ?, 'usr-analyst-01', 'analyst@datapulse.io', 'DATASET_CONNECT', 'datasets', ?, '{"name":"Global Enterprise Transactions","source":"stream"}'),
       ('aud-3', ?, 'usr-manager-01', 'manager@datapulse.io', 'ALERT_ACKNOWLEDGE', 'incidents', 'inc-2', '{"status":"ACKNOWLEDGED"}')`,
      [orgId, orgId, dataset1Id, orgId]
    );

    console.log('✅ DATAPULSE demo data seeded successfully!');
    console.log('🔑 Demo Login Accounts:');
    console.log('   Super Admin:  admin@datapulse.io   / Admin123!');
    console.log('   Data Analyst: analyst@datapulse.io / Analyst123!');
    console.log('   Manager:      manager@datapulse.io / Manager123!');
    console.log('   Viewer:       viewer@datapulse.io  / Viewer123!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

runSeed()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });

