'use client';

import { useUser } from '@clerk/nextjs';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import imageCompression from 'browser-image-compression';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Check,
  Clock,
  Eraser,
  GripVertical,
  Image as ImageIcon,
  ListTodo,
  Loader2,
  Mic,
  Pause,
  PenTool,
  Play,
  Plus,
  Sparkles,
  Square,
  StopCircle,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import LZString from 'lz-string';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getOptimizedImageUrl } from '../../../src/utils/images';
import { trpc } from '../../../src/utils/trpc';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const gf = new GiphyFetch(
  process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'umSoMdQJRH8u5gCmX0BXFNPOsWRVhqHe',
);

// Stable references for Giphy Grid to prevent infinite re-renders
const fetchGifsTrending = (offset: number) => gf.trending({ offset, limit: 10, type: 'gifs' });
const fetchStickersTrending = (offset: number) =>
  gf.trending({ offset, limit: 12, type: 'stickers' });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Types ────────────────────────────────────────────────────────────────────
type Block =
  | {
      id: string;
      type: 'image';
      dataUrl: string;
      name: string;
      isSticker?: boolean;
      isGif?: boolean;
    }
  | { id: string; type: 'voice'; dataUrl: string; duration: number }
  | { id: string; type: 'doodle'; dataUrl: string }
  | { id: string; type: 'goal'; goal: string; label: string; seconds: number; running: boolean }
  | {
      id: string;
      type: 'tasklist';
      title: string;
      tasks: { id: string; text: string; done: boolean }[];
    };

interface PersistedState {
  textContent: string;
  blocks: Block[];
}

// ─── useLocalStorage hook ─────────────────────────────────────────────────────
// Reads once on mount, writes on every change. Never SSR-crashes.
function usePersistedEntry(initialId: string | null) {
  const lsKeyRef = useRef(`soouls_entry_v1_${initialId || 'new'}`);

  const [textContent, setTextContentRaw] = useState('');
  const textContentRef = useRef(textContent);
  const [blocks, setBlocksRaw] = useState<Block[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage once on mount (client only)
  useEffect(() => {
    // If this is a brand-new entry (no ID), wipe the stale 'new' key
    // so old data never leaks into a fresh canvas.
    if (!initialId) {
      localStorage.removeItem(lsKeyRef.current);
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(lsKeyRef.current);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        // Pause all goal timers on restore — user can resume manually
        const restored = parsed.blocks.map((b) =>
          b.type === 'goal' ? { ...b, running: false } : b,
        );
        setTextContentRaw(parsed.textContent ?? '');
        textContentRef.current = parsed.textContent ?? '';
        setBlocksRaw(restored);
      }
    } catch {
      /* corrupt data — ignore */
    }
    setHydrated(true);
  }, [initialId]);

  // Persist to localStorage whenever text or blocks change
  const persist = useCallback(
    (text: string, blks: Block[]) => {
      if (!hydrated) return;
      setSaveStatus('saving');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        try {
          const state: PersistedState = { textContent: text, blocks: blks };
          localStorage.setItem(lsKeyRef.current, JSON.stringify(state));
          setSaveStatus('saved');
        } catch {
          // localStorage quota exceeded (large images/audio)
          setSaveStatus('idle');
          console.warn('localStorage quota exceeded');
        }
      }, 500);
    },
    [hydrated],
  );

  // Auto-dismiss "saved" pill after 2.5s
  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const t = setTimeout(() => setSaveStatus('idle'), 2500);
    return () => clearTimeout(t);
  }, [saveStatus]);

  // Wrapped setters that also trigger persist
  const setTextContent = useCallback(
    (valOrUpdater: string | ((prev: string) => string)) => {
      setTextContentRaw((prevRaw) => {
        const nextVal = typeof valOrUpdater === 'function' ? valOrUpdater(prevRaw) : valOrUpdater;
        setBlocksRaw((prevBlocks) => {
          persist(nextVal, prevBlocks);
          return prevBlocks;
        });
        return nextVal;
      });
    },
    [persist],
  );

  const setBlocks = useCallback(
    (updater: (prev: Block[]) => Block[]) => {
      setBlocksRaw((prev) => {
        const next = updater(prev);
        persist(textContent, next);
        return next;
      });
    },
    [persist, textContent],
  );

  const clearAll = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    localStorage.removeItem(lsKeyRef.current);
    setTextContentRaw('');
    textContentRef.current = '';
    setBlocksRaw([]);
    setSaveStatus('idle');
  }, []);

  // Migrate the localStorage key from 'new' to a real entry ID after first DB save
  const migrateKey = useCallback((newId: string) => {
    const oldKey = lsKeyRef.current;
    const newKey = `soouls_entry_v1_${newId}`;
    if (oldKey === newKey) return; // already on the right key
    try {
      const data = localStorage.getItem(oldKey);
      if (data) {
        localStorage.setItem(newKey, data);
      }
      localStorage.removeItem(oldKey);
    } catch {
      /* ignore */
    }
    lsKeyRef.current = newKey;
  }, []);

  return {
    textContent,
    setTextContent,
    blocks,
    setBlocks,
    hydrated,
    saveStatus,
    clearAll,
    migrateKey,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL PRIMITIVES
// ══════════════════════════════════════════════════════════════════════════════
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      {children}
    </motion.div>
  );
}
function Modal({
  title,
  icon,
  onClose,
  extra,
  footer,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  extra?: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ scale: 0.95, y: 16 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 16 }}
      className="bg-[#1C1C1C]/90 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 rounded-[32px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] w-full max-w-[460px] flex flex-col relative"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-md"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] bg-black/10">
        <span className="text-white text-[15px] tracking-wide font-medium flex items-center gap-3">
          {icon}
          {title}
        </span>
        <div className="flex items-center gap-1 pr-8">{extra}</div>
      </div>
      {children}
      <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-white/[0.04] bg-black/10">
        {footer}
      </div>
    </motion.div>
  );
}
const _IconBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
  >
    {children}
  </button>
);
const GhostBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-2.5 text-[13px] font-medium text-white/50 hover:text-white transition-colors tracking-wide"
  >
    {children}
  </button>
);
const OrangeBtn = ({
  onClick,
  disabled,
  children,
}: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="px-8 py-2.5 bg-[#D46B4E] hover:bg-[#E58B76] disabled:opacity-40 disabled:hover:translate-y-0 text-white text-[13px] rounded-full transition-all duration-300 font-semibold shadow-[0_8px_20px_rgba(212,107,78,0.3)] hover:shadow-[0_8px_30px_rgba(212,107,78,0.5)] tracking-wide hover:-translate-y-0.5"
  >
    {children}
  </button>
);
const MInput = ({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-white text-[14px] placeholder:text-white/30 outline-none focus:border-[#D46B4E]/50 focus:bg-black/40 transition-all w-full shadow-inner ${className}`}
  />
);

// ══════════════════════════════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════════════════════════════
function DoodleModal({
  onClose,
  onSave,
  onSaveImage,
  onAppendText,
}: {
  onClose: () => void;
  onSave: (d: string) => void;
  onSaveImage: (u: string, n: string, isSticker?: boolean, isGif?: boolean) => void;
  onAppendText: (t: string) => void;
}) {
  const [tab, setTab] = useState<'stickers' | 'emoji' | 'gif' | 'draw'>('stickers');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, [tab]);

  const fetchStickers = useCallback(
    (offset: number) => {
      return debouncedQuery
        ? gf.search(debouncedQuery, { offset, limit: 12, type: 'stickers' })
        : fetchStickersTrending(offset);
    },
    [debouncedQuery],
  );

  const fetchGifs = useCallback(
    (offset: number) => {
      return debouncedQuery
        ? gf.search(debouncedQuery, { offset, limit: 10, type: 'gifs' })
        : fetchGifsTrending(offset);
    },
    [debouncedQuery],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [color, setColor] = useState('#D46B4E');
  const [size, _setSize] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width;
    const sy = c.height / r.height;
    if ('touches' in e && e.touches[0])
      return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    const me = e as React.MouseEvent;
    return { x: (me.clientX - r.left) * sx, y: (me.clientY - r.top) * sy };
  };
  const snap = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (history.current.length > 40) history.current.shift();
  };
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    snap();
    drawing.current = true;
    const p = getPos(e);
    if (!p) return;
    last.current = p;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (tool === 'eraser' ? size * 3 : size) / 2, 0, Math.PI * 2);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = color;
    ctx.fill();
  };
  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current || !last.current) return;
    const p = getPos(e);
    if (!p) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    last.current = p;
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };
  const undo = () => {
    if (!history.current.length) return;
    const imageData = history.current.pop();
    if (imageData) canvasRef.current?.getContext('2d')?.putImageData(imageData, 0, 0);
  };
  const clearCanvas = () => {
    snap();
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  };

  return (
    <Overlay>
      <div className="bg-[#1C1C1C]/90 backdrop-blur-3xl rounded-[32px] w-[460px] shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col border border-white/10 relative overflow-hidden ring-1 ring-white/5">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Premium Pill Tabs */}
        <div className="flex p-3 gap-2 border-b border-white/5 bg-black/20 z-10">
          {[
            { id: 'stickers', label: 'Stickers' },
            { id: 'emoji', label: 'Emoji' },
            { id: 'gif', label: 'GIFs' },
            { id: 'draw', label: 'Canvas' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 py-2.5 rounded-[16px] text-[13px] font-medium transition-all duration-300 ${tab === t.id ? 'bg-white/10 text-white shadow-lg scale-100 ring-1 ring-white/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5 scale-95'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full relative">
          {(tab === 'stickers' || tab === 'gif') && (
            <div className="absolute top-0 left-0 right-0 p-3 z-10 bg-gradient-to-b from-[#151515] to-transparent">
              <input
                type="text"
                placeholder={`Search ${tab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#D46B4E]/60 focus:bg-black/60 transition-all shadow-inner"
              />
            </div>
          )}

          {tab === 'stickers' && (
            <div className="h-[480px] overflow-y-auto px-4 pt-20 pb-4 custom-scrollbar bg-[#151515]">
              <Grid
                width={428}
                columns={3}
                gutter={8}
                fetchGifs={fetchStickers}
                key={`stickers-${debouncedQuery}`}
                noResultsMessage={
                  <div className="text-white/40 text-center py-10">No stickers found</div>
                }
                onGifClick={(gif, e) => {
                  e.preventDefault();
                  onSaveImage(gif.images.downsized.url, gif.title || 'Sticker', true, false);
                  onClose();
                }}
              />
            </div>
          )}

          {tab === 'emoji' && (
            <div className="h-[480px] bg-[#151515]">
              <EmojiPicker
                theme={'dark' as any}
                width="100%"
                height="100%"
                skinTonesDisabled
                searchDisabled={false}
                onEmojiClick={(emojiData) => {
                  onAppendText(emojiData.emoji);
                  onClose();
                }}
              />
            </div>
          )}

          {tab === 'gif' && (
            <div className="h-[480px] overflow-y-auto px-4 pt-20 pb-4 custom-scrollbar bg-[#151515]">
              <Grid
                width={428}
                columns={2}
                gutter={8}
                fetchGifs={fetchGifs}
                key={`gifs-${debouncedQuery}`}
                noResultsMessage={
                  <div className="text-white/40 text-center py-10">No GIFs found</div>
                }
                onGifClick={(gif, e) => {
                  e.preventDefault();
                  onSaveImage(gif.images.downsized.url, gif.title || 'GIF', false, true);
                  onClose();
                }}
              />
            </div>
          )}

          {tab === 'draw' && (
            <div className="relative w-full h-[440px] bg-[#0A0A0A] bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]">
              {/* Floating Glass Toolbars */}
              <div className="absolute top-4 left-4 flex gap-3 items-center bg-black/40 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10 shadow-2xl z-10">
                {['#D46B4E', '#60A5FA', '#34D399', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setTool('pen');
                    }}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${color === c && tool === 'pen' ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <div className="w-px h-4 bg-white/20 mx-1" />
                <button
                  type="button"
                  onClick={() => setTool('eraser')}
                  className={`p-1.5 rounded-full transition-all ${tool === 'eraser' ? 'bg-white/20 text-white shadow-inner' : 'text-white/40 hover:text-white/90'}`}
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute top-4 right-16 flex gap-1 items-center bg-black/40 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/10 shadow-2xl z-10">
                <button
                  type="button"
                  onClick={undo}
                  className="p-2 hover:text-white text-white/50 transition-colors rounded-full hover:bg-white/10"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-2 hover:text-red-400 text-white/50 transition-colors rounded-full hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Interaction Canvas */}
              <canvas
                ref={canvasRef}
                width={1000}
                height={800}
                className="absolute inset-0 w-full h-full block touch-none z-0"
                style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onTouchStart={onDown}
                onTouchMove={onMove}
                onTouchEnd={onUp}
              />

              {/* Glowing Save Button */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
                <button
                  type="button"
                  onClick={() => {
                    onSave(canvasRef.current?.toDataURL() || '');
                    onClose();
                  }}
                  className="px-10 py-3.5 rounded-full bg-[#D46B4E] hover:bg-[#E58B76] text-white text-[14px] transition-all duration-300 pointer-events-auto shadow-[0_10px_40px_rgba(212,107,78,0.4)] hover:shadow-[0_10px_60px_rgba(212,107,78,0.6)] font-semibold tracking-wide hover:-translate-y-1"
                >
                  Drop into Entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function ImageModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (d: string, n: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const load = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setName(f.name);
    const r = new FileReader();
    r.onload = (e) => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };
  return (
    <Overlay>
      <Modal
        title="Add Image"
        icon={<ImageIcon className="w-3.5 h-3.5 text-[#FF5C35]" />}
        onClose={onClose}
        footer={
          <>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <OrangeBtn
              disabled={!preview}
              onClick={() => {
                if (preview) {
                  onAdd(preview, name);
                  onClose();
                }
              }}
            >
              Add to entry
            </OrangeBtn>
          </>
        }
      >
        <div className="p-5">
          {!preview ? (
            <button
              type="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter') ref.current?.click();
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                e.dataTransfer.files[0] && load(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onClick={() => ref.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-14 w-full flex flex-col items-center gap-3 cursor-pointer transition-colors ${drag ? 'border-[#FF5C35] bg-[#FF5C35]/5' : 'border-white/10 hover:border-white/20'}`}
            >
              <ImageIcon className="w-10 h-10 text-slate-500" />
              <p className="text-slate-400 text-sm text-center">
                Drop image here or <span className="text-[#FF5C35]">browse</span>
              </p>
              <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && load(e.target.files[0])}
              />
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-60 object-contain bg-black/20"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setName('');
                }}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </Modal>
    </Overlay>
  );
}

function GoalModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (goal: string, label: string) => void }) {
  const [goal, setGoal] = useState('');
  const [label, setLabel] = useState('');
  return (
    <Overlay>
      <Modal
        title="Set Goal & Timer"
        icon={<Clock className="w-3.5 h-3.5 text-[#FF5C35]" />}
        onClose={onClose}
        footer={
          <>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <OrangeBtn
              disabled={!goal.trim()}
              onClick={() => {
                onAdd(goal, label);
                onClose();
              }}
            >
              Start timer
            </OrangeBtn>
          </>
        }
      >
        <div className="p-5 flex flex-col gap-3">
          <MInput
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="I will complete..."
          />
          <MInput
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Goal art)"
          />
        </div>
      </Modal>
    </Overlay>
  );
}

function TasklistModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (title: string, tasks: string[]) => void }) {
  const [title, setTitle] = useState('Tasks to be complete today :');
  const [tasks, setTasks] = useState(['']);
  return (
    <Overlay>
      <Modal
        title="Task List"
        icon={<ListTodo className="w-3.5 h-3.5 text-[#FF5C35]" />}
        onClose={onClose}
        footer={
          <>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <OrangeBtn
              disabled={tasks.every((t) => !t.trim())}
              onClick={() => {
                onAdd(
                  title,
                  tasks.filter((t) => t.trim()),
                );
                onClose();
              }}
            >
              Add list
            </OrangeBtn>
          </>
        }
      >
        <div className="p-5 flex flex-col gap-3">
          <MInput value={title} onChange={(e) => setTitle(e.target.value)} />
          {tasks.map((t, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: simple tasks list
            <div key={`task-${i}`} className="flex gap-2 items-center">
              <MInput
                value={t}
                onChange={(e) => {
                  const n = [...tasks];
                  n[i] = e.target.value;
                  setTasks(n);
                }}
                placeholder={`Task ${i + 1}`}
                className="flex-1"
              />
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTasks(tasks.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTasks([...tasks, ''])}
            className="flex items-center gap-1 text-[#FF5C35] text-xs hover:text-[#ff6b47] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add task
          </button>
        </div>
      </Modal>
    </Overlay>
  );
}

function VoiceModal({
  onClose,
  onAdd,
}: { onClose: () => void; onAdd: (dataUrl: string, duration: number) => void }) {
  const { recording, elapsed, start, stop } = useVoiceRecorder((dataUrl, duration) => {
    onAdd(dataUrl, duration);
    onClose();
  });

  return (
    <Overlay>
      <div className="bg-[#1C1C1C]/90 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 rounded-[32px] w-[360px] py-14 flex flex-col items-center relative shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-md"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-white text-[16px] font-medium tracking-wide mb-2">Record Voice Note</p>
        <p className="text-[#D46B4E] text-[32px] font-mono font-light tracking-tight mb-10 h-10">
          {recording
            ? `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
            : '00:00'}
        </p>

        <button
          type="button"
          onClick={recording ? undefined : start}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 mb-12 ${recording ? 'bg-[#D46B4E]/10 ring-2 ring-[#D46B4E]/50 scale-105' : 'bg-black/40 hover:bg-black/60 shadow-inner ring-1 ring-white/5'}`}
        >
          <Mic
            className={`w-10 h-10 ${recording ? 'text-[#D46B4E] animate-pulse drop-shadow-[0_0_15px_rgba(212,107,78,0.8)]' : 'text-white/30'}`}
            fill="currentColor"
          />
        </button>

        <div className="flex gap-14">
          <div className="flex flex-col items-center gap-3 group">
            <button
              type="button"
              className="w-14 h-14 rounded-full bg-black/20 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <Pause className="w-5 h-5 text-white/60 group-hover:text-white" fill="currentColor" />
            </button>
            <span className="text-[11px] text-white/30 font-medium tracking-wide group-hover:text-white/60">
              PAUSE
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <button
              type="button"
              onClick={() => {
                if (recording) stop();
                else onClose();
              }}
              className="w-14 h-14 rounded-full bg-black/20 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <Square
                className="w-4 h-4 text-white/60 group-hover:text-white"
                fill="currentColor"
              />
            </button>
            <span className="text-[11px] text-white/30 font-medium tracking-wide group-hover:text-white/60">
              STOP
            </span>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK CARDS  (all inside canvas)
// ══════════════════════════════════════════════════════════════════════════════
function Card({
  children,
  onRemove,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  className = '',
}: {
  children: React.ReactNode;
  onRemove: () => void;
  index?: number;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable={!!onDragStart}
      onDragStart={onDragStart as any}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative bg-[#1e1e1e] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 group cursor-grab active:cursor-grabbing ${className}`}
    >
      {onDragStart && (
        <div className="absolute -left-5 top-2 opacity-0 group-hover:opacity-40 transition-opacity z-10 cursor-grab">
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      )}
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-[#FF5C35] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </motion.div>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] text-[#4ade80] flex items-center gap-1.5 font-medium tracking-wide">
    {children}
    <span className="flex items-center justify-center w-3 h-3 bg-[#4ade80] rounded-full">
      <Check className="w-2 h-2 text-black" strokeWidth={3.5} />
    </span>
  </span>
);

function ImageCard({
  b,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'image' }>;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const isSticker = b.isSticker || b.isGif;

  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <img
        src={isSticker ? b.dataUrl : getOptimizedImageUrl(b.dataUrl, { width: 1200 })}
        alt={b.name}
        className={
          isSticker
            ? 'w-auto max-w-[180px] h-auto object-contain mx-auto drop-shadow-lg hover:scale-105 transition-transform'
            : 'w-full h-auto rounded-[16px] shadow-sm'
        }
      />
      {!isSticker && (
        <div className="flex justify-between items-center w-full px-1">
          <span className="text-[10px] text-white/40 max-w-[120px] truncate">{b.name}</span>
          <Badge>Image added</Badge>
        </div>
      )}
    </Card>
  );
}

function VoiceCard({
  b,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'voice' }>;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  useEffect(() => {
    const a = new Audio(b.dataUrl);
    audioRef.current = a;
    a.addEventListener('ended', () => {
      setPlaying(false);
      setProg(0);
    });
    a.addEventListener('timeupdate', () => setProg((a.currentTime / (a.duration || 1)) * 100));
    return () => a.pause();
  }, [b.dataUrl]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };
  const bars = Array.from({ length: 38 }, (_, i) =>
    Math.min(100, 18 + Math.abs(Math.sin(i * 0.8 + 1) * 55 + Math.cos(i * 0.35) * 25)),
  );

  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-[16px] border border-white/5">
        <button
          type="button"
          onClick={toggle}
          className="w-8 h-8 rounded-full bg-[#FF5C35] flex items-center justify-center flex-shrink-0 hover:bg-[#ff6b47] transition-colors shadow-lg"
        >
          {playing ? (
            <Pause className="w-4 h-4 text-white" fill="white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          )}
        </button>
        <div className="flex items-end gap-[1.5px] flex-1 h-8">
          {bars.map((h, i) => {
            return (
              <div
                key={`bar-${i}`}
                className="flex-1 rounded-full transition-colors"
                style={{
                  height: `${h}%`,
                  backgroundColor:
                    i / bars.length <= prog / 100 ? '#FF5C35' : 'rgba(255,255,255,0.1)',
                }}
              />
            );
          })}
        </div>
        <span className="text-slate-400 text-[11px] font-mono">{fmt(b.duration)}</span>
      </div>
      <div className="flex items-center justify-end px-1 mt-1">
        <Badge>Voice note added</Badge>
      </div>
    </Card>
  );
}

function DoodleCard({
  b,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'doodle' }>;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <img
        src={b.dataUrl}
        alt="doodle"
        className="w-full h-auto max-h-48 object-contain drop-shadow-2xl"
      />
      <div className="flex justify-center w-full px-1">
        <Badge>Doodle added</Badge>
      </div>
    </Card>
  );
}

function GoalCard({
  b,
  onUpdate,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'goal' }>;
  onUpdate: (x: Block) => void;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (b.running) {
      intervalRef.current = setInterval(() => onUpdate({ ...b, seconds: b.seconds + 1 }), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [b.running, b.seconds]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}: ${String(m).padStart(2, '0')}: ${String(sec).padStart(2, '0')}`;
  };
  const now = new Date();
  const ampm = now.getHours() >= 12 ? 'pm' : 'am';

  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <div className="flex flex-col gap-3 group/goal">
        <div className="inline-flex items-center border border-white/60 rounded-full px-5 py-2 text-white/90 text-[13px] font-light w-max max-w-full">
          <span className="truncate">{b.goal}</span>
        </div>

        <div className="flex items-baseline gap-2 relative">
          <span className="text-[#FF5C35] text-[32px] font-light tracking-tight tabular-nums">
            {fmt(b.seconds)}
          </span>
          <span className="text-[#FF5C35]/60 text-sm">{ampm}</span>

          {/* Floating controls that appear on hover */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/goal:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onUpdate({ ...b, running: !b.running })}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 transition-colors"
            >
              {b.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ ...b, seconds: 0, running: false })}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Badge>Goal set</Badge>
      </div>
    </Card>
  );
}

function TasklistCard({
  b,
  onUpdate,
  onRemove,
  className = '',
  ...dragProps
}: {
  b: Extract<Block, { type: 'tasklist' }>;
  onUpdate: (x: Block) => void;
  onRemove: () => void;
  className?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const toggle = (tid: string) =>
    onUpdate({ ...b, tasks: b.tasks.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)) });
  return (
    <Card className={className} onRemove={onRemove} {...dragProps}>
      <div className="flex flex-col gap-3">
        <p className="text-white/80 text-[14px] font-light tracking-wide">{b.title}</p>
        <div className="flex flex-col gap-2.5">
          {b.tasks.map((task) => (
            <button
              type="button"
              key={task.id}
              onClick={() => toggle(task.id)}
              className="flex items-center gap-3 text-left group/t w-max"
            >
              <div
                className={`w-[14px] h-[14px] rounded-[3px] flex items-center justify-center flex-shrink-0 border transition-colors ${task.done ? 'bg-transparent border-[#FF5C35]' : 'border-[#FF5C35] bg-transparent'}`}
              >
                {task.done && <Check className="w-3 h-3 text-[#FF5C35]" strokeWidth={4} />}
              </div>
              <span
                className={`text-[13px] font-light transition-colors ${task.done ? 'text-white/30 line-through' : 'text-white/90'}`}
              >
                {task.text}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-1">
          <Badge>Tasks added</Badge>
        </div>
      </div>
    </Card>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function ToolBtn({
  icon,
  label,
  count,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-xl border border-white/[0.08] group ${active ? 'bg-red-500/10 border-red-500/30' : 'bg-[#1a1a1a] hover:bg-[#222] hover:scale-105'}`}
    >
      {icon}
      {!!count && count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF5C35] rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-[#0a0a0a]">
          {count}
        </span>
      )}
      <div className="absolute right-full mr-4 bg-[#222] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/10 flex items-center">
        {label}
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#222] rotate-45 border-t border-r border-white/10" />
      </div>
    </button>
  );
}

// ─── Voice recorder hook ──────────────────────────────────────────────────────
function useVoiceRecorder(onDone: (dataUrl: string, duration: number) => void) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const _streamRef = useRef<MediaStream | null>(null);
  const t0 = useRef(0);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const r = new FileReader();
        r.onload = (e) =>
          onDone(e.target?.result as string, Math.round((Date.now() - t0.current) / 1000));
        r.readAsDataURL(blob);
        for (const t of stream.getTracks()) t.stop();
      };
      mr.start();
      t0.current = Date.now();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      alert('Mic access denied');
    }
  };

  const stop = useCallback(() => {
    if (mrRef.current && mrRef.current.state !== 'inactive') {
      mrRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setElapsed(0);
  }, []);

  return { recording, elapsed, start, stop };
}

import { Suspense } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE (wrapped in Suspense for useSearchParams)
// ══════════════════════════════════════════════════════════════════════════════
export default function NewEntryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <NewEntryContent />
    </Suspense>
  );
}

function NewEntryContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  // ── Persisted state (text + blocks survive refresh) ────────────────────────
  const {
    textContent,
    setTextContent,
    blocks,
    setBlocks,
    hydrated,
    saveStatus,
    clearAll,
    migrateKey,
  } = usePersistedEntry(initialId);
  const [modal, setModal] = useState<null | 'image' | 'doodle' | 'goal' | 'tasklist' | 'voice'>(
    null,
  );

  // ── tRPC auto-save (syncs to DB in addition to localStorage) ──────────────
  const createMutation = trpc.private.entries.create.useMutation();
  const updateMutation = trpc.private.entries.update.useMutation();
  const createRef = useRef(createMutation.mutateAsync);
  const updateRef = useRef(updateMutation.mutateAsync);
  useEffect(() => {
    createRef.current = createMutation.mutateAsync;
  });
  useEffect(() => {
    updateRef.current = updateMutation.mutateAsync;
  });

  const [entryId, setEntryId] = useState<string | null>(initialId);
  const entryIdRef = useRef<string | null>(initialId);
  const isSaving = useRef(false);
  const dbDebounce = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    entryIdRef.current = entryId;
  }, [entryId]);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  const { data: existingEntry } = trpc.private.entries.getOne.useQuery(
    { id: initialId || '' },
    { enabled: !!initialId },
  );
  useEffect(() => {
    if (existingEntry) {
      try {
        const decompressed =
          LZString.decompressFromUTF16(existingEntry.content) || existingEntry.content;
        const parsed = JSON.parse(decompressed);
        if (parsed.textContent !== undefined) {
          if (!textContent) setTextContent(parsed.textContent || '');
          if (blocks.length === 0) setBlocks((_prev) => parsed.blocks || []);
        } else {
          if (!textContent) setTextContent(existingEntry.content || '');
        }
      } catch {
        if (!textContent) setTextContent(existingEntry.content || '');
      }
      setEntryId(existingEntry.id);
    }
  }, [existingEntry]); // eslint-disable-line

  const getUploadUrlMutation = trpc.private.entries.getUploadUrl.useMutation();
  const _updateMediaUrlMutation = trpc.private.entries.updateMediaUrl.useMutation();

  const performDbSave = useRef(async (text: string, blks: Block[], id: string | null) => {
    if (!userIdRef.current || isSaving.current) return;
    isSaving.current = true;
    try {
      // 1. Handle image uploads if needed
      const updatedBlocks = [...blks];
      let blocksChanged = false;

      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i];
        if (!block || !['image', 'voice', 'doodle'].includes(block.type)) continue;

        // At this point, we know it's one of the 3 media block types which all have a dataUrl property.
        const mediaBlock = block as { type: 'image' | 'voice' | 'doodle'; dataUrl: string };
        if (!mediaBlock.dataUrl || !mediaBlock.dataUrl.startsWith('data:')) continue;

        const blockDataUrl = mediaBlock.dataUrl;
        try {
          const tempId = id || `temp-${Date.now()}`;
          const mimePart = blockDataUrl.split(';')[0];
          const contentType =
            mimePart?.split(':')[1] ?? (block.type === 'voice' ? 'audio/webm' : 'image/png');
          const { uploadUrl, publicUrl } = await getUploadUrlMutation.mutateAsync({
            entryId: tempId,
            contentType,
          });

          const response = await fetch(blockDataUrl);
          const blob = await response.blob();

          await fetch(uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': blob.type },
          });

          // Update the specific block type carefully while keeping other props (duration, name)
          updatedBlocks[i] = { ...block, dataUrl: publicUrl } as any;
          blocksChanged = true;
        } catch (uploadErr) {
          console.error(`Failed to upload ${block.type}:`, uploadErr);
        }
      }

      if (blocksChanged) {
        setBlocks((_prev) => updatedBlocks);
      }

      const payloadString = JSON.stringify({ textContent: text, blocks: updatedBlocks });
      const payload = LZString.compressToUTF16(payloadString);

      if (!id) {
        const e = await createRef.current({ content: payload, type: 'entry' });
        setEntryId(e.id);
        entryIdRef.current = e.id;
        migrateKey(e.id);
        // Use window.history.replaceState instead of router.replace to avoid Next.js navigation flashes
        window.history.replaceState(null, '', `/home/new-entry?id=${e.id}`);
      } else {
        await updateRef.current({ id, content: payload });
      }
    } catch (err) {
      console.error('DB save failed:', err);
    } finally {
      isSaving.current = false;
    }
  });

  // DB debounce — fires 2s after last keystroke or block change
  useEffect(() => {
    if (!textContent.trim() && blocks.length === 0) return;
    if (dbDebounce.current) clearTimeout(dbDebounce.current);
    dbDebounce.current = setTimeout(
      () => performDbSave.current(textContent, blocks, entryIdRef.current),
      2000,
    );
    return () => {
      if (dbDebounce.current) clearTimeout(dbDebounce.current);
    };
  }, [textContent, blocks]);

  const handleHome = async () => {
    if (dbDebounce.current) clearTimeout(dbDebounce.current);
    if (textContent.trim() && !isSaving.current)
      await performDbSave.current(textContent, blocks, entryIdRef.current);
    router.push('/home');
  };

  // ── Block helpers (setBlocks auto-persists to localStorage) ───────────────
  const addBlock = (b: Block) => setBlocks((prev) => [...prev, b]);
  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));
  const updateBlock = (upd: Block) =>
    setBlocks((prev) => prev.map((b) => (b.id === upd.id ? upd : b)));
  const moveBlock = (fromIdx: number, toIdx: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      if (moved) next.splice(toIdx, 0, moved);
      return next;
    });
  };

  // Don't render blocks until localStorage is hydrated (avoids flash)
  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white flex flex-col relative overflow-hidden font-urbanist">
      {/* Background watermark */}
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.7] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] font-urbanist font-light leading-none text-transparent tracking-widest"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.7)',
          }}
        >
          Soouls
        </span>
      </div>

      {/* Header */}
      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center text-[22px] font-light tracking-wide">
          <button
            type="button"
            onClick={handleHome}
            className="text-white/40 hover:text-white transition-colors"
          >
            Home
          </button>
          <span className="text-[#D46B4E]">/New Entry</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status — shows localStorage save state */}
          <div className="min-w-[90px] flex justify-end">
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  key="s"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-white/40 text-xs"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="d"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                >
                  <Check className="w-3 h-3" />
                  Saved
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear all button */}
          {(blocks.length > 0 || textContent) && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear everything?')) clearAll();
              }}
              className="flex items-center gap-1.5 text-white/50 hover:text-red-400 transition-colors text-xs border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-full"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}

          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white/10"
            />
          )}
        </div>
      </header>

      {/* ── THE CANVAS PANEL ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col mt-24 pb-0 items-stretch h-full">
        <div className="flex-1 rounded-t-[32px] bg-[#0F0F0F]/60 backdrop-blur-[48px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative border-t border-white/10">
          {/* Scrollable writing + blocks — everything lives here */}
          <div className="flex-1 overflow-y-auto pt-6 px-10 pb-40 flex flex-col gap-5">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Drop new entry..."
              className="w-full bg-transparent border-none outline-none resize-none text-[28px] text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-0 focus:border-transparent focus:ring-offset-0 leading-relaxed font-light shadow-none"
              style={{ minHeight: blocks.length ? 56 : 300, boxShadow: 'none' }}
            />

            {/* All blocks */}
            {blocks.length > 0 &&
              (() => {
                const dragIdx = { current: -1 };
                const makeDragHandlers = (i: number) => ({
                  onDragStart: (e: React.DragEvent) => {
                    dragIdx.current = i;
                    e.dataTransfer.effectAllowed = 'move';
                  },
                  onDragOver: (e: React.DragEvent) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  },
                  onDrop: (e: React.DragEvent) => {
                    e.preventDefault();
                    if (dragIdx.current !== i) moveBlock(dragIdx.current, i);
                  },
                });
                return (
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 w-full [column-fill:_balance]">
                    <AnimatePresence>
                      {blocks.map((b, i) => {
                        const dh = makeDragHandlers(i);

                        return (
                          <div key={b.id} className="break-inside-avoid mb-6 group/masonry-item">
                            {b.type === 'image' && (
                              <ImageCard b={b} onRemove={() => removeBlock(b.id)} {...dh} />
                            )}
                            {b.type === 'voice' && (
                              <VoiceCard b={b} onRemove={() => removeBlock(b.id)} {...dh} />
                            )}
                            {b.type === 'doodle' && (
                              <DoodleCard b={b} onRemove={() => removeBlock(b.id)} {...dh} />
                            )}
                            {b.type === 'goal' && (
                              <GoalCard
                                b={b}
                                onUpdate={updateBlock}
                                onRemove={() => removeBlock(b.id)}
                                {...dh}
                              />
                            )}
                            {b.type === 'tasklist' && (
                              <TasklistCard
                                b={b}
                                onUpdate={updateBlock}
                                onRemove={() => removeBlock(b.id)}
                                {...dh}
                              />
                            )}
                          </div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                );
              })()}
          </div>

          {/* Floating Horizontal Toolbar fixed to the bottom right of the main panel */}
          <div className="absolute bottom-8 right-8 flex flex-col items-start gap-4 z-50">
            {/* Tooltip */}
            <div className="bg-[#1C1C1C] border border-white/5 rounded-full px-5 py-2.5 text-[14px] font-light text-white/60 relative shadow-2xl ml-8">
              Add if it helps you remember
              <div className="absolute -bottom-1.5 right-[20%] w-3 h-3 bg-[#1C1C1C] border-b border-r border-white/5 rotate-45 shadow-sm" />
            </div>

            {/* Toolbar Buttons */}
            <div className="flex items-center rounded-full border border-white/20 bg-[#1C1C1C]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
              <button
                type="button"
                onClick={() => setModal('image')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'image' && !b.isSticker && !b.isGif) ? 'text-[#D46B4E]' : 'text-white/80 hover:text-[#D46B4E]'}`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-[15px] font-light">Add image</span>
                {blocks.filter((b) => b.type === 'image' && !b.isSticker && !b.isGif).length >
                  0 && (
                  <span className="bg-[#D46B4E] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {blocks.filter((b) => b.type === 'image' && !b.isSticker && !b.isGif).length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModal('voice')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'voice') ? 'text-[#60A5FA]' : 'text-white/80 hover:text-[#60A5FA]'}`}
              >
                <Mic className="w-5 h-5" />
                <span className="text-[15px] font-light">Voice note</span>
                {blocks.filter((b) => b.type === 'voice').length > 0 && (
                  <span className="bg-[#D46B4E] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {blocks.filter((b) => b.type === 'voice').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModal('doodle')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'doodle' || (b.type === 'image' && (b.isSticker || b.isGif))) ? 'text-[#A78BFA]' : 'text-white/80 hover:text-[#A78BFA]'}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <path d="M14 2v6h6M10 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path d="m8 15 4 4 6-6" />
                </svg>
                <span className="text-[15px] font-light">Doodle</span>
                {blocks.filter(
                  (b) => b.type === 'doodle' || (b.type === 'image' && (b.isSticker || b.isGif)),
                ).length > 0 && (
                  <span className="bg-[#A78BFA] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {
                      blocks.filter(
                        (b) =>
                          b.type === 'doodle' || (b.type === 'image' && (b.isSticker || b.isGif)),
                      ).length
                    }
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModal('tasklist')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 border-r border-white/10 transition-colors group ${blocks.some((b) => b.type === 'tasklist') ? 'text-[#F59E0B]' : 'text-white/80 hover:text-[#F59E0B]'}`}
              >
                <ListTodo className="w-5 h-5" />
                <span className="text-[15px] font-light">Tasklist</span>
              </button>

              <button
                type="button"
                onClick={() => setModal('goal')}
                className={`flex items-center gap-2.5 px-6 py-4 hover:bg-white/5 transition-colors group ${blocks.some((b) => b.type === 'goal') ? 'text-[#34D399]' : 'text-white/80 hover:text-[#34D399]'}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5"
                >
                  <path d="M5 22h14" />
                  <path d="M5 2h14" />
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                </svg>
                <span className="text-[15px] font-light">Set time</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'image' && (
          <ImageModal
            onClose={() => setModal(null)}
            onAdd={(d, n) => addBlock({ id: uid(), type: 'image', dataUrl: d, name: n })}
          />
        )}
        {modal === 'doodle' && (
          <DoodleModal
            onClose={() => setModal(null)}
            onSave={(d) => addBlock({ id: uid(), type: 'doodle', dataUrl: d })}
            onSaveImage={(d, n, isS, isG) =>
              addBlock({
                id: uid(),
                type: 'image',
                dataUrl: d,
                name: n,
                isSticker: isS,
                isGif: isG,
              })
            }
            onAppendText={(t) => setTextContent((prev) => prev + t)}
          />
        )}
        {modal === 'goal' && (
          <GoalModal
            onClose={() => setModal(null)}
            onAdd={(goal, label) =>
              addBlock({ id: uid(), type: 'goal', goal, label, seconds: 0, running: true })
            }
          />
        )}
        {modal === 'tasklist' && (
          <TasklistModal
            onClose={() => setModal(null)}
            onAdd={(title, tasks) =>
              addBlock({
                id: uid(),
                type: 'tasklist',
                title,
                tasks: tasks.map((t) => ({ id: uid(), text: t, done: false })),
              })
            }
          />
        )}
        {modal === 'voice' && (
          <VoiceModal
            onClose={() => setModal(null)}
            onAdd={(u, d) => addBlock({ id: uid(), type: 'voice', dataUrl: u, duration: d })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
