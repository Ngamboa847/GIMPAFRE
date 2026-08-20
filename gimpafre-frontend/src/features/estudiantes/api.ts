import { apiRequest, ApiError } from "../../shared/api/client";
import type { Estudiante } from "./types";

// GET /api/estudiantes/documento/{numeroDocumento}
// Devuelve el estudiante si existe, o null si el backend responde 404 (documento libre).
export async function buscarEstudiantePorDocumento(
  numeroDocumento: string
): Promise<Estudiante | null> {
  try {
    return await apiRequest<Estudiante>(
      `/api/estudiantes/documento/${encodeURIComponent(numeroDocumento)}`
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null; // documento libre → se creará
    }
    throw err; // otro error se propaga
  }
}

// GET /api/estudiantes/{id}
export function obtenerEstudiante(id: number): Promise<Estudiante> {
  return apiRequest<Estudiante>(`/api/estudiantes/${id}`);
}

// POST /api/estudiantes
export function crearEstudiante(datos: Estudiante): Promise<Estudiante> {
  return apiRequest<Estudiante>("/api/estudiantes", {
    method: "POST",
    body: datos,
  });
}

// PUT /api/estudiantes/{id}
export function actualizarEstudiante(
  id: number,
  datos: Estudiante
): Promise<Estudiante> {
  return apiRequest<Estudiante>(`/api/estudiantes/${id}`, {
    method: "PUT",
    body: datos,
  });
}