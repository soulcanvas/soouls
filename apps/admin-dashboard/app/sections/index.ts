export { DashboardSection } from './DashboardSection';
export { MessagingSection } from './MessagingSection';
export { TeamSection } from './TeamSection';
export { HealthSection } from './HealthSection';
export { BillingSection } from './BillingSection';
export { AiSection } from './AiSection';
export { RateLimitsSection } from './RateLimitsSection';
export { FeatureFlagsSection } from './FeatureFlagsSection';
export { ServiceControlsSection } from './ServiceControlsSection';
export { AuditLogsSection } from './AuditLogsSection';
export { ApiKeysSection } from './ApiKeysSection';
export { UsersSection } from './UsersSection';
export { EntriesSection } from './EntriesSection';

export type SectionName =
  | 'dashboard'
  | 'users'
  | 'entries'
  | 'messaging'
  | 'team'
  | 'billing'
  | 'ai'
  | 'health'
  | 'rate-limits'
  | 'feature-flags'
  | 'service-controls'
  | 'api-keys'
  | 'audit-logs';

export const SECTION_TITLES: Record<SectionName, string> = {
  dashboard: 'Command Center',
  users: 'User Galaxy',
  entries: 'Journal Entries',
  messaging: 'Central Messaging',
  team: 'Identity & Access',
  billing: 'Financial & Billing',
  ai: 'AI Weaver Telemetry',
  health: 'System Health',
  'rate-limits': 'Rate Limit Visualizer',
  'feature-flags': 'Feature Flags',
  'service-controls': 'Emergency Controls',
  'api-keys': 'Developer API Keys',
  'audit-logs': 'Immutable Audit Trail',
};
