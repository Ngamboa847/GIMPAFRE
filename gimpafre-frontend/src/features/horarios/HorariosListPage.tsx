import { useEffect, useState } from "react";
import { listarBloquesHorario } from "./api";
import {
  listarAsignacionesDocente,
  listarAsignaturas,
  listarPlanEstudios,
} from "../carga-academica/api";
import { listarGrupos } from "../configuracion/grupos/api";
import { listarDocentes } from "../docentes/api";
import type { BloqueHorario } from "./types";
import type { AsignacionDocente, Asignatura, PlanEstudios } from "../carga-academica/types";

// Vista de consulta directa (shortcut) — resuelve nombres cruzando por ID
// en el cliente, mismo patrón que Carga Académica. No se expone id_horario
// resuelto (no hay endpoint de Horario todavía, solo BloqueHorario): en su
// lugar se resuelve el grupo a través de AsignacionDocente, que ya lo trae.

interface GrupoResumen {
  idGrupo: number;
  denominacion: string;
}

interface DocenteResumen {
  idDocente: number;
  primerNombre: string;
  primerApellido: string;
}

const DIAS_ORDEN: Record<string, number> = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
};

export function HorariosListPage() {
  const [bloques, setBloques] = useState<BloqueHorario[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [grupos, setGrupos] = useState<GrupoResumen[]>([]);
  const [docentes, setDocentes] = useState<DocenteResumen[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [planes, setPlanes] = useState<PlanEstudios[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listarBloquesHorario(),
      listarAsignacionesDocente(),
      listarGrupos(),
      listarDocentes(),
      listarAsignaturas(),
      listarPlanEstudios(),
    ])
      .then(([b, a, g, d, asig, pe]) => {
        setBloques(b);
        setAsignaciones(a);
        setGrupos(g);
        setDocentes(d);
        setAsignaturas(asig);
        setPlanes(pe);
      })
      .catch(() => setError("No se pudo cargar el horario."))
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

  const filas = [...bloques].sort((x, y) => {
    const diaX = DIAS_ORDEN[x.dia] ?? 99;
    const diaY = DIAS_ORDEN[y.dia] ?? 99;
    return diaX !== diaY ? diaX - diaY : x.horaInicio.localeCompare(y.horaInicio);
  });

  return (
    <>
      <div className="mb-stack-lg">
        <h2 className="font-headline text-[32px] font-bold text-text-main">
          Horarios
        </h2>
        <p className="font-body text-[16px] text-text-muted">
          Consulta de bloques de horario — vista preliminar
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
              <th className="px-4 py-3 font-semibold">Día</th>
              <th className="px-4 py-3 font-semibold">Hora</th>
              <th className="px-4 py-3 font-semibold">Grupo</th>
              <th className="px-4 py-3 font-semibold">Asignatura</th>
              <th className="px-4 py-3 font-semibold">Docente</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Cargando…
                </td>
              </tr>
            )}
            {!cargando && filas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No hay bloques de horario registrados todavía.
                </td>
              </tr>
            )}
            {filas.map((b) => {
              const asig = asignacion(b.idAsignacionDocente);
              return (
                <tr key={b.idBloqueHorario} className="border-t border-border-subtle">
                  <td className="px-4 py-3">{b.dia}</td>
                  <td className="px-4 py-3">
                    {b.horaInicio.slice(0, 5)} – {b.horaFin.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">{asig ? nombreGrupo(asig.idGrupo) : "—"}</td>
                  <td className="px-4 py-3">{asig ? nombreAsignatura(asig.idPlanEstudios) : "—"}</td>
                  <td className="px-4 py-3">{asig ? nombreDocente(asig.idDocente) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
