export interface DocumentoExpedido {
  idDocumentoExpedido: number;
  idEstudiante: number;
  idCuentaUsuario: number;
  tipo: string;
  fechaSolicitud: string; // ISO date
  fechaExpedicion: string | null;
  estado: string;
}
