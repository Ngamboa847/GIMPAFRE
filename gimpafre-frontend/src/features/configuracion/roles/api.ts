import { apiRequest } from "../../../shared/api/client";
import type { Rol } from "./types";

// GET /api/roles
export function listarRoles(): Promise<Rol[]> {
  return apiRequest<Rol[]>("/api/roles");
}

// POST /api/roles
export function crearRol(datos: Omit<Rol, "idRol">): Promise<Rol> {
  return apiRequest<Rol>("/api/roles", { method: "POST", body: datos });
}

// PUT /api/roles/{id}
export function actualizarRol(id: number, datos: Omit<Rol, "idRol">): Promise<Rol> {
  return apiRequest<Rol>(`/api/roles/${id}`, { method: "PUT", body: datos });
}

// DELETE /api/roles/{id}
export function eliminarRol(id: number): Promise<void> {
  return apiRequest<void>(`/api/roles/${id}`, { method: "DELETE" });
}