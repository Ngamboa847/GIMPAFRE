import type { AnoLectivo } from "../anos-lectivos/types";

export interface Periodo {
  idPeriodo: number;
  anoLectivo: AnoLectivo;
  numero: number;
  denominacion: string;
  fechaInicio: string;
  fechaFin: string;
  porcentaje: number;
  estado: string;
}