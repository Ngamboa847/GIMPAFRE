import { apiRequest } from "../../../shared/api/client";
import type { Grupo } from "./types";

// GET /api/grupos
export function listarGrupos(): Promise<Grupo[]> {
  return apiRequest<Grupo[]>("/api/grupos");
}

// GET /api/grupos/grado/{idGrado}/ano-lectivo/{idAnoLectivo}
export function listarGruposPorGradoYAno(
  idGrado: number,
  idAnoLectivo: number
): Promise<Grupo[]> {
  return apiRequest<Grupo[]>(
    `/api/grupos/grado/${idGrado}/ano-lectivo/${idAnoLectivo}`
  );
}

// POST /api/grupos?idGrado=&idAnoLectivo=  (contrato mixto: relación por query, datos propios por body)
export function crearGrupo(
  datos: { denominacion: string; cupoMaximo: number },
  relaciones: { idGrado: number; idAnoLectivo: number }
): Promise<Grupo> {
  return apiRequest<Grupo>(
    `/api/grupos?idGrado=${relaciones.idGrado}&idAnoLectivo=${relaciones.idAnoLectivo}`,
    { method: "POST", body: datos }
  );
}

// PUT /api/grupos/{id} — body = Grupo completo (no hay query params para relaciones aquí)
export function actualizarGrupo(id: number, datos: Grupo): Promise<Grupo> {
  return apiRequest<Grupo>(`/api/grupos/${id}`, { method: "PUT", body: datos });
}

// DELETE /api/grupos/{id}
export function eliminarGrupo(id: number): Promise<void> {
  return apiRequest<void>(`/api/grupos/${id}`, { method: "DELETE" });
}