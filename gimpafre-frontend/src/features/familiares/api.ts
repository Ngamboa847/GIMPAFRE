import { apiRequest, ApiError } from "../../shared/api/client";
import type { Familiar, EstudianteFamiliar } from "./types";

// --- Familiar ---

export async function listarFamiliares(): Promise<Familiar[]> {
  return apiRequest<Familiar[]>("/api/familiares");
}

export async function obtenerFamiliar(id: number): Promise<Familiar> {
  return apiRequest<Familiar>(`/api/familiares/${id}`);
}

// Devuelve null si no existe (404) — el llamador lo interpreta como
// "familiar nuevo", no como un error real.
export async function buscarFamiliarPorDocumento(
  numeroDocumento: string
): Promise<Familiar | null> {
  try {
    return await apiRequest<Familiar>(
      `/api/familiares/buscar?numeroDocumento=${encodeURIComponent(numeroDocumento)}`
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function crearFamiliar(familiar: Familiar): Promise<Familiar> {
  return apiRequest<Familiar>("/api/familiares", { method: "POST", body: familiar });
}

export async function actualizarFamiliar(id: number, familiar: Familiar): Promise<Familiar> {
  return apiRequest<Familiar>(`/api/familiares/${id}`, { method: "PUT", body: familiar });
}

// --- EstudianteFamiliar (vínculo) ---

export async function listarFamiliaresPorEstudiante(
  idEstudiante: number
): Promise<EstudianteFamiliar[]> {
  return apiRequest<EstudianteFamiliar[]>(`/api/estudiante-familiar/estudiante/${idEstudiante}`);
}

export async function crearVinculoFamiliar(
  idEstudiante: number,
  idFamiliar: number,
  datos: EstudianteFamiliar
): Promise<EstudianteFamiliar> {
  return apiRequest<EstudianteFamiliar>(
    `/api/estudiante-familiar?idEstudiante=${idEstudiante}&idFamiliar=${idFamiliar}`,
    { method: "POST", body: datos }
  );
}

export async function actualizarVinculoFamiliar(
  id: number,
  datos: EstudianteFamiliar
): Promise<EstudianteFamiliar> {
  return apiRequest<EstudianteFamiliar>(`/api/estudiante-familiar/${id}`, {
    method: "PUT",
    body: datos,
  });
}