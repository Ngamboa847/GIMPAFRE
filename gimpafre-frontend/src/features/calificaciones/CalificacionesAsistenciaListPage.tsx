import { useEffect, useState } from "react";
import { listarAsistencia } from "./api";
import {
  listarAsignacionesDocente,
  listarAsignaturas,
  listarPlanEstudios,
} from "../carga-academica/api";
import { listarGrupos } from "../configuracion/grupos/api";
import { listarDocentes } from "../docentes/api";
import { obtenerMatricula } from "../matriculas/api";
import type { Asistencia } from "./types";
import type { AsignacionDocente, Asignatura, PlanEstudios } from "../carga-academica/types";

// Vista de consulta directa (shortcut) — resuelve la asignación docente
// (grupo/asignatura/docente) igual que Carga Académica y Horarios, y
// resuelve id_matricula a nombre de estudiante vía obtenerMatricula(),
// que ya trae el estudiante anidado (matricula.estudiante) — no hace
// falta una segunda llamada a obtenerEstudiante(). No hay listado masivo
// de matrículas, así que se resuelve uno por uno, solo para las que
// aparecen en la asistencia (mismo criterio que CuentasUsuarioListPage,
// D-F14).

interface GrupoResumen {
  idGrupo: number;
  denominacion: string;
}

interface DocenteResumen {
  idDocente: number;
  primerNombre: string;
  primerApellido: string;
}

export function CalificacionesAsistenciaListPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [grupos, setGrupos] = useState<GrupoResumen[]>([]);
  const [docentes, setDocentes] = useState<DocenteResumen[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [planes, setPlanes] = useState<PlanEstudios[]>([]);
  const [nombresEstudiante, setNombresEstudiante] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listarAsistencia(),
      listarAsignacionesDocente(),
      listarGrupos(),
      listarDocentes(),
      listarAsignaturas(),
      listarPlanEstudios(),
    ])
      .then(([asi, a, g, d, asig, pe]) => {
        setAsistencias(asi);
        setAsignaciones(a);
        setGrupos(g);
        setDocentes(d);
        setAsignaturas(asig);
        setPlanes(pe);

        // Resolver estudiante solo para las matrículas que aparecen acá.
        const idsMatricula = [...new Set(asi.map((x) => x.idMatricula))];
        Promise.all(
          idsMatricula.map(async (idMatricula) => {
            try {
              const matricula = await obtenerMatricula(idMatricula);
              const est = matricula.estudiante;
              return [idMatricula, `${est.primerNombre} ${est.primerApellido}`] as const;
            } catch {
              return [idMatricula, `Matrícula #${idMatricula}`] as const;
            }
          })
        ).then((pares) => setNombresEstudiante(Object.fromEntries(pares)));
      })
      .catch(() => setError("No se pudo cargar la asistencia."))
      .finally(() => setCargando(false));
  }, []);

  function asignacion(idAsignacionDocente: number) {
    return asignaciones.find((a) => a.idAsignacionDocente === idAsignacionDocente);
  }

  function nombreGrupo(idGrupo: number): string {
    return grupos.find((g) => g.idGrupo === idGrupo)?.denominacion ?? `Grupo #${idGrupo}`;
  }

  function nombreDocente(idDocente: number): string {
    const d = docentes.find((d) => d.idDocente === idDocente);
    return d ? `${d.primerNombre} ${d.primerApellido}` : `Docente #${idDocente}`;
  }

  function nombreAsignatura(idPlanEstudios: number): string {
    const plan = planes.find((p) => p.idPlanEstudios === idPlanEstudios);
    if (!plan) return `Plan #${idPlanEstudios}`;
    return asignaturas.find((a) => a.idAsignatura === plan.idAsignatura)?.nombre
      ?? `Asignatura #${plan.idAsignatura}`;
  }

  return (
    <>
      <div className="mb-stack-lg">
        <h2 className="font-headline text-[32px] font-bold text-text-main">
          Calificaciones y asistencia
        </h2>
        <p className="font-body text-[16px] text-text-muted">
          Consulta de asistencia — vista preliminar
        </p>
      </div>

      {error && (
        <div className="mb-stack-lg text-[14px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface-container-low text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Estudiante</th>
              <th className="px-4 py-3 font-semibold">Grupo</th>
              <th className="px-4 py-3 font-semibold">Asignatura</th>
              <th className="px-4 py-3 font-semibold">Docente</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  Cargando…
                </td>
              </tr>
            )}
            {!cargando && asistencias.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  No hay registros de asistencia todavía.
                </td>
              </tr>
            )}
            {asistencias.map((a) => {
              const asig = asignacion(a.idAsignacionDocente);
              return (
                <tr key={a.idAsistencia} className="border-t border-border-subtle">
                  <td className="px-4 py-3">
                    {nombresEstudiante[a.idMatricula] ?? `Matrícula #${a.idMatricula}`}
                  </td>
                  <td className="px-4 py-3">{asig ? nombreGrupo(asig.idGrupo) : "—"}</td>
                  <td className="px-4 py-3">{asig ? nombreAsignatura(asig.idPlanEstudios) : "—"}</td>
                  <td className="px-4 py-3">{asig ? nombreDocente(asig.idDocente) : "—"}</td>
                  <td className="px-4 py-3">{a.fecha}</td>
                  <td className="px-4 py-3">{a.estado}</td>
                  <td className="px-4 py-3">{a.motivo ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
