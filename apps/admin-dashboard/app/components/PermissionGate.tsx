'use client';

import { CheckCircle, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useShell } from './ClientShell';

export type Permission =
  | 'view:all'
  | 'mutate:users'
  | 'mutate:invites'
  | 'mutate:api_keys'
  | 'mutate:feature_flags'
  | 'mutate:service_controls'
  | 'mutate:queues'
  | 'mutate:messaging';

export function useHasPermission(permission: Permission): boolean {
  const { viewer } = useShell();
  return viewer?.permissions?.includes('*') || viewer?.permissions?.includes(permission) || false;
}

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { viewer } = useShell();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const hasPermission =
    viewer?.permissions?.includes('*') || viewer?.permissions?.includes(permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const handleRequestPermission = async () => {
    setRequesting(true);
    try {
      await fetch('/command-api/permission-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permission,
          requestedBy: viewer?.email,
          requestedByName: viewer?.name,
        }),
      });
      setRequested(true);
    } catch (error) {
      console.error('Failed to request permission:', error);
    } finally {
      setRequesting(false);
    }
  };

  const permissionLabels: Record<Permission, string> = {
    'view:all': 'View All Data',
    'mutate:users': 'Manage Users',
    'mutate:invites': 'Manage Team Invites',
    'mutate:api_keys': 'Manage API Keys',
    'mutate:feature_flags': 'Toggle Feature Flags',
    'mutate:service_controls': 'Control Services',
    'mutate:queues': 'Manage Queues',
    'mutate:messaging': 'Send Campaigns',
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/5 p-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10">
        <Lock className="h-6 w-6 text-amber-400" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-amber-200">Permission Required</h3>
      <p className="mb-3 text-xs text-slate-400">
        You need{' '}
        <code className="rounded bg-white/5 px-1.5 py-0.5 text-amber-300">
          {permissionLabels[permission]}
        </code>{' '}
        to perform this action.
      </p>
      <button
        type="button"
        onClick={handleRequestPermission}
        disabled={requesting || requested}
        className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-300 transition-all hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {requesting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending Request...
          </>
        ) : requested ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Request Sent to Admin
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Request Permission
          </>
        )}
      </button>
    </div>
  );
}

export function PermissionGuard({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  return <PermissionGate permission={permission}>{children}</PermissionGate>;
}
