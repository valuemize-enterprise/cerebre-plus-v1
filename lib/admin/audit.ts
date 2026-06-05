// /lib/admin/audit.ts
// Write to the immutable admin_audit_log table.
// Call after every state-changing admin action.

import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminSession } from './auth'

export async function logAction(
  session:    AdminSession,
  action:     string,
  resource:   string,
  resourceId: string,
  details:    Record<string, any> = {}
): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.rpc('write_audit_log' as any, {
      p_admin_id:    session.adminId,
      p_admin_email: session.email,
      p_action:      action,
      p_resource:    resource,
      p_resource_id: resourceId,
      p_details:     details,
      p_ip_address:  session.ipAddress,
    })
  } catch (err) {
    // Never let audit logging break the main operation
    console.error('[audit] Failed to write log:', err)
  }
}

// Standard action constants
export const A = {
  LOGIN:            'admin_login',
  LOGOUT:           'admin_logout',
  VIEW_USER:        'view_user',
  UPGRADE_PLAN:     'upgrade_plan',
  DOWNGRADE_PLAN:   'downgrade_plan',
  GRANT_COINS:      'grant_coins',
  SUSPEND_USER:     'suspend_user',
  UNSUSPEND_USER:   'unsuspend_user',
  DELETE_USER:      'delete_user',
  SEND_EMAIL:       'send_email',
  ADD_SME_CLUB:     'add_sme_club',
  REMOVE_SME_CLUB:  'remove_sme_club',
  ADD_ADMIN:        'add_admin',
  REMOVE_ADMIN:     'remove_admin',
  CHANGE_ADMIN_ROLE:'change_admin_role',
  AI_QUERY:         'ai_insights_query',
}
