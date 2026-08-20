import type { MatriculaEstado } from "./types";

// Réplica del mapa TRANSICIONES_VALIDAS del backend (MatriculaService).
// Fuente de verdad última: el backend. Esto solo decide qué botones mostrar.
const TRANSICIONES_VALIDAS: Record<MatriculaEstado, MatriculaEstado[]> = {
  TRAMITE: ["APROBADA", "RECHAZADA", "ANULADA"],
  APROBADA: ["RETIRADA", "ANULADA"],
  RECHAZADA: [],
  RETIRADA: [],
  ANULADA: [],
};

export function transicionesValidas(estado: MatriculaEstado): MatriculaEstado[] {
  return TRANSICIONES_VALIDAS[estado] ?? [];
}

// Etiqueta del BOTÓN de acción (el verbo), distinta del nombre del estado.
const ACCION_LABEL: Record<MatriculaEstado, string> = {
  APROBADA: "Aprobar",
  RECHAZADA: "Rechazar",
  RETIRADA: "Retirar",
  ANULADA: "Anular",
  TRAMITE: "Devolver a trámite",
};

export function etiquetaAccion(estado: MatriculaEstado): string {
  return ACCION_LABEL[estado];
}

// Estilo del botón según la gravedad de la acción.
export function estiloBotonAccion(estado: MatriculaEstado): string {
  switch (estado) {
    case "APROBADA":
      return "bg-status-success text-white hover:brightness-110";
    case "RECHAZADA":
    case "ANULADA":
      return "bg-secondary text-white hover:brightness-110";
    case "RETIRADA":
      return "bg-status-warning text-white hover:brightness-110";
    default:
      return "bg-sidebar-bg text-white hover:brightness-110";
  }
}