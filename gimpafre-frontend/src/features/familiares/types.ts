// Familiar — entidad global (D-02): se registra UNA vez y se vincula a
// varios estudiantes (hermanos comparten padres). parentesco/esAcudiente
// NO van acá — viven en el vínculo EstudianteFamiliar, porque un mismo
// familiar puede tener distinto rol según el estudiante.

export interface Familiar {
  idFamiliar?: number; // ausente al crear, presente al actualizar

  tipoDocumento?: string;
  numeroDocumento?: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  direccion?: string;
  telefono?: string;
  ocupacion?: string;
  empresa?: string;
  estadoCivil?: string; // se conserva en el tipo aunque no se muestra en Estudiante (decisión ya tomada)
}

// EstudianteFamiliar — tabla puente. El contrato devuelve estudiante y
// familiar como objetos completos (mismo patrón que Matricula.estudiante).
import type { Estudiante } from "../estudiantes/types";

export interface EstudianteFamiliar {
  idEstudianteFamiliar?: number;
  estudiante: Estudiante;
  familiar: Familiar;
  parentesco: string;
  esAcudiente: boolean;
}