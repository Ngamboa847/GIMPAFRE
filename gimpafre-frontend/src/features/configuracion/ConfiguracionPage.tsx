import { useNavigate } from "react-router";

interface ItemConfiguracion {
  label: string;
  descripcion: string;
  icon: string;
  path: string;
  disponible: boolean;
}

const ITEMS: ItemConfiguracion[] = [
  { label: "Años lectivos", descripcion: "Ciclos escolares y sus fechas", icon: "calendar_month", path: "/configuracion/anos-lectivos", disponible: true },
  { label: "Períodos", descripcion: "Cortes académicos dentro de cada año lectivo", icon: "date_range", path: "/configuracion/periodos", disponible: true },
  { label: "Grados", descripcion: "Grados que ofrece la institución", icon: "school", path: "/configuracion/grados", disponible: true },
  { label: "Grupos", descripcion: "Grupos por grado y año lectivo", icon: "groups", path: "/configuracion/grupos", disponible: true },
  { label: "Roles", descripcion: "Roles del sistema y su denominación", icon: "admin_panel_settings", path: "/configuracion/roles", disponible: true },
  { label: "Cuentas de usuario", descripcion: "Cuentas de acceso al sistema y sus roles", icon: "manage_accounts", path: "/cuentas-usuario", disponible: true },
  { label: "Tipos de documento", descripcion: "Documentos anexos requeridos en matrícula", icon: "badge", path: "/configuracion/tipos-documento", disponible: true },
];

export function ConfiguracionPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-stack-md">
        <h1 className="font-headline text-[32px] font-bold text-text-main">Configuración</h1>
        <p className="font-body text-[14px] text-text-muted mt-1">Catálogos base del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((item) =>
          item.disponible ? (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="text-left bg-white rounded-lg border border-border-subtle p-stack-lg hover:border-sidebar-bg hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-sidebar-bg/10 text-sidebar-bg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h3 className="font-headline text-[16px] font-semibold text-text-main mb-1">{item.label}</h3>
              <p className="font-body text-[13px] text-text-muted">{item.descripcion}</p>
            </button>
          ) : (
            <div
              key={item.label}
              title="Próximamente"
              className="bg-white rounded-lg border border-border-subtle p-stack-lg opacity-50 cursor-not-allowed"
            >
              <div className="w-11 h-11 rounded-lg bg-surface-container-low text-text-muted flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h3 className="font-headline text-[16px] font-semibold text-text-main mb-1">{item.label}</h3>
              <p className="font-body text-[13px] text-text-muted">{item.descripcion}</p>
            </div>
          )
        )}
      </div>
    </>
  );
}