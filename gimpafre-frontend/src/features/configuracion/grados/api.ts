import { apiRequest } from "../../../shared/api/client";
import type { Grado } from "./types";

// GET /api/grados
export function listarGrados(): Promise<Grado[]> {
  return apiRequest<Grado[]>("/api/grados");
}

// POST /api/grados
export function crearGrado(datos: Omit<Grado, "idGrado">): Promise<Grado> {
  return apiRequest<Grado>("/api/grados", { method: "POST", body: datos });
}

// PUT /api/grados/{id}
export function actualizarGrado(id: number, datos: Omit<Grado, "idGrado">): Promise<Grado> {
  return apiRequest<Grado>(`/api/grados/${id}`, { method: "PUT", body: datos });
}

// DELETE /api/grados/{id}
export function eliminarGrado(id: number): Promise<void> {
  return apiRequest<void>(`/api/grados/${id}`, { method: "DELETE" });
}