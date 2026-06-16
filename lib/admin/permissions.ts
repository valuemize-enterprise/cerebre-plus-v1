// /lib/admin/permissions.ts
// Role-Based Access Control for the Cerebre Plus Admin Console.
// Five roles, granular permissions, capability matrix.

// ── Role definitions ──────────────────────────────────────────
export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'content_manager'
  | 'support'
  | 'analyst'

// ── All possible permissions ──────────────────────────────────
export type Permission =
  // User management
  | 'view_users'           | 'edit_user_plan'      | 'edit_user_coins'
  | 'suspend_user'         | 'delete_user'         | 'send_user_email'
  | 'view_user_history'
  // Billing & revenue
  | 'view_billing'         | 'view_revenue'        | 'manage_billing'
  // Coins & economy
  | 'grant_coins'          | 'manage_economy'      | 'view_coin_stats'
  // SME Club & content
  | 'view_sme_club'        | 'manage_sme_club'     | 'publish_sessions'
  // Messages & comms
  | 'send_broadcast'       | 'view_messages'
  // Analytics & insights
  | 'view_ai_insights'     | 'view_ratings'        | 'export_data'
  // Admin team management
  | 'view_admin_team'      | 'manage_admin_team'   | 'manage_permissions'
  // System
  | 'view_audit_log'       | 'view_system_health'  | 'manage_system'

// ── Role → permissions map ────────────────────────────────────
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    // All users
    'view_users','edit_user_plan','edit_user_coins','suspend_user','delete_user',
    'send_user_email','view_user_history',
    // All billing
    'view_billing','view_revenue','manage_billing',
    // All coins
    'grant_coins','manage_economy','view_coin_stats',
    // All content
    'view_sme_club','manage_sme_club','publish_sessions',
    // All comms
    'send_broadcast','view_messages',
    // All analytics
    'view_ai_insights','view_ratings','export_data',
    // Admin team
    'view_admin_team','manage_admin_team','manage_permissions',
    // System
    'view_audit_log','view_system_health','manage_system',
  ],

  admin: [
    'view_users','edit_user_plan','edit_user_coins','suspend_user',
    'send_user_email','view_user_history',
    'view_billing','view_revenue',
    'grant_coins','view_coin_stats',
    'view_sme_club','manage_sme_club','publish_sessions',
    'send_broadcast','view_messages',
    'view_ai_insights','view_ratings','export_data',
    'view_admin_team',
    'view_audit_log','view_system_health',
  ],

  content_manager: [
    // Can create and publish content, reach users via messages
    'view_users','view_user_history',
    'view_sme_club','manage_sme_club','publish_sessions',
    'send_broadcast','view_messages',
    'view_ai_insights','view_ratings',
  ],

  support: [
    // Can help users — no billing visibility, no mass actions
    'view_users','send_user_email','edit_user_coins','view_user_history',
    'grant_coins',
    'view_sme_club',
    'view_messages',
    'view_ai_insights',
    'view_ratings',
  ],

  analyst: [
    // Read-only analytics — no user editing, no coins, no content publishing
    'view_users',
    'view_billing','view_revenue','view_coin_stats',
    'view_ai_insights','view_ratings','export_data',
    'view_audit_log',
    'view_system_health',
  ],
}

// ── Permission check helpers ──────────────────────────────────
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function requirePermission(role: AdminRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Role '${role}' does not have permission: ${permission}`)
  }
}

// ── Role metadata ─────────────────────────────────────────────
export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:     'Super Admin',
  admin:           'Admin',
  content_manager: 'Content Manager',
  support:         'Support',
  analyst:         'Analyst',
}

export const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin:     '#F5B830',
  admin:           '#12D4B4',
  content_manager: '#E1306C',
  support:         '#8B7FFF',
  analyst:         '#8BA8C8',
}

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin:     'Full platform access. Can manage all admins, billing, users, and system settings. Only assign to founders and senior tech leads.',
  admin:           'Operational access. Can manage users, content, and communications. Cannot manage the admin team or system settings.',
  content_manager: 'Content and communications focus. Manages SME Club sessions, broadcasts, and messages. Cannot see billing or edit users.',
  support:         'User-facing support. Can view users, send emails, and grant coins to resolve issues. No billing or mass-action access.',
  analyst:         'Read-only analytics. Can view all dashboards, export data, and audit logs. Cannot modify anything.',
}

export const ROLE_USE_CASES: Record<AdminRole, string[]> = {
  super_admin:     ['Founders', 'CTO / Lead Engineer', 'Head of Operations'],
  admin:           ['Operations Manager', 'Head of Customer Success', 'Senior Team Leads'],
  content_manager: ['Content Lead', 'Community Manager', 'Marketing Executive'],
  support:         ['Customer Support Agent', 'Account Manager', 'Customer Success Rep'],
  analyst:         ['Business Analyst', 'Finance Team', 'Growth Hacker', 'Investors'],
}

// ── Navigation items (shown/hidden based on role permissions) ─
export const NAVIGATION: Array<{
  href:       string
  label:      string
  icon:       string
  permission: Permission | null
  section?:   string
}> = [
  // Core
  { href:'/cerebre-admin/dashboard',   label:'Dashboard',        icon:'layout-dashboard', permission:null,                  section:'core' },
  // Users
  { href:'/cerebre-admin/users',        label:'Users',            icon:'users',             permission:'view_users',          section:'users' },
  // Revenue
  { href:'/cerebre-admin/billing',      label:'Billing',          icon:'credit-card',       permission:'view_billing',        section:'revenue' },
  { href:'/cerebre-admin/coins',        label:'Coins',            icon:'coins',             permission:'grant_coins',         section:'revenue' },
  // Content
  { href:'/cerebre-admin/sme-club',     label:'SME Club',         icon:'book-open',         permission:'view_sme_club',       section:'content' },
  { href:'/cerebre-admin/messages',     label:'Messages',         icon:'message-square',    permission:'view_messages',       section:'content' },
  // Analytics
  { href:'/cerebre-admin/ai-insights',  label:'AI Insights',      icon:'brain',             permission:'view_ai_insights',    section:'analytics' },
  { href:'/cerebre-admin/ratings',      label:'Ratings',          icon:'star',              permission:'view_ratings',        section:'analytics' },
  // System
  { href:'/cerebre-admin/logs',         label:'Audit Log',        icon:'list',              permission:'view_audit_log',      section:'system' },
  { href:'/cerebre-admin/system',       label:'System',           icon:'server',            permission:'view_system_health',  section:'system' },
  { href:'/cerebre-admin/team',         label:'Admin Team',       icon:'shield-check',      permission:'view_admin_team',     section:'system' },
]

// ── Capability matrix (what each role can do) ─────────────────
// Used to render the role comparison table in the team management page.
export const CAPABILITY_MATRIX: Array<{
  category:    string
  capability:  string
  permission:  Permission
}> = [
  { category:'Users',     capability:'View user profiles & history',   permission:'view_users' },
  { category:'Users',     capability:'Edit plan tier',                  permission:'edit_user_plan' },
  { category:'Users',     capability:'Grant or adjust coins',           permission:'edit_user_coins' },
  { category:'Users',     capability:'Suspend or ban a user',           permission:'suspend_user' },
  { category:'Users',     capability:'Permanently delete a user',       permission:'delete_user' },
  { category:'Users',     capability:'Send email to a user',            permission:'send_user_email' },
  { category:'Revenue',   capability:'View billing dashboard',          permission:'view_billing' },
  { category:'Revenue',   capability:'View revenue figures',            permission:'view_revenue' },
  { category:'Revenue',   capability:'Manage subscriptions',            permission:'manage_billing' },
  { category:'Coins',     capability:'Manually grant coins',            permission:'grant_coins' },
  { category:'Coins',     capability:'Adjust coin economy settings',    permission:'manage_economy' },
  { category:'Content',   capability:'View SME Club sessions',          permission:'view_sme_club' },
  { category:'Content',   capability:'Create & edit SME sessions',      permission:'manage_sme_club' },
  { category:'Content',   capability:'Publish SME sessions',            permission:'publish_sessions' },
  { category:'Content',   capability:'Send broadcast messages',         permission:'send_broadcast' },
  { category:'Analytics', capability:'View AI Insights dashboard',      permission:'view_ai_insights' },
  { category:'Analytics', capability:'View ratings & feedback',         permission:'view_ratings' },
  { category:'Analytics', capability:'Export reports & data',           permission:'export_data' },
  { category:'System',    capability:'View audit log',                  permission:'view_audit_log' },
  { category:'System',    capability:'View system health',              permission:'view_system_health' },
  { category:'System',    capability:'Manage system settings',          permission:'manage_system' },
  { category:'Team',      capability:'View admin team',                 permission:'view_admin_team' },
  { category:'Team',      capability:'Invite & manage admins',          permission:'manage_admin_team' },
  { category:'Team',      capability:'Customise permissions',           permission:'manage_permissions' },
]
