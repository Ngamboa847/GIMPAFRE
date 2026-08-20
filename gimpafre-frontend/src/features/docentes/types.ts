export type DocenteEstado = "ACTIVO" | "INACTIVO";

export interface Docente {
  idDocente: number;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono?: string;
  correo?: string;
  formacionAcademica?: string;
  estado: DocenteEstado;
}