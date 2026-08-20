export interface Asistencia {
  idAsistencia: number;
  idMatricula: number;
  idAsignacionDocente: number;
  fecha: string; // ISO date
  estado: string;
  motivo: string | null;
  soporteJustificacion: string | null;
}
