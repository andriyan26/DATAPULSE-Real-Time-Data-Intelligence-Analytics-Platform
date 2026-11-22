import { pool } from './db';

export async function runMigrations() {
  console.log('🔄 Running DATAPULSE Database Migrations...');
  const conn = await pool.getConnection();

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        plan VARCHAR(50) DEFAULT 'enterprise',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'data_analyst', 'manager', 'viewer') NOT NULL DEFAULT 'viewer',
        avatar_color VARCHAR(30) DEFAULT '#10B981',
        department VARCHAR(100) DEFAULT 'Analytics',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_org (organization_id),
        INDEX idx_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS datasets (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) NOT NULL,
        description TEXT,
        row_count INT DEFAULT 0,
        source_type ENUM('csv', 'rest_api', 'mysql', 'stream') DEFAULT 'csv',
        quality_score DECIMAL(5,2) DEFAULT 100.00,
        is_live BOOLEAN DEFAULT TRUE,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_dataset_org (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS dataset_columns (
        id VARCHAR(36) PRIMARY KEY,
        dataset_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        display_name VARCHAR(150) NOT NULL,
        data_type ENUM('string', 'number', 'date', 'boolean') NOT NULL,
        is_dimension BOOLEAN DEFAULT TRUE,
        is_metric BOOLEAN DEFAULT FALSE,
        is_nullable BOOLEAN DEFAULT TRUE,
        sample_values TEXT,
        INDEX idx_col_dataset (dataset_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        dataset_id VARCHAR(36) NOT NULL,
        external_id VARCHAR(100) NOT NULL,
        transaction_date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        amount DECIMAL(15,2) NOT NULL,
        status ENUM('completed', 'pending', 'processing', 'failed') NOT NULL DEFAULT 'completed',
        data_origin ENUM('LIVE', 'SIMULATED_DEMO', 'CSV_IMPORT') NOT NULL DEFAULT 'SIMULATED_DEMO',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tx_org (organization_id),
        INDEX idx_tx_dataset (dataset_id),
        INDEX idx_tx_date (transaction_date),
        INDEX idx_tx_cat (category),
        INDEX idx_tx_region (region),
        INDEX idx_tx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS data_sources (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type ENUM('csv', 'rest_api', 'mysql', 'kafka_stream') NOT NULL,
        connection_config JSON,
        status ENUM('active', 'not_configured', 'error', 'syncing') DEFAULT 'not_configured',
        last_sync_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_source_org (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS pipeline_runs (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        source_id VARCHAR(36) NOT NULL,
        pipeline_name VARCHAR(255) NOT NULL,
        status ENUM('running', 'completed', 'failed', 'queued') DEFAULT 'queued',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP NULL,
        rows_read INT DEFAULT 0,
        rows_inserted INT DEFAULT 0,
        rows_rejected INT DEFAULT 0,
        error_log TEXT,
        retry_count INT DEFAULT 0,
        INDEX idx_pipe_org (organization_id),
        INDEX idx_pipe_source (source_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS import_jobs (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        dataset_id VARCHAR(36) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        total_rows INT DEFAULT 0,
        processed_rows INT DEFAULT 0,
        valid_rows INT DEFAULT 0,
        failed_rows INT DEFAULT 0,
        duplicate_strategy ENUM('skip', 'overwrite', 'error') DEFAULT 'skip',
        error_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_import_dataset (dataset_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS data_quality_rules (
        id VARCHAR(36) PRIMARY KEY,
        dataset_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        rule_type ENUM('null_check', 'duplicate_check', 'range_check', 'format_check', 'freshness_check') NOT NULL,
        target_column VARCHAR(100),
        threshold DECIMAL(5,2) DEFAULT 0,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        is_enabled BOOLEAN DEFAULT TRUE,
        INDEX idx_dq_dataset (dataset_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS data_quality_issues (
        id VARCHAR(36) PRIMARY KEY,
        dataset_id VARCHAR(36) NOT NULL,
        rule_id VARCHAR(36),
        issue_title VARCHAR(255) NOT NULL,
        description TEXT,
        affected_rows INT DEFAULT 0,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('detected', 'investigating', 'resolved') DEFAULT 'detected',
        first_detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dqi_dataset (dataset_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS alert_rules (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        dataset_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        metric VARCHAR(100) NOT NULL,
        operator ENUM('>', '<', '>=', '<=', '=', '!=') NOT NULL,
        threshold DECIMAL(15,2) NOT NULL,
        time_window VARCHAR(50) DEFAULT '1h',
        severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
        cooldown_minutes INT DEFAULT 30,
        is_enabled BOOLEAN DEFAULT TRUE,
        last_triggered_at TIMESTAMP NULL,
        INDEX idx_alert_org (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        alert_rule_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity ENUM('info', 'warning', 'critical') NOT NULL,
        status ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'OPEN',
        metric_value DECIMAL(15,2),
        threshold_value DECIMAL(15,2),
        acknowledged_by VARCHAR(36) NULL,
        acknowledged_at TIMESTAMP NULL,
        resolved_by VARCHAR(36) NULL,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_inc_org (organization_id),
        INDEX idx_inc_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('alert', 'pipeline', 'dataset', 'system') DEFAULT 'alert',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_org (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS saved_analyses (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        created_by VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        dataset_id VARCHAR(36) NOT NULL,
        chart_type ENUM('line', 'bar', 'stacked_bar', 'area', 'donut', 'scatter', 'kpi', 'table') DEFAULT 'bar',
        dimension VARCHAR(100) NOT NULL,
        metric VARCHAR(100) NOT NULL,
        aggregation ENUM('COUNT', 'SUM', 'AVG', 'MIN', 'MAX') DEFAULT 'SUM',
        filters JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_saved_org (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ai_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        sender ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        structured_analysis JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_aim_conv (conversation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NULL,
        user_email VARCHAR(255) NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100) NULL,
        ip_address VARCHAR(50) DEFAULT '127.0.0.1',
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_org (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS event_outbox (
        id VARCHAR(36) PRIMARY KEY,
        organization_id VARCHAR(36) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        payload JSON NOT NULL,
        is_published BOOLEAN DEFAULT FALSE,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_outbox_pub (is_published)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ All 18 DATAPULSE database tables migrated successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

runMigrations()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });
