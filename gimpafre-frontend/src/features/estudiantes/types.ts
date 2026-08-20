// Estudiante — schema completo (34 campos). El wizard de matrícula
// (RegistrarMatriculaPage) solo captura el subconjunto de identificación y
// residencia/contacto; los complementarios (salud, familia/contexto) se
// editan desde la ficha (EstudianteDetallePage).

export interface Estudiante {
  idEstudiante?: number; // ausente al crear, presente al actualizar

  // --- Identificación ---
  tipoDocumento: string;
  numeroDocumento: string;
  lugarExpedicionDoc?: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  sexo: string;
  fechaNacimiento: string; // 'YYYY-MM-DD'
  lugarNacimiento?: string;
  nacionalidad?: string;
  fotografia?: string;

  // --- Residencia y contacto ---
  direccion?: string;
  barrio?: string;
  telefono?: string;
  movil?: string;

  // --- Salud (complementario) ---
  sisben?: string;
  estrato?: number;
  grupoSanguineo?: string;
  talla?: number;
  peso?: number;
  infoSeguridadSocial?: string;
  numeroAfiliacion?: string;
  diagnosticoClinico?: string;

  // --- Familia y contexto (complementario) ---
  pertenenciaEtnica?: string;
  areaInteres?: string;
  areaDificultad?: string;
  numeroHermanos?: number;
  hermanosMujeres?: number;
  hermanosHombres?: number;
  lugarEntreHermanos?: number;
  conQuienVive?: string;
  observaciones?: string;
}