// /lib/admin/permissions.ts
// Role-Based Access Control for the Cerebre Plus Admin Console.
// Import PERMISSIONS in every admin API route.

export type AdminRole = 'super_admin' | 'admin' | 'support' | 'analyst'

export type Permission =
  | 'view_users'              | 'edit_user_plan'       | 'edit_user_coins'
  | 'suspend_user'            | 'delete_user'          | 'send_user_email'
  | 'view_billing'            | 'view_revenue'
  | 'view_sme_club'           | 'manage_sme_club'
  | 'view_admin_team'         | 'manage_admin_team'
  | 'view_audit_log'          | 'view_ai_insights'
  | 'grant_coins'             | 'manage_economy'

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'view_users','edit_user_plan','edit_user_coins','suspend_user','delete_user','send_user_email',
    'view_billing','view_revenue',
    'view_sme_club','manage_sme_club',
    'view_admin_team','manage_admin_team',
    'view_audit_log','view_ai_insights',
    'grant_coins','manage_economy',
  ],
  admin: [
    'view_users','edit_user_plan','edit_user_coins','suspend_user','send_user_email',
    'view_billing','view_revenue',
    'view_sme_club','manage_sme_club',
    'view_audit_log','view_ai_insights','grant_coins',
  ],
  support: [
    'view_users','send_user_email','edit_user_coins',
    'view_sme_club','view_ai_insights','grant_coins',
  ],
  analyst: [
    'view_users','view_billing','view_revenue','view_ai_insights','view_audit_log',
  ],
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function requirePermission(role: AdminRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Role '${role}' does not have permission: ${permission}`)
  }
}

// Nav items visible per role (used by admin layout sidebar)
export const NAV_ITEMS = [
  { href: '/cerebre-admin/dashboard',   label: 'Dashboard',   icon: 'chart-bar',    permission: null },
  { href: '/cerebre-admin/users',        label: 'Users',       icon: 'users',         permission: 'view_users'         as Permission },
  { href: '/cerebre-admin/billing',      label: 'Billing',     icon: 'receipt',       permission: 'view_billing'       as Permission },
  { href: '/cerebre-admin/sme-club',     label: 'SME Club',    icon: 'crown',         permission: 'view_sme_club'      as Permission },
  { href: '/cerebre-admin/coins',        label: 'Coins',       icon: 'coin',          permission: 'grant_coins'        as Permission },
  { href: '/cerebre-admin/ai-insights',  label: 'AI Insights', icon: 'brain',         permission: 'view_ai_insights'   as Permission },
  { href: '/cerebre-admin/ratings',      label: 'Ratings',     icon: 'star',          permission: 'view_ai_insights'   as Permission },
  { href: '/cerebre-admin/messages',     label: 'Messages',    icon: 'message-square',permission: 'send_user_email'    as Permission },
  { href: '/cerebre-admin/logs',         label: 'Audit Log',   icon: 'list',          permission: 'view_audit_log'     as Permission },
  { href: '/cerebre-admin/team',         label: 'Admin Team',  icon: 'shield-lock',   permission: 'view_admin_team'    as Permission },
]

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  support:     'Support',
  analyst:     'Analyst',
}

export const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: '#F5B830',
  admin:       '#12D4B4',
  support:     '#8B7FFF',
  analyst:     '#8BA8C8',
}
