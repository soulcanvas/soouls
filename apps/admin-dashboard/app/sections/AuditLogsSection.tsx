'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Download, FileText, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useShell } from '../components/ClientShell';
import { ActionButton, EmptyState, Panel } from '../components/ui';
import { type AuditLogEntry, api, formatDate, formatRelativeTime } from '../lib/api';

type FilterCategory = 'all' | 'security' | 'users' | 'messaging' | 'system' | 'api';

const CATEGORY_MAP: Record<string, string[]> = {
  security: [
    'admin_logged',
    'admin.login',
    'admin.logout',
    'admin.login_failed',
    'permission',
    'masquerade',
  ],
  users: ['user.', 'entries', 'gdpr'],
  messaging: ['messaging', 'campaign', 'email', 'whatsapp'],
  system: ['feature_flag', 'service_control', 'api_key', 'developer_api'],
  api: ['rate_limit', 'api_error', 'api_call'],
};

const SEVERITY_MAP: Record<string, { color: string; icon: string }> = {
  critical: { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: '●' },
  warn: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '◆' },
  info: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '○' },
};

function getSeverity(action: string): { color: string; icon: string } {
  const actionLower = action.toLowerCase();
  if (
    actionLower.includes('failed') ||
    actionLower.includes('error') ||
    actionLower.includes('denied')
  ) {
    return SEVERITY_MAP.critical;
  }
  if (
    actionLower.includes('warn') ||
    actionLower.includes('request') ||
    actionLower.includes('delete')
  ) {
    return SEVERITY_MAP.warn;
  }
  return SEVERITY_MAP.info;
}

function getCategory(action: string): string {
  const actionLower = action.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((kw) => actionLower.includes(kw))) {
      return category;
    }
  }
  return 'system';
}

function formatAction(action: string): string {
  return action.replace(/\./g, ' ').replace(/_/g, ' ');
}

export function AuditLogsSection() {
  const { viewer } = useShell();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(100);

  const {
    data: logs,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api<AuditLogEntry[]>('/command-api/audit-logs'),
    refetchInterval: 30_000,
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];

    return logs
      .filter((log) => {
        if (activeCategory !== 'all') {
          const category = getCategory(log.action);
          if (category !== activeCategory) return false;
        }

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            log.actorEmail.toLowerCase().includes(term) ||
            log.action.toLowerCase().includes(term) ||
            log.targetType.toLowerCase().includes(term) ||
            log.ipAddress?.toLowerCase().includes(term) ||
            (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(term))
          );
        }

        return true;
      })
      .slice(0, limit);
  }, [logs, searchTerm, activeCategory, limit]);

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;

    const headers = [
      'Timestamp',
      'Severity',
      'Actor',
      'Action',
      'Target Type',
      'Target ID',
      'IP Address',
      'Metadata',
    ];
    const rows = filteredLogs.map((log) => [
      formatDate(log.createdAt),
      getSeverity(log.action).icon,
      log.actorEmail,
      log.action,
      log.targetType,
      log.targetId || '',
      log.ipAddress || 'internal',
      log.metadata ? JSON.stringify(log.metadata) : '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryCounts = useMemo(() => {
    if (!logs) return { all: 0, security: 0, users: 0, messaging: 0, system: 0, api: 0 };
    const counts: Record<string, number> = {
      all: logs.length,
      security: 0,
      users: 0,
      messaging: 0,
      system: 0,
      api: 0,
    };
    logs.forEach((log) => {
      const cat = getCategory(log.action);
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Immutable Audit Trail</h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete record of all administrative actions. {logs?.length || 0} total events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            disabled={!filteredLogs || filteredLogs.length === 0}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'security', 'users', 'messaging', 'system', 'api'] as FilterCategory[]).map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-all ${
                activeCategory === category
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {category === 'all' ? 'All Events' : category} ({categoryCounts[category]})
            </button>
          ),
        )}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3">
        <Search className="h-4 w-4 text-amber-300/60" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by actor, action, target, IP, or metadata..."
          className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={`skeleton-${i}`} className="h-16 rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No logs found"
          description={
            searchTerm
              ? 'No logs match your search criteria.'
              : 'The audit trail is currently empty.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const severity = getSeverity(log.action);
            const isExpanded = expandedLogs.has(log.id);
            const category = getCategory(log.action);

            return (
              <div
                key={log.id}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.1] hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-4 p-4">
                  <div
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${severity.color}`}
                  >
                    {severity.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{log.actorEmail}</span>
                          <span className="text-slate-500">performed</span>
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-amber-300">
                            {formatAction(log.action)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span>{log.targetType}</span>
                          {log.targetId && (
                            <span className="font-mono">#{log.targetId.slice(0, 8)}</span>
                          )}
                          {log.ipAddress && <span className="font-mono">{log.ipAddress}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                          {category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(log.createdAt)}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </div>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(log.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                      >
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                        {isExpanded ? 'Hide' : 'Show'} metadata
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && log.metadata && (
                  <div className="border-t border-white/[0.06] px-4 pb-4 pt-2">
                    <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-slate-400">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredLogs.length > 0 && filteredLogs.length >= limit && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((prev) => prev + 100)}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10"
          >
            Load More ({limit} of {logs?.length || 0})
          </button>
        </div>
      )}
    </div>
  );
}
