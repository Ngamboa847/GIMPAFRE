import { apiRequest } from "../../shared/api/client";
import type { DocumentoExpedido } from "./types";

export function listarDocumentosExpedidos(): Promise<DocumentoExpedido[]> {
  return apiRequest<DocumentoExpedido[]>("/api/documentos-expedidos");
}
