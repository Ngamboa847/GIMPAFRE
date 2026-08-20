import { NavLink } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { navItems } from "./navItems";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB8PPoxDLV8noSvNwwocWwYx8bGJ2ZRprsSpmwc3y9LowP4U2x6UoF-ulGXi7Z4zBmuK3bicbTYDzRMhCkW32XHBLxgigije3rIKqHBSv9sW34hK-KplUMczp_vGTM_pnvD7H1h8JscDxcMKiEvYspv0PODqSXDz3dozLXQT0HFPUitZFhUOcSkCrHkTRu3pephvgQuQJDov0Rsy1Q1EmwDmyCbyeqOs_jHOSXkmV3wb03eS88tBcKkZ41ZTeNuScz9FWRToLo3gzU";

export function Sidebar() {
  const { usuario, logout } = useAuth();

  // Filtra el menú por el rol de la cuenta autenticada. Un ítem sin 'roles' definido
  // (como "Inicio") lo ve cualquier usuario autenticado.
  const itemsVisibles = navItems.filter(
    (item) => !item.roles || (usuario && item.roles.includes(usuario.rol))
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-[250px] bg-sidebar-bg flex flex-col py-6 px-4 z-50">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <img
          alt="GIMPAFRE"
          className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
          src={LOGO_URL}
        />
        <span className="font-headline text-[18px] font-bold text-white tracking-tight">
          GIMPAFRE
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {itemsVisibles.map((item) =>
          item.disponible ? (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-body text-[14px]",
                  isActive
                    ? "bg-sidebar-active border-l-4 border-white text-white font-bold"
                    : "text-white/70 hover:text-white hover:bg-sidebar-active/50",
                ].join(" ")
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ) : (
            <div
              key={item.label}
              title="Próximamente"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 cursor-not-allowed font-body text-[14px]"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )
        )}
      </nav>

      {/* Bloque de usuario (datos reales del /me) */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined">account_circle</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white text-sm font-semibold truncate">
              {usuario?.nombreUsuario ?? "—"}
            </span>
            <span className="text-white/50 text-xs truncate">
              {usuario?.rolDenominacion ?? ""}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-red-900/30 transition-colors"
        >
          <span className="text-sm font-medium">Cerrar Sesión</span>
          <span className="material-symbols-outlined text-sm">logout</span>
        </button>
      </div>
    </aside>
  );
}