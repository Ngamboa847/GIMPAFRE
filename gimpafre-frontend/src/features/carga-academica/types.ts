// Contratos de Carga Académica — vista de consulta directa (shortcut).
// Los campos id_* que referencian otras entidades (Grupo, Docente, Grado)
// se muestran crudos por ahora: no se tuvo a la vista Grupo.java/Docente.java
// /Grado.java para resolver nombres via relación JPA.

export interface Area {
  idArea: number;
  codigo: string;
  nombre: string;
}

export interface Asignatura {
  idAsignatura: number;
  idArea: number;
  codigo: string;
  nombre: string;
}

export interface PlanEstudios {
  idPlanEstudios: number;
  idAsignatura: number;
  idGrado: number;
  intensidadHorariaSemanal: number;
}

export interface AsignacionDocente {
  idAsignacionDocente: number;
  idGrupo: number;
  idPlanEstudios: number;
  idDocente: number;
  fechaAsignacion: string; // ISO date
}
