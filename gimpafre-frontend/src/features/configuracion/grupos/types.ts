import type { Grado } from "../grados/types";
import type { AnoLectivo } from "../anos-lectivos/types";

export interface Grupo {
  idGrupo: number;
  grado: Grado;
  anoLectivo: AnoLectivo;
  denominacion: string;
  cupoMaximo: number;
}