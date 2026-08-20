export type CuentaUsuarioEstado = "ACTIVO" | "INACTIVO";

// Response del backend (GET listar/obtener, y también lo que devuelve POST/PUT).
export interface CuentaUsuario {
  idCuentaUsuario: number;
  nombreUsuario: string;
  estado: CuentaUsuarioEstado;
  fechaCreacion: string; // LocalDate del backend, formato "YYYY-MM-DD"
  idRol: number;
  rolDenominacion: string;
  idDocente?: number;
  idEstudiante?: number;
}

// Body de creación (POST). A diferencia de Docente, el backend NO tiene un PUT
// de objeto completo para CuentaUsuario — el PUT solo acepta { estado } (ver api.ts).
// Por eso este tipo no se reutiliza como "borrador" de edición, solo para crear.
export interface CuentaUsuarioNueva {
  nombreUsuario: string;
  credenciales: string;
  idRol: number;
  idDocente?: number;
  idEstudiante?: number;
}