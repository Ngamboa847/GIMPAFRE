import { apiRequest } from "../../shared/api/client";
import type { CuentaUsuario, CuentaUsuarioEstado, CuentaUsuarioNueva } from "./types";

// GET /api/cuentas-usuario
export function listarCuentasUsuario(): Promise<CuentaUsuario[]> {
  return apiRequest<CuentaUsuario[]>("/api/cuentas-usuario");
}

// GET /api/cuentas-usuario/{id}
export function obtenerCuentaUsuario(id: number): Promise<CuentaUsuario> {
  return apiRequest<CuentaUsuario>(`/api/cuentas-usuario/${id}`);
}

// POST /api/cuentas-usuario
export function crearCuentaUsuario(datos: CuentaUsuarioNueva): Promise<CuentaUsuario> {
  return apiRequest<CuentaUsuario>("/api/cuentas-usuario", { method: "POST", body: datos });
}

// PUT /api/cuentas-usuario/{id} — el backend solo acepta { estado }, no el objeto
// completo (a diferencia de actualizarDocente/D-F2). No hay forma de reenviar
// nombreUsuario/idRol aquí porque el backend no los acepta en este endpoint.
export function cambiarEstadoCuentaUsuario(id: number, estado: CuentaUsuarioEstado): Promise<CuentaUsuario> {
  return apiRequest<CuentaUsuario>(`/api/cuentas-usuario/${id}`, { method: "PUT", body: { estado } });
}

// DELETE /api/cuentas-usuario/{id}
export function eliminarCuentaUsuario(id: number): Promise<void> {
  return apiRequest<void>(`/api/cuentas-usuario/${id}`, { method: "DELETE" });
}