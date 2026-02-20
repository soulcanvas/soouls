'use client';

import { useUser } from '@clerk/nextjs';
import { Clock, Image as ImageIcon, ListTodo, Mic, PenTool, Check, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '../../../src/utils/trpc';

export default function NewEntryPage() {
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialId = searchParams.get('id');
    const [content, setContent] = useState('');
    const [entryId, setEntryId] = useState<string | null>(initialId);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // ─── Stable refs ──────────────────────────────────────────────────────────
    // Mutations stored in refs so they never cause useCallback to change identity
    const createMutation = trpc.createEntry.useMutation();
    const updateMutation = trpc.updateEntry.useMutation();
    const createMutateRef = useRef(createMutation.mutateAsync);
    const updateMutateRef = useRef(updateMutation.mutateAsync);
    useEffect(() => { createMutateRef.current = createMutation.mutateAsync; });
    useEffect(() => { updateMutateRef.current = updateMutation.mutateAsync; });

    const contentRef = useRef('');
    const entryIdRef = useRef<string | null>(initialId);
    const isSavingRef = useRef(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const userIdRef = useRef<string | undefined>(undefined);

    // Keep refs in sync with latest state
    useEffect(() => { contentRef.current = content; }, [content]);
    useEffect(() => { entryIdRef.current = entryId; }, [entryId]);
    useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

    // Auto-dismiss "Saved" after 2.5s
    useEffect(() => {
        if (saveStatus !== 'saved') return;
        const t = setTimeout(() => setSaveStatus('idle'), 2500);
        return () => clearTimeout(t);
    }, [saveStatus]);

    // ─── Fetch existing entry (for edit mode) ─────────────────────────────────
    const { data: existingEntry } = trpc.getEntry.useQuery(
        { id: initialId! },
        { enabled: !!initialId }
    );
    useEffect(() => {
        if (existingEntry && !contentRef.current) {
            setContent(existingEntry.content || '');
            setEntryId(existingEntry.id);
        }
    }, [existingEntry]);

    // ─── Core save function (uses refs only — never changes identity) ──────────
    const performSave = useRef(async (text: string, id: string | null) => {
        if (!text.trim() || !userIdRef.current || isSavingRef.current) return;

        isSavingRef.current = true;
        setSaveStatus('saving');

        try {
            if (!id) {
                const newEntry = await createMutateRef.current({ content: text, type: 'entry' });
                setEntryId(newEntry.id);
                entryIdRef.current = newEntry.id;
            } else {
                await updateMutateRef.current({ id, content: text });
            }
            setSaveStatus('saved');
        } catch (err) {
            console.error('Auto-save failed:', err);
            setSaveStatus('idle');
        } finally {
            isSavingRef.current = false;
        }
    });

    // ─── 1-second debounce — depends only on content changes ─────────────────
    useEffect(() => {
        if (!content.trim()) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            performSave.current(contentRef.current, entryIdRef.current);
        }, 1000);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [content]); // ← ONLY content; no function references = no re-render loop

    // ─── Save on unmount ──────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            if (contentRef.current.trim() && !isSavingRef.current) {
                performSave.current(contentRef.current, entryIdRef.current);
            }
        };
    }, []); // runs once on mount/unmount only

    // ─── Save before navigating home ─────────────────────────────────────────
    const handleHomeClick = async () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (contentRef.current.trim() && !isSavingRef.current) {
            await performSave.current(contentRef.current, entryIdRef.current);
        }
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white font-clarity flex flex-col relative overflow-hidden">
            {/* Background text watermark */}
            <div
                className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none opacity-[0.15] select-none z-0 overflow-hidden whitespace-nowrap"
                aria-hidden="true"
            >
                <span className="font-editorial text-[22vw] leading-none text-transparent tracking-tighter" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.7)' }}>Soulcanvas</span>
            </div>

            {/* Header */}
            <header className="px-10 py-8 flex justify-between items-center relative z-10 w-full">
                <div className="flex items-center gap-1 text-xl font-editorial tracking-wide">
                    <button onClick={handleHomeClick} className="text-slate-500 hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer">
                        Home
                    </button>
                    <span className="text-slate-500">/</span>
                    <span className="text-[#FF5C35]">New Entry</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Save status indicator */}
                    <div className="flex items-center justify-end min-w-[100px] h-8 relative">
                        <AnimatePresence mode="wait">
                            {saveStatus === 'saving' && (
                                <motion.div
                                    key="saving"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2 text-slate-500 text-xs"
                                >
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving...</span>
                                </motion.div>
                            )}
                            {saveStatus === 'saved' && (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, scale: 0.5, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Saved</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {user?.imageUrl && (
                        <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
                    )}
                </div>
            </header>

            {/* Main writing area */}
            <main className="flex-1 w-full max-w-5xl mx-auto mt-4 px-6 relative z-10 flex flex-col h-full">
                <div className="flex-1 rounded-tr-3xl rounded-tl-3xl bg-[#1A1A1A] p-10 pb-32 relative flex flex-col max-h-[80vh]">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Drop new entry..."
                        className="w-full flex-1 bg-transparent border-none outline-none resize-none text-[28px] font-clarity text-white placeholder:text-slate-500 focus:ring-0 leading-relaxed font-light"
                        autoFocus
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 text-slate-300 text-sm px-5 py-2.5 rounded-full z-20 shadow-xl whitespace-nowrap pointer-events-none">
                        Add if it helps you remember
                        <div className="absolute bottom-[-6px] left-[55%] -translate-x-1/2 w-3 h-3 bg-[#1A1A1A] border-r border-b border-white/10 rotate-45"></div>
                    </div>

                    {/* Bottom toolbar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-[#141414] border border-white/10 rounded-[20px] flex items-center divide-x divide-white/10 shadow-lg overflow-hidden z-10">
                        <button className="flex items-center gap-2 px-5 py-3.5 hover:bg-white/5 transition-colors text-slate-200 text-sm whitespace-nowrap">
                            <ImageIcon className="w-4 h-4 text-slate-400" /><span>Add image</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3.5 hover:bg-white/5 transition-colors text-slate-200 text-sm whitespace-nowrap">
                            <Mic className="w-4 h-4 text-slate-400" /><span>Voice note</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3.5 hover:bg-white/5 transition-colors text-slate-200 text-sm whitespace-nowrap">
                            <PenTool className="w-4 h-4 text-slate-400" /><span>Doodle</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3.5 hover:bg-white/5 transition-colors text-slate-200 text-sm whitespace-nowrap">
                            <ListTodo className="w-4 h-4 text-slate-400" /><span>Tasklist</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3.5 hover:bg-white/5 transition-colors text-slate-200 text-sm whitespace-nowrap">
                            <Clock className="w-4 h-4 text-slate-400" /><span>Set time</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
