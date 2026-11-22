import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middleware/errorHandler';
import { pool } from './database/db';

import authRoutes from './modules/auth/authRoutes';
import dashboardRoutes from './modules/dashboard/dashboardRoutes';
import analyticsRoutes from './modules/analytics/analyticsRoutes';
import datasetsRoutes from './modules/datasets/datasetsRoutes';
import pipelinesRoutes from './modules/pipelines/pipelinesRoutes';
import dataQualityRoutes from './modules/data-quality/dataQualityRoutes';
import alertsRoutes from './modules/alerts/alertsRoutes';
import aiRoutes from './modules/ai/aiRoutes';
import reportsRoutes from './modules/reports/reportsRoutes';
import auditRoutes from './modules/audit/auditRoutes';
import settingsRoutes from './modules/settings/settingsRoutes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Health check endpoint
  app.get('/api/v1/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({
        status: 'UP',
        service: 'DATAPULSE Real-Time Data Intelligence & Analytics API',
        timestamp: new Date().toISOString(),
        database: 'CONNECTED',
        uptime: process.uptime(),
      });
    } catch (err: any) {
      res.status(503).json({
        status: 'DOWN',
        service: 'DATAPULSE API',
        error: err.message,
      });
    }
  });

  // REST API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/datasets', datasetsRoutes);
  app.use('/api/v1/pipelines', pipelinesRoutes);
  app.use('/api/v1/data-quality', dataQualityRoutes);
  app.use('/api/v1/alerts', alertsRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/reports', reportsRoutes);
  app.use('/api/v1/audit-logs', auditRoutes);
  app.use('/api/v1/settings', settingsRoutes);

  // Serve Frontend Static Assets if built
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
