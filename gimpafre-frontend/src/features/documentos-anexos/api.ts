import { apiRequest } from "../../shared/api/client";
import type { DocumentoAnexo, DatosDocumentoAnexo } from "./types";

// GET /api/documentos-anexos/matricula/{idMatricula}
export function listarDocumentosAnexosPorMatricula(idMatricula: number): Promise<DocumentoAnexo[]> {
  return apiRequest<DocumentoAnexo[]>(`/api/documentos-anexos/matricula/${idMatricula}`);
}

export interface CrearDocumentoAnexoParams {
  idMatricula: number;
  idTipoDocumento: number;
}

// POST /api/documentos-anexos?idMatricula=&idTipoDocumento=
export function crearDocumentoAnexo(
  datos: DatosDocumentoAnexo,
  params: CrearDocumentoAnexoParams
): Promise<DocumentoAnexo> {
  const query = new URLSearchParams({
    idMatricula: String(params.idMatricula),
    idTipoDocumento: String(params.idTipoDocumento),
  });
  return apiRequest<DocumentoAnexo>(`/api/documentos-anexos?${query.toString()}`, {
    method: "POST",
    body: datos,
  });
}

// PUT /api/documentos-anexos/{id}
export function actualizarDocumentoAnexo(id: number, datos: DatosDocumentoAnexo): Promise<DocumentoAnexo> {
  return apiRequest<DocumentoAnexo>(`/api/documentos-anexos/${id}`, {
    method: "PUT",
    body: datos,
  });
}

// DELETE /api/documentos-anexos/{id}
export function eliminarDocumentoAnexo(id: number): Promise<void> {
  return apiRequest<void>(`/api/documentos-anexos/${id}`, { method: "DELETE" });
}