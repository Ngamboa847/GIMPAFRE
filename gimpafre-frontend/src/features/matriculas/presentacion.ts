import type { Matricula, MatriculaEstado } from "./types";
import type { Estudiante } from "../estudiantes/types";

export function nombreCompleto(e: Estudiante): string {
  return [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
    .filter(Boolean)
    .join(" ");
}

export function iniciales(e: Estudiante): string {
  return `${e.primerNombre?.[0] ?? ""}${e.primerApellido?.[0] ?? ""}`.toUpperCase();
}

export function formatearFecha(fecha: string): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface EstiloEstado {
  label: string;
  clases: string;
}

export function estiloEstado(estado: MatriculaEstado): EstiloEstado {
  const mapa: Record<MatriculaEstado, EstiloEstado> = {
    APROBADA: { label: "Aprobada", clases: "bg-status-success/10 text-status-success" },
    TRAMITE: { label: "En trámite", clases: "bg-status-warning/10 text-status-warning" },
    RECHAZADA: { label: "Rechazada", clases: "bg-secondary/10 text-secondary" },
    RETIRADA: { label: "Retirada", clases: "bg-text-muted/10 text-text-muted" },
    ANULADA: { label: "Anulada", clases: "bg-text-muted/10 text-text-muted" },
  };
  return mapa[estado];
}

// Filtros combinados: texto + estado + grado + grupo (los dos últimos por ID).
export interface FiltrosMatricula {
  texto: string;
  estado: string;
  idGrado: string; // "" = todos
  idGrupo: string; // "" = todos
}

export function filtrarMatriculas(
  matriculas: Matricula[],
  f: FiltrosMatricula
): Matricula[] {
  const t = f.texto.trim().toLowerCase();
  return matriculas.filter((m) => {
    const coincideTexto =
      t === "" ||
      nombreCompleto(m.estudiante).toLowerCase().includes(t) ||
      m.estudiante.numeroDocumento.toLowerCase().includes(t);
    const coincideEstado = f.estado === "" || m.estado === f.estado;
    const coincideGrado =
      f.idGrado === "" || String(m.grado?.idGrado) === f.idGrado;
    const coincideGrupo =
      f.idGrupo === "" || String(m.grupo?.idGrupo) === f.idGrupo;
    return coincideTexto && coincideEstado && coincideGrado && coincideGrupo;
  });
}

// Conteo por estado para los indicadores inferiores.
export function contarPorEstado(matriculas: Matricula[]) {
  return {
    aprobadas: matriculas.filter((m) => m.estado === "APROBADA").length,
    tramite: matriculas.filter((m) => m.estado === "TRAMITE").length,
    rechazadas: matriculas.filter((m) => m.estado === "RECHAZADA").length,
  };
}