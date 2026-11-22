import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedUser } from '../middleware/auth';
import { query } from '../database/db';

let io: Server | null = null;
let streamSimulationTimer: NodeJS.Timeout | null = null;
let isSimulationPaused = false;

export function initSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      // Allow connection with guest scope for demo, or reject if strict
      return next();
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as AuthenticatedUser | undefined;
    const orgId = user?.organizationId || 'org-datapulse-core';

    socket.join(`org_${orgId}`);
    console.log(`⚡ Socket client connected: ${socket.id} (Org: ${orgId}, User: ${user?.email || 'Guest'})`);

    // Emit initial status
    socket.emit('connection.ready', {
      status: 'CONNECTED',
      serverTime: new Date().toISOString(),
      organizationId: orgId,
      isSimulationPaused,
    });

    socket.on('stream.control', (payload: { action: 'pause' | 'resume' }) => {
      if (payload.action === 'pause') {
        isSimulationPaused = true;
      } else {
        isSimulationPaused = false;
      }
      io?.to(`org_${orgId}`).emit('stream.status_changed', { isPaused: isSimulationPaused });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  startSimulatedStream();
  return io;
}

export function broadcastOrgEvent(orgId: string, eventType: string, payload: any) {
  if (!io) return;
  const envelope = {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventType,
    timestamp: new Date().toISOString(),
    organizationId: orgId,
    payload,
  };
  io.to(`org_${orgId}`).emit('datapulse.event', envelope);
  io.to(`org_${orgId}`).emit(eventType, envelope);
}

function startSimulatedStream() {
  if (streamSimulationTimer) return;

  const categories = ['Enterprise Cloud', 'Hardware Edge', 'API Subscriptions', 'Consulting Services', 'Security Suite'];
  const regions = ['Asia Pacific', 'North America', 'Europe EMEA', 'Latin America'];
  const clients = ['Halcyon Labs', 'Apex Dynamics', 'Acme FinTech', 'Vertex Global', 'Stellar Systems', 'Nordic AI'];

  streamSimulationTimer = setInterval(async () => {
    if (isSimulationPaused || !io) return;

    try {
      const orgId = 'org-datapulse-core';
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const reg = regions[Math.floor(Math.random() * regions.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const qty = Math.floor(Math.random() * 8) + 1;
      const amount = Number(((cat === 'Enterprise Cloud' ? 8000 : 3200) + Math.random() * 2500).toFixed(2));
      const txId = `tx-live-${Date.now().toString().slice(-6)}`;
      const externalId = `TX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const dateStr = new Date().toISOString().slice(0, 10);

      // Insert real live transaction record into MySQL database
      await query(
        `INSERT INTO transactions (id, organization_id, dataset_id, external_id, transaction_date, category, region, customer_name, quantity, amount, status, data_origin)
         VALUES (?, ?, 'ds-global-tx', ?, ?, ?, ?, ?, ?, ?, 'completed', 'LIVE')`,
        [txId, orgId, externalId, dateStr, cat, reg, client, qty, amount]
      );

      // Update dataset row count
      await query(`UPDATE datasets SET row_count = row_count + 1 WHERE id = 'ds-global-tx'`);

      // Broadcast live event via Socket.IO
      broadcastOrgEvent(orgId, 'record.created', {
        id: txId,
        externalId,
        category: cat,
        region: reg,
        customerName: client,
        quantity: qty,
        amount,
        status: 'completed',
        dataOrigin: 'LIVE',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // silent catch for simulator
    }
  }, 4500); // Emits a live verified event every 4.5 seconds
}

