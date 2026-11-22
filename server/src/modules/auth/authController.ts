import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../../database/db';
import { config } from '../../config';
import { AuthRequest } from '../../middleware/auth';
import { logAudit } from '../../utils/auditLogger';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['super_admin', 'data_analyst', 'manager', 'viewer']).optional().default('viewer'),
  department: z.string().optional().default('Operations'),
});

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const users = await query<any>(
    `SELECT u.id, u.organization_id, u.name, u.email, u.password_hash, u.role, u.avatar_color, u.department, u.is_active,
            o.name as organization_name, o.slug as organization_slug, o.plan as organization_plan
     FROM users u
     JOIN organizations o ON u.organization_id = o.id
     WHERE u.email = ? LIMIT 1`,
    [email]
  );

  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  const user = users[0];
  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      error: { code: 'ACCOUNT_DISABLED', message: 'Your user account has been deactivated.' },
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  const tokenPayload = {
    id: user.id,
    organizationId: user.organization_id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarColor: user.avatar_color,
    department: user.department,
  };

  const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '7d' });

  await logAudit({
    organizationId: user.organization_id,
    userId: user.id,
    userEmail: user.email,
    action: 'USER_LOGIN',
    entityType: 'users',
    entityId: user.id,
    ipAddress: req.ip,
    details: { userAgent: req.headers['user-agent'] },
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatar_color,
        department: user.department,
        organization: {
          id: user.organization_id,
          name: user.organization_name,
          slug: user.organization_slug,
          plan: user.organization_plan,
        },
      },
    },
  });
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const existing = await query<any>('SELECT id FROM users WHERE email = ? LIMIT 1', [data.email]);
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists.' },
    });
  }

  const orgId = 'org-datapulse-core';
  const userId = `usr-${Date.now()}`;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);
  const avatarColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];
  const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  await query(
    `INSERT INTO users (id, organization_id, name, email, password_hash, role, avatar_color, department)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, orgId, data.name, data.email, passwordHash, data.role, avatarColor, data.department]
  );

  const token = jwt.sign(
    {
      id: userId,
      organizationId: orgId,
      name: data.name,
      email: data.email,
      role: data.role,
      avatarColor,
      department: data.department,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: userId,
        name: data.name,
        email: data.email,
        role: data.role,
        avatarColor,
        department: data.department,
        organization: {
          id: orgId,
          name: 'PulseCore Intelligence Corp',
          slug: 'pulsecore',
          plan: 'enterprise',
        },
      },
    },
  });
}

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
  }

  const users = await query<any>(
    `SELECT u.id, u.organization_id, u.name, u.email, u.role, u.avatar_color, u.department,
            o.name as organization_name, o.slug as organization_slug, o.plan as organization_plan
     FROM users u
     JOIN organizations o ON u.organization_id = o.id
     WHERE u.id = ? LIMIT 1`,
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND' } });
  }

  const u = users[0];
  res.json({
    success: true,
    data: {
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatarColor: u.avatar_color,
        department: u.department,
        organization: {
          id: u.organization_id,
          name: u.organization_name,
          slug: u.organization_slug,
          plan: u.organization_plan,
        },
      },
    },
  });
}

export async function logout(req: AuthRequest, res: Response) {
  if (req.user) {
    await logAudit({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_LOGOUT',
      entityType: 'users',
      entityId: req.user.id,
    });
  }
  res.json({ success: true, message: 'Logged out successfully.' });
}

