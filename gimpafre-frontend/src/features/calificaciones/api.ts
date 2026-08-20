import { apiRequest } from "../../shared/api/client";
import type { Asistencia } from "./types";

export function listarAsistencia(): Promise<Asistencia[]> {
  return apiRequest<Asistencia[]>("/api/asistencia");
}
