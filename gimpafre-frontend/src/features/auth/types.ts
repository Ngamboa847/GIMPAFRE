// Contratos de autenticación — replican la forma del JSON del backend (OpenAPI).
// Reemplazo total de src/features/auth/types.ts

// POST /api/auth/login  — request
export interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

// POST /api/auth/login  — response 200
export interface LoginResponse {
  token: string;
}

// GET /api/auth/me  — response 200
export interface UsuarioAutenticado {
  idCuentaUsuario: number;
  nombreUsuario: string;
  rol: string;              // código canónico ("DOCENTE", "RECTORA"...) — para lógica de vistas
  rolDenominacion: string;  // texto presentable ("Docente") — para mostrar en UI
  estado: "ACTIVO" | "INACTIVO";
  idDocente: number | null;    // solo si rol = DOCENTE (o cuenta vinculada a un docente)
  idEstudiante: number | null; // solo si rol = ESTUDIANTE (o cuenta vinculada a un estudiante)
}
