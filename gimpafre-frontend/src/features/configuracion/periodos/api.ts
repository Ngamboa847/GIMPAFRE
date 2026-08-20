import { apiRequest } from "../../../shared/api/client";
import type { Periodo } from "./types";

// GET /api/periodos
export function listarPeriodos(): Promise<Periodo[]> {
  return apiRequest<Periodo[]>("/api/periodos");
}

// GET /api/periodos/ano-lectivo/{idAnoLectivo}
export function listarPeriodosPorAnoLectivo(idAnoLectivo: number): Promise<Periodo[]> {
  return apiRequest<Periodo[]>(`/api/periodos/ano-lectivo/${idAnoLectivo}`);
}

// POST /api/periodos?idAnoLectivo=  (contrato mixto: relación por query, datos propios por body)
export function crearPeriodo(
  datos: {
    numero: number;
    denominacion: string;
    fechaInicio: string;
    fechaFin: string;
    porcentaje: number;
    estado: string;
  },
  relaciones: { idAnoLectivo: number }
): Promise<Periodo> {
  return apiRequest<Periodo>(`/api/periodos?idAnoLectivo=${relaciones.idAnoLectivo}`, {
    method: "POST",
    body: datos,
  });
}

// PUT /api/periodos/{id} — body = Periodo completo (no hay query params para la relación aquí)
export function actualizarPeriodo(id: number, datos: Periodo): Promise<Periodo> {
  return apiRequest<Periodo>(`/api/periodos/${id}`, { method: "PUT", body: datos });
}

// DELETE /api/periodos/{id}
export function eliminarPeriodo(id: number): Promise<void> {
  return apiRequest<void>(`/api/periodos/${id}`, { method: "DELETE" });
}