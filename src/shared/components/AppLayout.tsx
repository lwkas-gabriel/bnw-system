import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  soon?: boolean;
}

const NAV: NavItem[] = [
  { path: "/",            label: "Início",         icon: "⚓" },
  { path: "/characters",  label: "Personagens",    icon: "⚔️" },
  { path: "/combat",      label: "Combate",        icon: "🎲" },
  { path: "/items",       label: "Itens",          icon: "🔧" },
  { path: "/ships",       label: "Embarcações",    icon: "⛵" },
  { path: "/professions", label: "Profissões",     icon: "📜" },
  { path: "/pericias",    label: "Perícias",       icon: "🧠" },
  { path: "/import",     label: "Import / Export", icon: "📦" },
];

interface Props { children: ReactNode }

export function AppLayout({ children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-4 py-5 border-b border-slate-800 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <span className="text-2xl">🏴‍☠️</span>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-500">
              BNW System
            </p>
            <p className="text-[10px] text-slate-500 tracking-wide">Character Builder</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative group",
                  isActive
                    ? "bg-amber-600/15 text-amber-400 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                ].join(" ")
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                  soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-[10px] text-slate-600 text-center">v0.5.2 — Alpha</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
