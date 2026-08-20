import { apiRequest } from "../../../shared/api/client";
import type { TipoDocumento } from "./types";

// GET /api/tipos-documento
export function listarTiposDocumento(): Promise<TipoDocumento[]> {
  return apiRequest<TipoDocumento[]>("/api/tipos-documento");
}

// POST /api/tipos-documento
export function crearTipoDocumento(datos: Omit<TipoDocumento, "idTipoDocumento">): Promise<TipoDocumento> {
  return apiRequest<TipoDocumento>("/api/tipos-documento", { method: "POST", body: datos });
}

// PUT /api/tipos-documento/{id}
export function actualizarTipoDocumento(id: number, datos: Omit<TipoDocumento, "idTipoDocumento">): Promise<TipoDocumento> {
  return apiRequest<TipoDocumento>(`/api/tipos-documento/${id}`, { method: "PUT", body: datos });
}

// DELETE /api/tipos-documento/{id}
export function eliminarTipoDocumento(id: number): Promise<void> {
  return apiRequest<void>(`/api/tipos-documento/${id}`, { method: "DELETE" });
}

// GET /api/tipos-documento/activos
export function listarTiposDocumentoActivos(): Promise<TipoDocumento[]> {
  return apiRequest<TipoDocumento[]>("/api/tipos-documento/activos");
}