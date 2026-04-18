import { useState } from "react";
import type { ValidationReport, ValidationIssue, ValidationSeverity } from "../utils/validator";
import type { Character } from "../../../shared/types/character";

// ─── Severity styles ──────────────────────────────────────────────────────────

const SEV_STYLES: Record<ValidationSeverity, {
  bg: string; border: string; icon: string; label: string; textColor: string;
}> = {
  error:   { bg: "bg-red-950/40",    border: "border-red-800/60",   icon: "✕", label: "Erro",    textColor: "text-red-400" },
  warning: { bg: "bg-amber-950/30",  border: "border-amber-800/50", icon: "!", label: "Aviso",   textColor: "text-amber-400" },
  info:    { bg: "bg-blue-950/30",   border: "border-blue-800/40",  icon: "i", label: "Info",    textColor: "text-blue-400" },
};

// ─── Single issue card ────────────────────────────────────────────────────────

function IssueCard({ issue, onAutoFix }: {
  issue: ValidationIssue;
  onAutoFix?: () => void;
}) {
  const [showFix, setShowFix] = useState(false);
  const s = SEV_STYLES[issue.severity];

  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-3`}>
      <div className="flex items-start gap-2">
        <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${s.textColor} bg-current/10`}>
          {s.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${s.textColor}`}>{issue.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{issue.description}</p>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setShowFix(!showFix)}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              {showFix ? "▲ Ocultar sugestão" : "▼ Como corrigir"}
            </button>
            {issue.autoFix && onAutoFix && (
              <button
                onClick={onAutoFix}
                className="text-[10px] font-semibold text-green-400 hover:text-green-300 transition-colors bg-green-900/30 px-2 py-0.5 rounded-full"
              >
                ⚡ Corrigir automaticamente
              </button>
            )}
          </div>

          {showFix && (
            <div className="mt-2 p-2 bg-slate-900/60 rounded-lg border border-slate-700">
              <p className="text-[11px] text-slate-300 leading-relaxed">{issue.fix}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Validation Panel ──────────────────────────────────────────────────────────

interface ValidationPanelProps {
  report: ValidationReport;
  compact?: boolean;
  onAutoFix?: (autoFixer: (char: Character) => Character) => void;
}

export function ValidationPanel({ report, compact = false, onAutoFix }: ValidationPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (report.isValid && !report.hasWarnings && report.infoCount === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-950/30 border border-green-800/40 rounded-xl">
        <span className="text-green-400 text-sm">✓</span>
        <p className="text-xs text-green-400 font-medium">Ficha válida — sem problemas encontrados.</p>
      </div>
    );
  }

  // Summary bar
  const summary = (
    <div className="flex items-center gap-3 flex-wrap">
      {report.errorCount > 0 && (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/50 px-2.5 py-1 rounded-full">
          ✕ {report.errorCount} erro{report.errorCount !== 1 ? "s" : ""}
        </span>
      )}
      {report.warningCount > 0 && (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/50 px-2.5 py-1 rounded-full">
          ! {report.warningCount} aviso{report.warningCount !== 1 ? "s" : ""}
        </span>
      )}
      {report.infoCount > 0 && (
        <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-950/30 border border-blue-800/40 px-2.5 py-1 rounded-full">
          i {report.infoCount} info{report.infoCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        {summary}
        {report.issues.filter(i => i.severity === "error").map(issue => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onAutoFix={issue.autoFix && onAutoFix ? () => onAutoFix(issue.autoFix!) : undefined}
          />
        ))}
        {report.warningCount > 0 && report.errorCount === 0 && (
          report.issues.filter(i => i.severity === "warning").map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onAutoFix={issue.autoFix && onAutoFix ? () => onAutoFix(issue.autoFix!) : undefined}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary}

      {Object.entries(report.byCategory).map(([category, issues]) => {
        const errorCount   = issues.filter(i => i.severity === "error").length;
        const warningCount = issues.filter(i => i.severity === "warning").length;
        const isExpanded   = expandedCategory === category;
        const hasErrors    = errorCount > 0;

        return (
          <div key={category} className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category)}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                hasErrors ? "bg-red-950/20 hover:bg-red-950/30" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">{category}</span>
                <div className="flex gap-1">
                  {errorCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-900/60 text-red-400 border border-red-800">
                      {errorCount}✕
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-900/50 text-amber-400 border border-amber-800">
                      {warningCount}!
                    </span>
                  )}
                </div>
              </div>
              <span className="text-slate-600 text-sm transition-transform" style={{ transform: isExpanded ? "rotate(90deg)" : "none" }}>
                ›
              </span>
            </button>

            {isExpanded && (
              <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
                {issues.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onAutoFix={issue.autoFix && onAutoFix ? () => onAutoFix(issue.autoFix!) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Inline validation badge (for builder header) ─────────────────────────────

export function ValidationBadge({ report, onClick }: {
  report: ValidationReport | null;
  onClick?: () => void;
}) {
  if (!report) return null;

  if (report.isValid && !report.hasWarnings) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-950/30 border border-green-800/40 px-2 py-0.5 rounded-full cursor-default">
        ✓ Válido
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
        report.errorCount > 0
          ? "text-red-400 bg-red-950/40 border-red-800/50 hover:bg-red-950/60"
          : "text-amber-400 bg-amber-950/30 border-amber-800/50 hover:bg-amber-950/50"
      }`}
    >
      {report.errorCount > 0 ? `✕ ${report.errorCount} erro${report.errorCount !== 1 ? "s" : ""}` : `! ${report.warningCount} aviso${report.warningCount !== 1 ? "s" : ""}`}
    </button>
  );
}
