// Configuración de la navegación del sidebar.
// 'disponible: false' → ítem visible pero bloqueado (vista aún no implementada en el MVP).
// 'roles' → códigos de Rol que pueden ver este ítem. Si se omite, lo ve cualquier
// usuario autenticado (caso de "Inicio"). Basado en la matriz de permisos del SRS
// (TRASPASO_MVP_Backend_Cap3.md §4.2), con ADMIN haciendo de "Encargado de Sistemas"
// y ESTUDIANTE de "Acudiente/Estudiante".
// Cuando una vista se active, basta cambiar su 'disponible' a true y asignar su 'path'.

export interface NavItem {
  label: string;
  icon: string; // nombre del icono Material Symbols
  path: string;
  disponible: boolean;
  roles?: string[];
}

export const navItems: NavItem[] = [
  { label: "Inicio", icon: "dashboard", path: "/", disponible: true },
  {
    label: "Matrículas",
    icon: "how_to_reg",
    path: "/matriculas",
    disponible: true,
    roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "COORD_CONVIVENCIA", "PSICOORIENTACION"],
  },
  {
    label: "Carga Académica",
    icon: "menu_book",
    path: "/carga-academica",
    disponible: true,
    roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "DOCENTE"],
  },
  {
    label: "Horarios",
    icon: "schedule",
    path: "/horarios",
    disponible: true,
    roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "COORD_CONVIVENCIA", "DOCENTE", "ESTUDIANTE"],
  },
  {
    label: "Calificaciones y Asistencia",
    icon: "grade",
    path: "/calificaciones",
    disponible: true,
    roles: ["ADMIN", "COORD_ACADEMICO", "DOCENTE", "ESTUDIANTE"],
  },
  {
    label: "Certificados",
    icon: "assignment_turned_in",
    path: "/certificados",
    disponible: true,
    roles: ["ADMIN", "RECTORA"],
  },
  {
    label: "Configuración",
    icon: "settings",
    path: "/configuracion",
    disponible: true,
    roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO", "COORD_CONVIVENCIA"],
  },
  {
    label: "Docentes",
    icon: "co_present",
    path: "/docentes",
    disponible: true,
    roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO"],
  },
  {
    label: "Boletines",
    icon: "description",
    path: "/boletines",
    disponible: false,
    roles: ["ADMIN", "RECTORA", "COORD_ACADEMICO"],
  },
];