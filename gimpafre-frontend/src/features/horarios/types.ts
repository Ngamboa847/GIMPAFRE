export interface BloqueHorario {
  idBloqueHorario: number;
  idHorario: number;
  idAsignacionDocente: number;
  dia: string;
  horaInicio: string; // "HH:mm:ss"
  horaFin: string;
}
