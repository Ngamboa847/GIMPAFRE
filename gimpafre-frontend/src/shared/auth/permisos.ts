// Mapa de acceso por módulo, basado en la misma matriz de permisos que navItems.ts.
// A diferencia de navItems (que solo decide qué se ve en el sidebar), esto cubre
// TODAS las rutas de cada módulo — incluidas las que no están en el menú, como
// /matriculas/:id, /docentes/:id, /configuracion/roles o /cuentas-usuario — para que
// escribir la URL a mano no sea una forma de saltarse el control de acceso.
//
// Supuesto marcado explícitamente: se asume que UsuarioAutenticado.rol trae el
// código del rol (coincide con UsuarioAutenticadoResponseDTO.rol del backend, y con
// que Sidebar.tsx ya usa usuario.rolDenominacion del mismo objeto para el nombre).

interface ModuloRuta {
  prefijo: string;
  roles: string[];
}

const MODULOS_POR_RUTA: ModuloRuta[] = [
  { prefijo: "/matriculas", roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "COORD_CONVIVENCIA", "PSICOORIENTACION"] },
  { prefijo: "/estudiantes", roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "COORD_CONVIVENCIA", "PSICOORIENTACION"] },
  { prefijo: "/docentes", roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO"] },
  { prefijo: "/calificaciones", roles: ["ADMIN", "COORD_ACADEMICO", "DOCENTE", "ESTUDIANTE"] },
  { prefijo: "/boletines", roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO"] },
  { prefijo: "/carga-academica", roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "DOCENTE"] },
  { prefijo: "/horarios", roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "COORD_CONVIVENCIA", "DOCENTE", "ESTUDIANTE"] },
  { prefijo: "/certificados", roles: ["ADMIN", "RECTORA"] },
  { prefijo: "/configuracion", roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "COORD_CONVIVENCIA"] },
  { prefijo: "/cuentas-usuario", roles: ["ADMIN"] },
];

// null = ruta no restringida (accesible para cualquier usuario autenticado, ej. "/").
function rolesPermitidos(pathname: string): string[] | null {
  const modulo = MODULOS_POR_RUTA.find(
    (m) => pathname === m.prefijo || pathname.startsWith(m.prefijo + "/")
  );
  return modulo ? modulo.roles : null;
}

export function tieneAccesoARuta(pathname: string, rolCodigo: string | undefined): boolean {
  const roles = rolesPermitidos(pathname);
  if (!roles) return true;
  if (!rolCodigo) return false;
  return roles.includes(rolCodigo);
}