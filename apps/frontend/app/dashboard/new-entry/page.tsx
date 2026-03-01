'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check, Clock, Image as ImageIcon, ListTodo, Loader2, Mic,
  PenTool, X, Undo2, Eraser, Play, Pause, Square,
  StopCircle, Plus, Trash2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { trpc } from '../../../src/utils/trpc';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const LS_KEY = 'soulcanvas_entry_v1';

// ─── Types ────────────────────────────────────────────────────────────────────
type Block =
  | { id: string; type: 'image';    dataUrl: string; name: string }
  | { id: string; type: 'voice';    dataUrl: string; duration: number }
  | { id: string; type: 'doodle';   dataUrl: string }
  | { id: string; type: 'goal';     goal: string; label: string; seconds: number; running: boolean }
  | { id: string; type: 'tasklist'; title: string; tasks: { id: string; text: string; done: boolean }[] };

interface PersistedState {
  textContent: string;
  blocks: Block[];
}

// ─── useLocalStorage hook ─────────────────────────────────────────────────────
// Reads once on mount, writes on every change. Never SSR-crashes.
function usePersistedEntry() {
  const [textContent, setTextContentRaw] = useState('');
  const [blocks, setBlocksRaw] = useState<Block[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        // Pause all goal timers on restore — user can resume manually
        const restored = parsed.blocks.map(b =>
          b.type === 'goal' ? { ...b, running: false } : b
        );
        setTextContentRaw(parsed.textContent ?? '');
        setBlocksRaw(restored);
      }
    } catch { /* corrupt data — ignore */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever text or blocks change
  const persist = useCallback((text: string, blks: Block[]) => {
    if (!hydrated) return;
    setSaveStatus('saving');
    clearTimeout(saveTimer.current!);
    saveTimer.current = setTimeout(() => {
      try {
        const state: PersistedState = { textContent: text, blocks: blks };
        localStorage.setItem(LS_KEY, JSON.stringify(state));
        setSaveStatus('saved');
      } catch {
        // localStorage quota exceeded (large images/audio)
        setSaveStatus('idle');
        console.warn('localStorage quota exceeded');
      }
    }, 500);
  }, [hydrated]);

  // Auto-dismiss "saved" pill after 2.5s
  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const t = setTimeout(() => setSaveStatus('idle'), 2500);
    return () => clearTimeout(t);
  }, [saveStatus]);

  // Wrapped setters that also trigger persist
  const setTextContent = useCallback((val: string) => {
    setTextContentRaw(val);
    setBlocksRaw(prev => { persist(val, prev); return prev; });
  }, [persist]);

  const setBlocks = useCallback((updater: (prev: Block[]) => Block[]) => {
    setBlocksRaw(prev => {
      const next = updater(prev);
      persist(textContent, next);
      return next;
    });
  }, [persist, textContent]);

  const clearAll = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setTextContentRaw('');
    setBlocksRaw([]);
    setSaveStatus('idle');
  }, []);

  return { textContent, setTextContent, blocks, setBlocks, hydrated, saveStatus, clearAll };
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL PRIMITIVES
// ══════════════════════════════════════════════════════════════════════════════
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {children}
    </motion.div>
  );
}
function Modal({ title, icon, onClose, extra, footer, children }: {
  title: string; icon: React.ReactNode; onClose: () => void;
  extra?: React.ReactNode; footer: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
      className="bg-[#0e0e0e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08]">
        <span className="text-white text-sm font-medium flex items-center gap-2">{icon}{title}</span>
        <div className="flex items-center gap-1">
          {extra}
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>
      {children}
      <div className="flex justify-end gap-3 px-5 py-3.5 border-t border-white/[0.08]">{footer}</div>
    </motion.div>
  );
}
const IconBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">{children}</button>
);
const GhostBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">{children}</button>
);
const OrangeBtn = ({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <button onClick={onClick} disabled={disabled} className="px-5 py-2 bg-[#FF5C35] hover:bg-[#ff6b47] disabled:opacity-30 text-white text-sm rounded-xl transition-colors font-medium">{children}</button>
);
const MInput = ({ value, onChange, placeholder, className = '' }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; className?: string }) => (
  <input value={value} onChange={onChange} placeholder={placeholder}
    className={`bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-[#FF5C35]/50 w-full ${className}`} />
);

// ══════════════════════════════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════════════════════════════
function DoodleModal({ onClose, onSave }: { onClose: () => void; onSave: (d: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const COLORS = ['#ffffff', '#FF5C35', '#f59e0b', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    const sx = c.width / r.width, sy = c.height / r.height;
    if ('touches' in e && e.touches[0]) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    const me = e as React.MouseEvent;
    return { x: (me.clientX - r.left) * sx, y: (me.clientY - r.top) * sy };
  };
  const snap = () => {
    const c = canvasRef.current!, ctx = c.getContext('2d')!;
    history.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (history.current.length > 40) history.current.shift();
  };
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); snap(); drawing.current = true;
    const p = getPos(e); last.current = p;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath(); ctx.arc(p.x, p.y, (tool === 'eraser' ? size * 3 : size) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#111' : color; ctx.fill();
  };
  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); if (!drawing.current || !last.current) return;
    const p = getPos(e); const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = tool === 'eraser' ? '#111' : color;
    ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); last.current = p;
  };
  const onUp = () => { drawing.current = false; last.current = null; };
  const undo = () => { if (!history.current.length) return; canvasRef.current!.getContext('2d')!.putImageData(history.current.pop()!, 0, 0); };
  const clearCanvas = () => { snap(); const c = canvasRef.current!, ctx = c.getContext('2d')!; ctx.fillStyle = '#111'; ctx.fillRect(0, 0, c.width, c.height); };
  useEffect(() => { const c = canvasRef.current!, ctx = c.getContext('2d')!; ctx.fillStyle = '#111'; ctx.fillRect(0, 0, c.width, c.height); }, []);

  return (
    <Overlay>
      <Modal title="Doodle" icon={<PenTool className="w-3.5 h-3.5 text-[#FF5C35]" />} onClose={onClose}
        extra={<><IconBtn onClick={undo}><Undo2 className="w-4 h-4" /></IconBtn><IconBtn onClick={clearCanvas}><Eraser className="w-4 h-4" /></IconBtn></>}
        footer={<><GhostBtn onClick={onClose}>Cancel</GhostBtn><OrangeBtn onClick={() => { onSave(canvasRef.current!.toDataURL()); onClose(); }}>Add to entry</OrangeBtn></>}>
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/5 flex-wrap">
          <div className="flex gap-1.5">{COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: c, borderColor: color === c && tool === 'pen' ? 'white' : 'transparent' }} />
          ))}</div>
          <div className="w-px h-4 bg-white/10" />
          <button onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs transition-colors ${tool === 'eraser' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Eraser className="w-3 h-3" /> Eraser
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500 text-xs">Size</span>
            <input type="range" min={1} max={24} value={size} onChange={e => setSize(+e.target.value)} className="w-20 accent-[#FF5C35]" />
          </div>
        </div>
        <canvas ref={canvasRef} width={800} height={400} className="w-full block"
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />
      </Modal>
    </Overlay>
  );
}

function ImageModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: string, n: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const load = (f: File) => {
    if (!f.type.startsWith('image/')) return; setName(f.name);
    const r = new FileReader(); r.onload = e => setPreview(e.target?.result as string); r.readAsDataURL(f);
  };
  return (
    <Overlay>
      <Modal title="Add Image" icon={<ImageIcon className="w-3.5 h-3.5 text-[#FF5C35]" />} onClose={onClose}
        footer={<><GhostBtn onClick={onClose}>Cancel</GhostBtn><OrangeBtn disabled={!preview} onClick={() => preview && (onAdd(preview, name), onClose())}>Add to entry</OrangeBtn></>}>
        <div className="p-5">
          {!preview
            ? <div onDrop={e => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]); }}
                onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                onClick={() => ref.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-14 flex flex-col items-center gap-3 cursor-pointer transition-colors ${drag ? 'border-[#FF5C35] bg-[#FF5C35]/5' : 'border-white/10 hover:border-white/20'}`}>
                <ImageIcon className="w-10 h-10 text-slate-500" />
                <p className="text-slate-400 text-sm text-center">Drop image here or <span className="text-[#FF5C35]">browse</span></p>
                <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && load(e.target.files[0])} />
              </div>
            : <div className="relative rounded-2xl overflow-hidden">
                <img src={preview} alt="preview" className="w-full max-h-60 object-contain bg-black/20" />
                <button onClick={() => { setPreview(null); setName(''); }} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg hover:bg-black/80 transition-colors"><X className="w-3.5 h-3.5 text-white" /></button>
              </div>
          }
        </div>
      </Modal>
    </Overlay>
  );
}

function GoalModal({ onClose, onAdd }: { onClose: () => void; onAdd: (goal: string, label: string) => void }) {
  const [goal, setGoal] = useState('');
  const [label, setLabel] = useState('');
  return (
    <Overlay>
      <Modal title="Set Goal & Timer" icon={<Clock className="w-3.5 h-3.5 text-[#FF5C35]" />} onClose={onClose}
        footer={<><GhostBtn onClick={onClose}>Cancel</GhostBtn><OrangeBtn disabled={!goal.trim()} onClick={() => { onAdd(goal, label); onClose(); }}>Start timer</OrangeBtn></>}>
        <div className="p-5 flex flex-col gap-3">
          <MInput value={goal} onChange={e => setGoal(e.target.value)} placeholder="I will complete..." />
          <MInput value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (e.g. Goal art)" />
        </div>
      </Modal>
    </Overlay>
  );
}

function TasklistModal({ onClose, onAdd }: { onClose: () => void; onAdd: (title: string, tasks: string[]) => void }) {
  const [title, setTitle] = useState('Tasks to be complete today :');
  const [tasks, setTasks] = useState(['']);
  return (
    <Overlay>
      <Modal title="Task List" icon={<ListTodo className="w-3.5 h-3.5 text-[#FF5C35]" />} onClose={onClose}
        footer={<><GhostBtn onClick={onClose}>Cancel</GhostBtn><OrangeBtn disabled={tasks.every(t => !t.trim())} onClick={() => { onAdd(title, tasks.filter(t => t.trim())); onClose(); }}>Add list</OrangeBtn></>}>
        <div className="p-5 flex flex-col gap-3">
          <MInput value={title} onChange={e => setTitle(e.target.value)} />
          {tasks.map((t, i) => (
            <div key={i} className="flex gap-2 items-center">
              <MInput value={t} onChange={e => { const n = [...tasks]; n[i] = e.target.value; setTasks(n); }} placeholder={`Task ${i + 1}`} className="flex-1" />
              {tasks.length > 1 && <button onClick={() => setTasks(tasks.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>}
            </div>
          ))}
          <button onClick={() => setTasks([...tasks, ''])} className="flex items-center gap-1 text-[#FF5C35] text-xs hover:text-[#ff6b47] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add task
          </button>
        </div>
      </Modal>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK CARDS  (all inside canvas)
// ══════════════════════════════════════════════════════════════════════════════
function Card({ children, onRemove, className = '' }: { children: React.ReactNode; onRemove: () => void; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className={`relative bg-[#1e1e1e] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2.5 group ${className}`}>
      {children}
      <button onClick={onRemove} className="absolute -top-2 -right-2 bg-[#FF5C35] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
        <X className="w-3 h-3 text-white" />
      </button>
    </motion.div>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
    <Check className="w-3 h-3" />{children}
  </span>
);

function ImageCard({ b, onRemove }: { b: Extract<Block, { type: 'image' }>; onRemove: () => void }) {
  return (
    <Card onRemove={onRemove}>
      <img src={b.dataUrl} alt={b.name} className="w-full h-36 object-cover rounded-xl" />
      <Badge>Image added</Badge>
    </Card>
  );
}

function VoiceCard({ b, onRemove }: { b: Extract<Block, { type: 'voice' }>; onRemove: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  useEffect(() => {
    const a = new Audio(b.dataUrl); audioRef.current = a;
    a.addEventListener('ended', () => { setPlaying(false); setProg(0); });
    a.addEventListener('timeupdate', () => setProg((a.currentTime / (a.duration || 1)) * 100));
    return () => a.pause();
  }, [b.dataUrl]);

  const toggle = () => {
    const a = audioRef.current!;
    if (playing) { a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); }
  };
  const bars = Array.from({ length: 38 }, (_, i) => Math.min(100, 18 + Math.abs(Math.sin(i * 0.8 + 1) * 55 + Math.cos(i * 0.35) * 25)));

  return (
    <Card onRemove={onRemove}>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="w-7 h-7 rounded-full bg-[#FF5C35] flex items-center justify-center flex-shrink-0 hover:bg-[#ff6b47] transition-colors">
          {playing ? <Pause className="w-3 h-3 text-white" fill="white" /> : <Play className="w-3 h-3 text-white ml-0.5" fill="white" />}
        </button>
        <div className="flex items-end gap-[1.5px] flex-1 h-7">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-full transition-colors"
              style={{ height: `${h}%`, background: i < (prog / 100) * bars.length ? '#FF5C35' : 'rgba(255,255,255,0.18)' }} />
          ))}
        </div>
        <span className="text-slate-400 text-xs">{fmt(b.duration)}</span>
      </div>
      <div className="flex items-center justify-between">
        <Badge>Voice note added</Badge>
        <span className="text-slate-600 text-[10px]">Add more</span>
      </div>
    </Card>
  );
}

function DoodleCard({ b, onRemove }: { b: Extract<Block, { type: 'doodle' }>; onRemove: () => void }) {
  return (
    <Card onRemove={onRemove}>
      <img src={b.dataUrl} alt="doodle" className="w-full h-36 object-contain rounded-xl bg-[#111]" />
      <Badge>Doodle added</Badge>
    </Card>
  );
}

function GoalCard({ b, onUpdate, onRemove }: { b: Extract<Block, { type: 'goal' }>; onUpdate: (x: Block) => void; onRemove: () => void }) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (b.running) {
      intervalRef.current = setInterval(() => onUpdate({ ...b, seconds: b.seconds + 1 }), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [b.running, b.seconds]); // eslint-disable-line

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(sec).padStart(2, '0')}`;
  };
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

  return (
    <Card onRemove={onRemove}>
      <div className="border border-white/10 rounded-xl px-3 py-2 bg-white/[0.03] text-white text-xs leading-snug">{b.goal}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-[#FF5C35] text-2xl font-mono font-bold tracking-tight">{fmt(b.seconds)}</span>
        <span className="text-slate-400 text-xs">{now}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onUpdate({ ...b, running: !b.running })} className="p-1 rounded-lg hover:bg-white/5 text-slate-300 transition-colors">
          {b.running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => onUpdate({ ...b, seconds: 0, running: false })} className="p-1 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
          <Square className="w-3 h-3" />
        </button>
        {b.label && <Badge>{b.label}</Badge>}
      </div>
    </Card>
  );
}

function TasklistCard({ b, onUpdate, onRemove }: { b: Extract<Block, { type: 'tasklist' }>; onUpdate: (x: Block) => void; onRemove: () => void }) {
  const toggle = (tid: string) => onUpdate({ ...b, tasks: b.tasks.map(t => t.id === tid ? { ...t, done: !t.done } : t) });
  const done = b.tasks.filter(t => t.done).length;
  return (
    <Card onRemove={onRemove}>
      <p className="text-white text-xs font-medium">{b.title}</p>
      <div className="flex flex-col gap-1.5">
        {b.tasks.map(task => (
          <button key={task.id} onClick={() => toggle(task.id)} className="flex items-center gap-2 text-left group/t">
            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${task.done ? 'bg-[#FF5C35] border-[#FF5C35]' : 'border-white/20 group-hover/t:border-white/40'}`}>
              {task.done && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-xs transition-colors ${task.done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task.text}</span>
          </button>
        ))}
      </div>
      <Badge>{done}/{b.tasks.length} Tasks added</Badge>
    </Card>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function ToolBtn({ icon, label, count, onClick, active }: {
  icon: React.ReactNode; label: string; count?: number; onClick: () => void; active?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-5 py-4 transition-colors text-sm whitespace-nowrap flex-1 justify-center ${active ? 'bg-red-500/[0.08] text-red-400' : 'hover:bg-white/5 text-slate-300'}`}>
      {icon}
      <span>{label}</span>
      {!!count && count > 0 && (
        <span className="w-4 h-4 bg-[#FF5C35] rounded-full text-[9px] flex items-center justify-center text-white font-bold">{count}</span>
      )}
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
  const t0 = useRef(0);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream); mrRef.current = mr; chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const r = new FileReader();
        r.onload = e => onDone(e.target?.result as string, Math.round((Date.now() - t0.current) / 1000));
        r.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(); t0.current = Date.now(); setRecording(true); setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch { alert('Mic access denied'); }
  };

  const stop = () => {
    mrRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false); setElapsed(0);
  };

  return { recording, elapsed, start, stop };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function NewEntryPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  // ── Persisted state (text + blocks survive refresh) ────────────────────────
  const { textContent, setTextContent, blocks, setBlocks, hydrated, saveStatus, clearAll } = usePersistedEntry();
  const [modal, setModal] = useState<null | 'image' | 'doodle' | 'goal' | 'tasklist'>(null);

  // ── tRPC auto-save (syncs to DB in addition to localStorage) ──────────────
  const createMutation = trpc.createEntry.useMutation();
  const updateMutation = trpc.updateEntry.useMutation();
  const createRef = useRef(createMutation.mutateAsync);
  const updateRef = useRef(updateMutation.mutateAsync);
  useEffect(() => { createRef.current = createMutation.mutateAsync; });
  useEffect(() => { updateRef.current = updateMutation.mutateAsync; });

  const [entryId, setEntryId] = useState<string | null>(initialId);
  const entryIdRef = useRef<string | null>(initialId);
  const isSaving = useRef(false);
  const dbDebounce = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);
  useEffect(() => { entryIdRef.current = entryId; }, [entryId]);
  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  const { data: existingEntry } = trpc.getEntry.useQuery({ id: initialId! }, { enabled: !!initialId });
  useEffect(() => {
    // Only pull from DB if localStorage had nothing
    if (existingEntry && !textContent) {
      setTextContent(existingEntry.content || '');
      setEntryId(existingEntry.id);
    }
  }, [existingEntry]); // eslint-disable-line

  const performDbSave = useRef(async (text: string, id: string | null) => {
    if (!text.trim() || !userIdRef.current || isSaving.current) return;
    isSaving.current = true;
    try {
      if (!id) {
        const e = await createRef.current({ content: text, type: 'entry' });
        setEntryId(e.id); entryIdRef.current = e.id;
      } else {
        await updateRef.current({ id, content: text });
      }
    } catch (err) { console.error('DB save failed:', err); }
    finally { isSaving.current = false; }
  });

  // DB debounce — fires 2s after last keystroke
  useEffect(() => {
    if (!textContent.trim()) return;
    if (dbDebounce.current) clearTimeout(dbDebounce.current);
    dbDebounce.current = setTimeout(() => performDbSave.current(textContent, entryIdRef.current), 2000);
    return () => { if (dbDebounce.current) clearTimeout(dbDebounce.current); };
  }, [textContent]);

  const handleHome = async () => {
    if (dbDebounce.current) clearTimeout(dbDebounce.current);
    if (textContent.trim() && !isSaving.current) await performDbSave.current(textContent, entryIdRef.current);
    router.push('/dashboard');
  };

  // ── Block helpers (setBlocks auto-persists to localStorage) ───────────────
  const addBlock    = (b: Block)   => setBlocks(prev => [...prev, b]);
  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));
  const updateBlock = (upd: Block) => setBlocks(prev => prev.map(b => b.id === upd.id ? upd : b));

  const { recording, elapsed, start: startRec, stop: stopRec } = useVoiceRecorder(
    (dataUrl, duration) => addBlock({ id: uid(), type: 'voice', dataUrl, duration })
  );

  // Don't render blocks until localStorage is hydrated (avoids flash)
  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Background watermark */}
      <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-35 select-none z-0 overflow-hidden whitespace-nowrap">
        <span className="text-[22vw] leading-none text-transparent tracking-tighter"
          style={{ fontFamily: "'Playfair Display', serif", WebkitTextStroke: '1.5px rgba(255,255,255,0.55)' }}>
          Soulcanvas
        </span>
      </div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-1 text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
          <button onClick={handleHome} className="text-slate-500 hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer text-base">Home</button>
          <span className="text-slate-600">/</span>
          <span className="text-[#FF5C35] text-base">New Entry</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status — shows localStorage save state */}
          <div className="min-w-[90px] flex justify-end">
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />Saving...
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div key="d" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <Check className="w-3 h-3" />Saved
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear all button */}
          {(blocks.length > 0 || textContent) && (
            <button onClick={() => { if (confirm('Sab kuch clear kar dein?')) clearAll(); }}
              className="flex items-center gap-1.5 text-slate-600 hover:text-red-400 transition-colors text-xs border border-white/[0.06] hover:border-red-400/30 px-3 py-1.5 rounded-full">
              <Trash2 className="w-3 h-3" />Clear
            </button>
          )}

          {user?.imageUrl && <img src={user.imageUrl} alt="Profile" className="w-9 h-9 rounded-full border border-white/10" />}
        </div>
      </header>

      {/* ── THE CANVAS PANEL ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 relative z-10 flex flex-col mt-14 pb-8">
        <div className="flex-1 rounded-[28px] bg-[#141414] border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden">

          {/* Scrollable writing + blocks — everything lives here */}
          <div className="flex-1 overflow-y-auto p-7 flex flex-col gap-5" style={{ minHeight: 380 }}>

            <textarea
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              placeholder="Drop new entry..."
              className="w-full bg-transparent border-none outline-none resize-none text-xl text-white placeholder:text-slate-600 focus:ring-0 leading-relaxed font-light"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: blocks.length ? 56 : 220 }}
            />

            {/* All blocks — inside canvas, restored from localStorage on refresh */}
            {blocks.length > 0 && (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
                <AnimatePresence>
                  {blocks.map(b => {
                    if (b.type === 'image')    return <ImageCard    key={b.id} b={b} onRemove={() => removeBlock(b.id)} />;
                    if (b.type === 'voice')    return <VoiceCard    key={b.id} b={b} onRemove={() => removeBlock(b.id)} />;
                    if (b.type === 'doodle')   return <DoodleCard   key={b.id} b={b} onRemove={() => removeBlock(b.id)} />;
                    if (b.type === 'goal')     return <GoalCard     key={b.id} b={b} onUpdate={updateBlock} onRemove={() => removeBlock(b.id)} />;
                    if (b.type === 'tasklist') return <TasklistCard key={b.id} b={b} onUpdate={updateBlock} onRemove={() => removeBlock(b.id)} />;
                    return null;
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Tooltip */}
          <div className="flex justify-center py-3 border-t border-white/[0.04]">
            <span className="bg-[#1e1e1e] border border-white/[0.08] text-slate-400 text-xs px-4 py-1.5 rounded-full select-none">
              Add if it helps you remember
            </span>
          </div>

          {/* Toolbar */}
          <div className="border-t border-white/[0.06] flex items-stretch divide-x divide-white/[0.06]">
            <ToolBtn icon={<ImageIcon className="w-4 h-4 text-[#FF5C35]" />} label="Add image"
              count={blocks.filter(b => b.type === 'image').length} onClick={() => setModal('image')} />
            <ToolBtn
              icon={recording ? <StopCircle className="w-4 h-4 text-red-400 animate-pulse" /> : <Mic className="w-4 h-4 text-[#FF5C35]" />}
              label={recording ? `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '00')}` : 'Voice note'}
              count={!recording ? blocks.filter(b => b.type === 'voice').length : 0}
              onClick={recording ? stopRec : startRec} active={recording} />
            <ToolBtn icon={<PenTool className="w-4 h-4 text-[#FF5C35]" />} label="Doodle"
              count={blocks.filter(b => b.type === 'doodle').length} onClick={() => setModal('doodle')} />
            <ToolBtn icon={<ListTodo className="w-4 h-4 text-[#FF5C35]" />} label="Tasklist"
              count={blocks.filter(b => b.type === 'tasklist').length} onClick={() => setModal('tasklist')} />
            <ToolBtn icon={<Clock className="w-4 h-4 text-[#FF5C35]" />} label="Set time"
              count={blocks.filter(b => b.type === 'goal').length} onClick={() => setModal('goal')} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'image'    && <ImageModal    onClose={() => setModal(null)} onAdd={(d, n) => addBlock({ id: uid(), type: 'image', dataUrl: d, name: n })} />}
        {modal === 'doodle'   && <DoodleModal   onClose={() => setModal(null)} onSave={d => addBlock({ id: uid(), type: 'doodle', dataUrl: d })} />}
        {modal === 'goal'     && <GoalModal     onClose={() => setModal(null)} onAdd={(goal, label) => addBlock({ id: uid(), type: 'goal', goal, label, seconds: 0, running: true })} />}
        {modal === 'tasklist' && <TasklistModal onClose={() => setModal(null)} onAdd={(title, tasks) => addBlock({ id: uid(), type: 'tasklist', title, tasks: tasks.map(t => ({ id: uid(), text: t, done: false })) })} />}
      </AnimatePresence>
    </div>
  );
}