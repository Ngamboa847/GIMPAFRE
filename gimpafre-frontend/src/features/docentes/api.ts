import { apiRequest } from "../../shared/api/client";
import type { Docente } from "./types";

// GET /api/docentes
export function listarDocentes(): Promise<Docente[]> {
  return apiRequest<Docente[]>("/api/docentes");
}

// GET /api/docentes/{id}
export function obtenerDocente(id: number): Promise<Docente> {
  return apiRequest<Docente>(`/api/docentes/${id}`);
}

// POST /api/docentes
export function crearDocente(datos: Omit<Docente, "idDocente">): Promise<Docente> {
  return apiRequest<Docente>("/api/docentes", { method: "POST", body: datos });
}

// PUT /api/docentes/{id}
export function actualizarDocente(id: number, datos: Omit<Docente, "idDocente">): Promise<Docente> {
  return apiRequest<Docente>(`/api/docentes/${id}`, { method: "PUT", body: datos });
}

// DELETE /api/docentes/{id}
export function eliminarDocente(id: number): Promise<void> {
  return apiRequest<void>(`/api/docentes/${id}`, { method: "DELETE" });
}