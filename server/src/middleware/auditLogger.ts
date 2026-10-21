import { AuthenticatedRequest } from './auth.js';
import { AuditLog } from '../models/AuditLog.js';

export const logAuditEvent = async (
  req: AuthenticatedRequest,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    if (!req.user) return;
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req.ip || req.socket.remoteAddress || '',
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record audit log:', error);
  }
};
