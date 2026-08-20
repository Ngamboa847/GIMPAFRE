import { apiRequest } from "../../shared/api/client";
import type { BloqueHorario } from "./types";

export function listarBloquesHorario(): Promise<BloqueHorario[]> {
  return apiRequest<BloqueHorario[]>("/api/bloques-horario");
}
