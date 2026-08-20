import type { Estudiante } from "../estudiantes/types";

export type MatriculaEstado =
  | "TRAMITE"
  | "APROBADA"
  | "RECHAZADA"
  | "RETIRADA"
  | "ANULADA";

export interface GradoResumen {
  idGrado: number;
  nombre: string;
}

export interface GrupoResumen {
  idGrupo: number;
  denominacion: string;
}

export interface Matricula {
  idMatricula: number;
  consecutivo: string;
  fecha: string;
  tipo: string;
  estado: MatriculaEstado;
  resultadoRegistroSimat: "PENDIENTE" | "CARGADO";
  conceptoPsicopedagogico?: string;
  estudiante: Estudiante;
  grado: GradoResumen | null;
  grupo: GrupoResumen | null;
}