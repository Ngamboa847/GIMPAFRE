import { useEffect, useState } from "react";
import {
  listarAsignacionesDocente,
  listarAsignaturas,
  listarPlanEstudios,
} from "./api";
import { listarGrupos } from "../configuracion/grupos/api";
import { listarDocentes } from "../docentes/api";
import type { AsignacionDocente, Asignatura, PlanEstudios } from "./types";

// Vista de consulta directa (shortcut, sin búsqueda ni filtros) — resuelve
// nombres cruzando por ID en el cliente, mismo patrón que ya usa
// CuentasUsuarioListPage con Docente (Cap4 §4, D-F14). Tipos de Grupo/
// Docente declarados localmente y acotados solo a los campos que se leen
// acá, porque no se tuvo a la vista el types.ts completo de esos módulos.

interface GrupoResumen {
  idGrupo: number;
  denominacion: string;
}

interface DocenteResumen {
  idDocente: number;
  primerNombre: string;
  primerApellido: string;
}

export function CargaAcademicaListPage() {
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [grupos, setGrupos] = useState<GrupoResumen[]>([]);
  const [docentes, setDocentes] = useState<DocenteResumen[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [planes, setPlanes] = useState<PlanEstudios[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listarAsignacionesDocente(),
      listarGrupos(),
      listarDocentes(),
      listarAsignaturas(),
      listarPlanEstudios(),
    ])
      .then(([a, g, d, asig, pe]) => {
        setAsignaciones(a);
        setGrupos(g);
        setDocentes(d);
        setAsignaturas(asig);
        setPlanes(pe);
      })
      .catch(() => setError("No se pudo cargar la carga académica."))
      .finally(() => setCargando(false));
  }, []);

  function nombreGrupo(idGrupo: number): string {
    return grupos.find((g) => g.idGrupo === idGrupo)?.denominacion ?? `Grupo #${idGrupo}`;
  }

  function nombreDocente(idDocente: number): string {
    const d = docentes.find((d) => d.idDocente === idDocente);
    return d ? `${d.primerNombre} ${d.primerApellido}` : `Docente #${idDocente}`;
  }

  function infoPlan(idPlanEstudios: number): { asignatura: string; intensidad: number | null } {
    const plan = planes.find((p) => p.idPlanEstudios === idPlanEstudios);
    if (!plan) return { asignatura: `Plan #${idPlanEstudios}`, intensidad: null };
    const asignatura = asignaturas.find((a) => a.idAsignatura === plan.idAsignatura);
    return {
      asignatura: asignatura?.nombre ?? `Asignatura #${plan.idAsignatura}`,
      intensidad: plan.intensidadHorariaSemanal,
    };
  }

  return (
    <>
      <div className="mb-stack-lg">
        <h2 className="font-headline text-[32px] font-bold text-text-main">
          Carga académica
        </h2>
        <p className="font-body text-[16px] text-text-muted">
          Consulta de asignaciones docente — vista preliminar
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
              <th className="px-4 py-3 font-semibold">Grupo</th>
              <th className="px-4 py-3 font-semibold">Asignatura</th>
              <th className="px-4 py-3 font-semibold">Docente</th>
              <th className="px-4 py-3 font-semibold">Intensidad horaria</th>
              <th className="px-4 py-3 font-semibold">Fecha asignación</th>
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
            {!cargando && asignaciones.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No hay asignaciones registradas todavía.
                </td>
              </tr>
            )}
            {asignaciones.map((a) => {
              const plan = infoPlan(a.idPlanEstudios);
              return (
                <tr key={a.idAsignacionDocente} className="border-t border-border-subtle">
                  <td className="px-4 py-3">{nombreGrupo(a.idGrupo)}</td>
                  <td className="px-4 py-3">{plan.asignatura}</td>
                  <td className="px-4 py-3">{nombreDocente(a.idDocente)}</td>
                  <td className="px-4 py-3">
                    {plan.intensidad !== null ? `${plan.intensidad} h/semana` : "—"}
                  </td>
                  <td className="px-4 py-3">{a.fechaAsignacion}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
