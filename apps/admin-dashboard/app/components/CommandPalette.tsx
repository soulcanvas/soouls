'use client';

import { Command } from 'cmdk';
import {
  Activity,
  Cpu,
  CreditCard,
  KeyRound,
  LayoutGrid,
  Mail,
  Search,
  Settings,
  Shield,
  ToggleRight,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh] backdrop-blur-sm transition-all duration-200 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
      >
        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#091124]/95 font-sans shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
          <div className="flex items-center border-b border-white/[0.06] px-4 py-3">
            <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="px-2 py-1 text-xs font-medium text-slate-400 [&_[cmdk-group-items]]:mt-2 [&_[cmdk-group-items]]:space-y-1"
            >
              <CommandItem onSelect={() => runCommand(() => router.push('/'))} icon={LayoutGrid}>
                Overview
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/users'))} icon={Users}>
                Users
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/settings/team'))}
                icon={Shield}
              >
                Team Settings
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/billing'))}
                icon={CreditCard}
              >
                Billing Hub
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/ai-telemetry'))}
                icon={Cpu}
              >
                AI Telemetry
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/messaging'))} icon={Mail}>
                Messaging
              </CommandItem>
            </Command.Group>

            <Command.Group
              heading="Developer"
              className="px-2 py-3 text-xs font-medium text-slate-400 [&_[cmdk-group-items]]:mt-2 [&_[cmdk-group-items]]:space-y-1"
            >
              <CommandItem
                onSelect={() => runCommand(() => router.push('/api-keys'))}
                icon={KeyRound}
              >
                API Keys
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/feature-flags'))}
                icon={ToggleRight}
              >
                Feature Flags
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/service-controls'))}
                icon={Settings}
              >
                Service Controls
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/audit-logs'))}
                icon={Activity}
              >
                Audit Logs
              </CommandItem>
            </Command.Group>

            <Command.Group
              heading="Quick Actions"
              className="px-2 pb-2 text-xs font-medium text-slate-400 [&_[cmdk-group-items]]:mt-2 [&_[cmdk-group-items]]:space-y-1"
            >
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  document.documentElement.classList.toggle('dark');
                }}
                icon={Activity}
              >
                Toggle Dark Mode
              </CommandItem>
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  );
}

function CommandItem({
  children,
  onSelect,
  icon: Icon,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon: React.ElementType;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors aria-selected:bg-white/[0.06] aria-selected:text-white"
    >
      <Icon className="h-4 w-4 shrink-0 text-slate-400 aria-selected:text-white" />
      {children}
    </Command.Item>
  );
}
