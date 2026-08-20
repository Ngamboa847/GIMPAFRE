import { apiRequest } from "../../../shared/api/client";
import type { AnoLectivo } from "./types";

// GET /api/anos-lectivos
export function listarAnosLectivos(): Promise<AnoLectivo[]> {
  return apiRequest<AnoLectivo[]>("/api/anos-lectivos");
}

// POST /api/anos-lectivos
export function crearAnoLectivo(datos: Omit<AnoLectivo, "idAnoLectivo">): Promise<AnoLectivo> {
  return apiRequest<AnoLectivo>("/api/anos-lectivos", { method: "POST", body: datos });
}

// PUT /api/anos-lectivos/{id}
export function actualizarAnoLectivo(id: number, datos: Omit<AnoLectivo, "idAnoLectivo">): Promise<AnoLectivo> {
  return apiRequest<AnoLectivo>(`/api/anos-lectivos/${id}`, { method: "PUT", body: datos });
}

// DELETE /api/anos-lectivos/{id}
export function eliminarAnoLectivo(id: number): Promise<void> {
  return apiRequest<void>(`/api/anos-lectivos/${id}`, { method: "DELETE" });
}