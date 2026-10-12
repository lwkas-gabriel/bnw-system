import { useRef, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import type { ImportStatus } from "../types/io";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

// ─── Spinner / PageLoader ─────────────────────────────────────────────────────
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner label="Carregando..." />
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4 lg:px-6 pt-14 lg:pt-6 pb-4 border-b border-slate-800">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-wide">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "amber";
  size?: "sm" | "md";
  children: ReactNode;
}
export function Button({ variant = "ghost", size = "md", children, className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-500 text-white",
    ghost:   "border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300",
    danger:  "bg-red-800 hover:bg-red-700 text-white",
    amber:   "border border-amber-700 hover:border-amber-500 text-amber-400 hover:bg-amber-900/20",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <input
        className={`bg-slate-800 border ${error ? "border-red-600" : "border-slate-700"} rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-600 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
}
export function Select({ label, value, onChange, options, error }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`bg-slate-800 border ${error ? "border-red-600" : "border-slate-700"} rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600 transition-colors cursor-pointer`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── StatControl ──────────────────────────────────────────────────────────────
interface StatControlProps {
  label: string;
  shortLabel: string;
  value: number;
  base: number;
  bonuses: number;
  onIncrement: () => void;
  onDecrement: () => void;
  color?: string;
}
export function StatControl({
  label, shortLabel, value, base, bonuses, onIncrement, onDecrement, color = "amber"
}: StatControlProps) {
  const colorMap: Record<string, string> = {
    amber: "border-amber-700 text-amber-400",
    blue:  "border-blue-700 text-blue-400",
    green: "border-green-700 text-green-400",
    red:   "border-red-700 text-red-400",
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{shortLabel}</span>
      <div className={`stat-bubble border-2 ${colorMap[color] ?? colorMap.amber}`}>
        <span className="text-xs text-slate-500 font-normal">{base + bonuses}</span>
        <span>{value}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrement}
          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs flex items-center justify-center transition-colors"
        >−</button>
        <span className="text-xs text-slate-500 w-4 text-center">{base}</span>
        <button
          onClick={onIncrement}
          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs flex items-center justify-center transition-colors"
        >+</button>
      </div>
      <span className="text-[10px] text-slate-600">{label}</span>
    </div>
  );
}

// ─── GemBudgetBar ─────────────────────────────────────────────────────────────
interface GemBudgetBarProps {
  spent: number;
  total: number;
}
export function GemBudgetBar({ spent, total }: GemBudgetBarProps) {
  const over = spent > total;
  return (
    <div className="flex items-center gap-3">
      <ProgressBar value={spent} max={total} barClassName={over ? "bg-red-500" : "bg-amber-500"} className="flex-1 h-2 bg-slate-800" />
      <span className={`text-xs font-mono font-bold ${over ? "text-red-400" : "text-amber-400"}`}>
        {spent}<span className="text-slate-500">/{total}g</span>
      </span>
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max: number;
  /** Cor da barra preenchida */
  barClassName?: string;
  /** Classes do trilho (altura, cor de fundo, margens) */
  className?: string;
}
export function ProgressBar({ value, max, barClassName = "bg-amber-500", className = "w-full h-2 bg-slate-700" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-300 ${barClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Switch ───────────────────────────────────────────────────────────────────
interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}
/** Interruptor liga/desliga */
export function Switch({ checked, onChange, disabled, size = "sm" }: SwitchProps) {
  const track = size === "sm" ? "w-10 h-5" : "w-12 h-6";
  const knob  = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const on    = size === "sm" ? "translate-x-5" : "translate-x-[1.375rem]";
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative ${track} rounded-full transition-colors ${checked ? "bg-amber-600" : "bg-slate-700"} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <span className={`absolute top-0.5 left-0.5 ${knob} bg-white rounded-full shadow transition-transform ${checked ? on : ""}`} />
    </button>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
interface SectionCardProps {
  title: string;
  icon?: string;
  children: ReactNode;
  action?: ReactNode;
}
export function SectionCard({ title, icon, children, action }: SectionCardProps) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Versão de uma linha para listas vazias dentro de cards */
  compact?: boolean;
}
export function EmptyState({ icon = "📋", title, description, action, compact = false }: EmptyStateProps) {
  if (compact) return <p className="text-xs text-slate-600 text-center py-4">{title}</p>;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4 opacity-40">{icon}</span>
      <p className="text-slate-400 font-medium mb-1">{title}</p>
      {description && <p className="text-sm text-slate-600 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipProps { content: string; children: ReactNode }
export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; icon?: string }[];
  active: string;
  onChange: (id: string) => void;
}
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none bg-slate-900 rounded-lg p-1 border border-slate-800">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            active === t.id
              ? "bg-amber-600 text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          {t.icon && <span>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── NumberStepper ────────────────────────────────────────────────────────────
interface NumberStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  label?: string;
}
export function NumberStepper({ value, min = 0, max = 99, onChange, label }: NumberStepperProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-slate-500">{label}</span>}
      <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-30"
        >−</button>
        <span className="w-8 text-center text-sm font-mono font-bold text-slate-200">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-30"
        >+</button>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "amber" | "green" | "red" | "blue" | "slate";
interface BadgeProps { children: ReactNode; variant?: BadgeVariant }
export function Badge({ children, variant = "slate" }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    amber: "bg-amber-900/50 text-amber-400 border-amber-800",
    green: "bg-green-900/50 text-green-400 border-green-800",
    red:   "bg-red-900/50 text-red-400 border-red-800",
    blue:  "bg-blue-900/50 text-blue-400 border-blue-800",
    slate: "bg-slate-800 text-slate-400 border-slate-700",
  };
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ─── ToggleButton / SegmentedControl ──────────────────────────────────────────
interface ToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  /** Classes do estado ativo (padrão: âmbar sólido) */
  activeClassName?: string;
}
/** Botão de escolha: âmbar quando ativo. `className` define tamanho, padding e borda. */
export function ToggleButton({
  active, activeClassName = "bg-amber-600 text-white", className = "px-2 py-1.5 rounded text-xs", children, ...props
}: ToggleButtonProps) {
  return (
    <button
      className={`transition-colors ${className} ${active ? activeClassName : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (value: T) => void;
  /** Classes de cada botão (padrão: largura igual) */
  buttonClassName?: string;
  className?: string;
}
/** Grupo de ToggleButtons com uma opção selecionada */
export function SegmentedControl<T extends string>({
  options, value, onChange, buttonClassName = "flex-1 px-2 py-1.5 rounded text-xs", className = "flex gap-1.5",
}: SegmentedControlProps<T>) {
  return (
    <div className={className}>
      {options.map(o => (
        <ToggleButton key={o.value} active={value === o.value} onClick={() => onChange(o.value)} className={buttonClassName}>
          {o.label}
        </ToggleButton>
      ))}
    </div>
  );
}

// ─── Callout ──────────────────────────────────────────────────────────────────
type CalloutTone = "amber" | "green" | "red" | "blue";
const CALLOUT_TONES: Record<CalloutTone, string> = {
  amber: "bg-amber-950/20 border-amber-800/40",
  green: "bg-green-950/30 border-green-800/40",
  red:   "bg-red-950/30 border-red-800/50",
  blue:  "bg-blue-950/30 border-blue-800/40",
};
/** Caixa de destaque (aviso, regra, sucesso). `className` define padding, cantos e margens. */
export function Callout({ tone = "amber", className = "p-3 rounded-lg", children }: { tone?: CalloutTone; className?: string; children: ReactNode }) {
  return <div className={`border ${CALLOUT_TONES[tone]} ${className}`}>{children}</div>;
}

// ─── StatTile ─────────────────────────────────────────────────────────────────
interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  /** Classes do valor (padrão: mono, slate) */
  valueClassName?: string;
  compact?: boolean;
}
/** Bloco de estatística: rótulo pequeno, valor em destaque e nota opcional */
export function StatTile({ label, value, sub, valueClassName = "text-sm font-bold font-mono text-slate-200", compact = false }: StatTileProps) {
  return (
    <div className={`bg-slate-800 rounded-lg ${compact ? "p-2" : "p-3"} text-center`}>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={valueClassName}>{value}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── CopyButton / ExportActions ───────────────────────────────────────────────
/** Botão que copia `getText()` e mostra "✓ Copiado!" por 2s */
export function CopyButton({ getText, label = "📋 Copiar JSON" }: { getText: () => string; label?: string }) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Button size="sm" variant="ghost" onClick={() => copy(getText())}>
      {copied ? "✓ Copiado!" : label}
    </Button>
  );
}

interface ExportActionsProps {
  onDownloadJSON: () => void;
  getJSON: () => string;
  onDownloadForum: () => void;
}
/** Ações padrão de export: baixar JSON, copiar JSON e baixar ficha do fórum */
export function ExportActions({ onDownloadJSON, getJSON, onDownloadForum }: ExportActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="ghost" onClick={onDownloadJSON}>⬇ JSON</Button>
      <CopyButton getText={getJSON} />
      <Button size="sm" variant="amber" onClick={onDownloadForum}>📜 Ficha Fórum (dohtml)</Button>
    </div>
  );
}

// ─── Import UI ────────────────────────────────────────────────────────────────
interface FileDropZoneProps {
  icon: string;
  label: string;
  loadingLabel: string;
  loading: boolean;
  onFile: (file: File) => void;
  accept?: string;
}
/** Área de arrastar/soltar (ou clicar) para escolher um arquivo */
export function FileDropZone({ icon, label, loadingLabel, loading, onFile, accept = ".json,.txt" }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const stateClass = loading ? "border-slate-700 bg-slate-900/50 cursor-wait"
                   : over    ? "border-amber-500 bg-amber-950/20"
                   : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30";
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-150 ${stateClass}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      {loading ? <Spinner label={loadingLabel} /> : (
        <>
          <span className="text-4xl mb-4 block opacity-40">{icon}</span>
          <p className="text-sm font-medium text-slate-300 mb-1">{label}</p>
          <p className="text-xs text-slate-500">ou clique para selecionar</p>
        </>
      )}
    </div>
  );
}

/** Separador horizontal com "ou" */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-slate-800" />
      <span className="text-xs text-slate-600">ou</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

const IMPORT_STATUS: Record<ImportStatus, { tone: CalloutTone; icon: string; text: string; color: string }> = {
  success:               { tone: "green", icon: "✓", text: "Importação bem-sucedida!", color: "text-green-400" },
  success_with_warnings: { tone: "amber", icon: "!", text: "Importado com avisos — verifique abaixo.", color: "text-amber-400" },
  error:                 { tone: "red",   icon: "✕", text: "Falha na importação.", color: "text-red-400" },
};
/** Banner com o resultado de uma importação */
export function ImportStatusBanner({ status, subtitle }: { status: ImportStatus; subtitle?: ReactNode }) {
  const s = IMPORT_STATUS[status];
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-3 ${CALLOUT_TONES[s.tone]}`}>
      <span className={`text-xl ${s.color}`}>{s.icon}</span>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${s.color}`}>{s.text}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Card com lista de mensagens (erros de leitura, avisos); não renderiza se vazia */
export function MessageList({ title, messages, tone }: { title: string; messages: string[]; tone: "red" | "amber" }) {
  if (messages.length === 0) return null;
  return (
    <div className="card space-y-1">
      <p className="text-xs font-semibold text-slate-400 mb-2">{title}</p>
      {messages.map((m, i) => (
        <p key={i} className={`text-xs font-mono ${tone === "red" ? "text-red-400" : "text-amber-400"}`}>{m}</p>
      ))}
    </div>
  );
}
