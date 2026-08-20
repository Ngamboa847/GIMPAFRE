import { apiRequest } from "../../shared/api/client";
import type { Area, Asignatura, PlanEstudios, AsignacionDocente } from "./types";
 
// Shortcut: solo lectura, mismo patrón de listarDocentes()/listarGrupos()
// que ya usa el resto del frontend.
 
export function listarAreas(): Promise<Area[]> {
  return apiRequest<Area[]>("/api/areas");
}
 
export function listarAsignaturas(): Promise<Asignatura[]> {
  return apiRequest<Asignatura[]>("/api/asignaturas");
}
 
export function listarPlanEstudios(): Promise<PlanEstudios[]> {
  return apiRequest<PlanEstudios[]>("/api/plan-estudios");
}
 
export function listarAsignacionesDocente(): Promise<AsignacionDocente[]> {
  return apiRequest<AsignacionDocente[]>("/api/asignaciones-docente");
}