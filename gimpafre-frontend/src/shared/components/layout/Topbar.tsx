import { useLocation } from "react-router";
import { navItems } from "./navItems";

// Deriva el título de la página desde la ruta actual.
function useTituloPagina(): string {
  const { pathname } = useLocation();
  const item = navItems.find((n) =>
    n.path === "/" ? pathname === "/" : pathname.startsWith(n.path)
  );
  return item?.label ?? "GIMPAFRE";
}

export function Topbar() {
  const titulo = useTituloPagina();

  return (
    <header className="h-16 bg-surface-container-lowest border-b border-border-subtle flex justify-between items-center px-gutter sticky top-0 z-40">
      <h1 className="font-headline text-[18px] font-semibold text-sidebar-bg">
        {titulo}
      </h1>
      <div className="flex items-center gap-6">
        {/* Selector de año lectivo (visual por ahora) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-border-subtle">
          <span className="text-[12px] text-text-muted uppercase">Ciclo:</span>
          <span className="text-[14px] font-semibold text-on-primary-fixed">
            Año lectivo 2026
          </span>
          <span className="material-symbols-outlined text-text-muted text-lg">
            expand_more
          </span>
        </div>
        {/* Notificaciones (visual por ahora) */}
        <button className="relative p-2 rounded-full hover:bg-surface-container transition-colors text-text-muted">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}