import type { TipoDocumento } from "../configuracion/tipos-documento/types";

export type DocumentoAnexoEstado = "ENTREGADO" | "PENDIENTE";

export interface DocumentoAnexo {
  idDocumentoAnexo: number;
  tipoDocumento: TipoDocumento;
  estado: DocumentoAnexoEstado;
  fechaEntrega?: string;
  referenciaArchivo?: string;
}

export interface DatosDocumentoAnexo {
  estado: DocumentoAnexoEstado;
  fechaEntrega?: string;
  referenciaArchivo?: string;
}