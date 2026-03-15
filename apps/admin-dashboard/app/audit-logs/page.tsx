'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { EmptyState, Panel, StatusBadge } from '../components/ui';
import { type AuditLogEntry, api, formatDate, formatRelativeTime } from '../lib/api';

export default function AuditLogsPage() {
  const { viewer } = useShell();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api<AuditLogEntry[]>('/command-api/audit-logs'),
    refetchInterval: 30_000,
  });

  const canManage = viewer?.permissions?.includes('view:all');

  if (viewer && !canManage) {
    return (
      <div className="animate-slide-up">
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Access Restricted"
          description="Audit logs are restricted to Engineers and Super Admins."
        />
      </div>
    );
  }

  const filteredLogs = logs?.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.actorEmail.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.targetType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Immutable Audit Trail</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cryptographically signed ledger of all administrative actions. (Last 100 entries)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs..."
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-400/30 w-64"
          />
        </div>
      </div>

      <Panel title="System Operations">
        {!filteredLogs ? (
          <div className="animate-pulse space-y-2">
            {[...Array(10)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <div key={`skeleton-${i}`} className="h-14 rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No logs found"
            description={
              searchTerm ? 'No logs match your search.' : 'The audit trail is currently empty.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 px-4 font-medium">Actor</th>
                  <th className="pb-3 px-4 font-medium">Action</th>
                  <th className="pb-3 pl-4 font-medium">Target / Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 align-top">
                      <div className="text-slate-300">{formatRelativeTime(log.createdAt)}</div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium text-white">{log.actorEmail}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-600">
                        {log.ipAddress ?? 'internal'}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <StatusBadge status={log.action.split('.').pop() ?? log.action} />
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                        {log.action.split('.')[0]} module
                      </div>
                    </td>
                    <td className="py-3 pl-4 align-top">
                      <div className="text-slate-300">
                        {log.targetType}{' '}
                        <span className="text-slate-500">
                          #{log.targetId?.slice(0, 8) ?? 'global'}
                        </span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-1 max-w-sm rounded bg-black/20 p-2 font-mono text-[10px] text-slate-400">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
