import { apiRequest } from "../../shared/api/client";
import type { Matricula, MatriculaEstado } from "./types";

export function listarMatriculasPorAno(idAnoLectivo: number): Promise<Matricula[]> {
  return apiRequest<Matricula[]>(`/api/matriculas/ano-lectivo/${idAnoLectivo}`);
}

export function obtenerMatricula(id: number): Promise<Matricula> {
  return apiRequest<Matricula>(`/api/matriculas/${id}`);
}

export function cambiarEstadoMatricula(id: number, estado: MatriculaEstado): Promise<Matricula> {
  return apiRequest<Matricula>(`/api/matriculas/${id}/estado`, {
    method: "PATCH",
    body: { estado },
  });
}

export function registrarSimat(id: number, registro: "PENDIENTE" | "CARGADO"): Promise<Matricula> {
  return apiRequest<Matricula>(`/api/matriculas/${id}/simat`, {
    method: "PATCH",
    body: { registro },
  });
}

// POST /api/matriculas?idEstudiante=&idAnoLectivo=&idGrado=&idGrupo=
export interface CrearMatriculaParams {
  idEstudiante: number;
  idAnoLectivo: number;
  idGrado: number;
  idGrupo?: number;
}

export function crearMatricula(
  datos: {
    tipo: string;
    conceptoPsicopedagogico?: string;
  },
  params: CrearMatriculaParams
): Promise<Matricula> {
  const query = new URLSearchParams({
    idEstudiante: String(params.idEstudiante),
    idAnoLectivo: String(params.idAnoLectivo),
    idGrado: String(params.idGrado),
  });
  if (params.idGrupo != null) query.set("idGrupo", String(params.idGrupo));

  return apiRequest<Matricula>(`/api/matriculas?${query.toString()}`, {
    method: "POST",
    body: datos,
  });

  
}

export interface ActualizarMatriculaParams {
  idGrado?: number;
  idGrupo?: number;
}

export function actualizarMatricula(
  id: number,
  matricula: Matricula,
  params: ActualizarMatriculaParams = {}
): Promise<Matricula> {
  const query = new URLSearchParams();
  if (params.idGrado != null) query.set("idGrado", String(params.idGrado));
  if (params.idGrupo != null) query.set("idGrupo", String(params.idGrupo));
  const qs = query.toString();

  return apiRequest<Matricula>(`/api/matriculas/${id}${qs ? `?${qs}` : ""}`, {
    method: "PUT",
    body: matricula,
  });
}