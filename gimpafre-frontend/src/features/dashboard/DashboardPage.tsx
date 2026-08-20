import { useEffect, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { useDashboardKpis } from "./useDashboardKpis";
import {
  listarAsignacionesDocente,
  listarAsignaturas,
  listarPlanEstudios,
} from "../carga-academica/api";
import { listarBloquesHorario } from "../horarios/api";
import { listarGrupos } from "../configuracion/grupos/api";
import type { AsignacionDocente, Asignatura, PlanEstudios } from "../carga-academica/types";
import type { BloqueHorario } from "../horarios/types";
import type { UsuarioAutenticado } from "../auth/types";

// Roles sin acceso a /matriculas (tabla §5.1, Cap4 frontend): el dashboard
// administrativo (KPIs de matrícula/grupos/docentes) no les aplica.
const ROLES_VISTA_PERSONAL = ["DOCENTE", "ESTUDIANTE"];

export function DashboardPage() {
  const { usuario } = useAuth();
  const vistaPersonal = !!usuario && ROLES_VISTA_PERSONAL.includes(usuario.rol);

  return vistaPersonal ? (
    <DashboardPersonal usuario={usuario!} />
  ) : (
    <DashboardAdministrativo />
  );
}

/* ==========================================================================
   Vista administrativa — sin cambios.
   ========================================================================== */

function DashboardAdministrativo() {
  const { datos, cargando, error } = useDashboardKpis();

  return (
    <>
      <div className="mb-stack-lg">
        <h2 className="font-headline text-[32px] font-bold text-text-main">
          Bienvenido
        </h2>
        <p className="font-body text-[16px] text-text-muted">
          Resumen del año lectivo{" "}
          {datos?.anoLectivoDenominacion ?? "actual"}
        </p>
      </div>

      {error && (
        <div className="mb-stack-lg text-[14px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-stack-lg">
        <KpiCard
          icono="group"
          etiqueta="Matrículas activas"
          valor={datos?.matriculasActivas}
          cargando={cargando}
        />
        <KpiCard
          icono="pending_actions"
          etiqueta="Matrículas en trámite"
          valor={datos?.matriculasTramite}
          cargando={cargando}
          acento="warning"
        />
        <KpiCard
          icono="school"
          etiqueta="Grupos activos"
          valor={datos?.gruposActivos}
          cargando={cargando}
        />
        <KpiCard
          icono="person_pin"
          etiqueta="Docentes activos"
          valor={datos?.docentesActivos}
          cargando={cargando}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-stack-lg">
        <EstadoAnoLectivo />
        <AccesosRapidos />
      </div>

      <ActividadReciente />
    </>
  );
}

interface KpiCardProps {
  icono: string;
  etiqueta: string;
  valor: number | undefined;
  cargando: boolean;
  acento?: "warning";
}

function KpiCard({ icono, etiqueta, valor, cargando, acento }: KpiCardProps) {
  const colorIcono =
    acento === "warning" ? "text-status-warning" : "text-sidebar-bg";
  const fondoIcono =
    acento === "warning" ? "bg-status-warning/10" : "bg-sidebar-bg/5";

  return (
    <div className="bg-white p-6 rounded-lg border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${fondoIcono}`}>
          <span className={`material-symbols-outlined ${colorIcono}`}>
            {icono}
          </span>
        </div>
      </div>
      <p className="text-[12px] text-text-muted mb-1">{etiqueta}</p>
      <h3 className="text-[24px] font-headline font-semibold text-on-primary-fixed">
        {cargando ? "—" : valor ?? 0}
      </h3>
    </div>
  );
}

function EstadoAnoLectivo() {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg border border-border-subtle p-stack-lg">
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-headline text-[18px] font-semibold text-on-primary-fixed">
          Estado del año lectivo
        </h4>
        <span className="text-[12px] bg-surface-alt px-3 py-1 rounded-full text-text-muted">
          Vista preliminar
        </span>
      </div>
      <p className="text-[13px] text-text-muted">
        La gestión de periodos estará disponible próximamente.
      </p>
    </div>
  );
}

function AccesosRapidos() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-stack-lg">
      <h4 className="font-headline text-[18px] font-semibold text-on-primary-fixed mb-6">
        Accesos rápidos
      </h4>
      <div className="space-y-3">
        <button
          disabled
          title="Próximamente"
          className="w-full flex items-center justify-between px-4 py-3 bg-sidebar-bg/40 text-white rounded-lg cursor-not-allowed"
        >
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-[12px] font-semibold">Registrar matrícula</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function ActividadReciente() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle">
        <h4 className="font-headline text-[18px] font-semibold text-on-primary-fixed">
          Actividad reciente
        </h4>
      </div>
      <div className="px-6 py-8 text-center text-[13px] text-text-muted">
        El registro de actividad estará disponible próximamente.
      </div>
    </div>
  );
}

/* ==========================================================================
   Vista personal (DOCENTE, ESTUDIANTE)
   ========================================================================== */

function DashboardPersonal({ usuario }: { usuario: UsuarioAutenticado }) {
  return (
    <>
      <div className="mb-stack-lg">
        <h2 className="font-headline text-[32px] font-bold text-text-main">
          Bienvenido
        </h2>
        <p className="font-body text-[16px] text-text-muted">
          {usuario.rolDenominacion} — aquí encontrarás tu información académica
        </p>
      </div>

      {usuario.rol === "DOCENTE" && usuario.idDocente != null ? (
        <DocenteHorarioHoyCard idDocente={usuario.idDocente} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TarjetaProximamente
            icono="schedule"
            titulo="Tu horario"
            mensaje="Aquí podrás consultar tu horario de clases en cuanto esté disponible."
          />
          <TarjetaProximamente
            icono="grade"
            titulo="Calificaciones y asistencia"
            mensaje="Aquí podrás consultar tus calificaciones y asistencia en cuanto estén disponibles."
          />
        </div>
      )}
    </>
  );
}

// Hook interno: trae las asignaciones docente de un docente puntual, más
// los catálogos necesarios para mostrar nombres en vez de IDs (mismo
// patrón que CargaAcademicaListPage/HorariosListPage).
function useAsignacionesDelDocente(idDocente: number) {
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [grupos, setGrupos] = useState<{ idGrupo: number; denominacion: string }[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [planes, setPlanes] = useState<PlanEstudios[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      listarAsignacionesDocente(),
      listarGrupos(),
      listarAsignaturas(),
      listarPlanEstudios(),
    ])
      .then(([a, g, asig, pe]) => {
        setAsignaciones(a.filter((x) => x.idDocente === idDocente));
        setGrupos(g);
        setAsignaturas(asig);
        setPlanes(pe);
      })
      .finally(() => setCargando(false));
  }, [idDocente]);

  function nombreGrupo(idGrupo: number): string {
    return grupos.find((g) => g.idGrupo === idGrupo)?.denominacion ?? `Grupo #${idGrupo}`;
  }

  function nombreAsignatura(idPlanEstudios: number): string {
    const plan = planes.find((p) => p.idPlanEstudios === idPlanEstudios);
    if (!plan) return `Plan #${idPlanEstudios}`;
    return asignaturas.find((a) => a.idAsignatura === plan.idAsignatura)?.nombre
      ?? `Asignatura #${plan.idAsignatura}`;
  }

  return { asignaciones, cargando, nombreGrupo, nombreAsignatura };
}

// Índice 0 = domingo (Date.getDay()), igual que en JS. El dato en
// BloqueHorario.dia no lleva tilde (mismo criterio usado al sembrar los
// datos sintéticos); NOMBRE_DIA sí, para mostrarlo bonito.
const CODIGO_DIA_POR_INDICE = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];
const NOMBRE_DIA_POR_INDICE = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function DocenteHorarioHoyCard({ idDocente }: { idDocente: number }) {
  const { asignaciones, cargando: cargandoAsig, nombreGrupo, nombreAsignatura } =
    useAsignacionesDelDocente(idDocente);
  const [bloques, setBloques] = useState<BloqueHorario[]>([]);
  const [cargandoBloques, setCargandoBloques] = useState(true);

  useEffect(() => {
    listarBloquesHorario()
      .then(setBloques)
      .finally(() => setCargandoBloques(false));
  }, []);

  const indiceHoy = new Date().getDay();
  const codigoHoy = CODIGO_DIA_POR_INDICE[indiceHoy];
  const nombreHoy = NOMBRE_DIA_POR_INDICE[indiceHoy];

  const idsAsignacion = new Set(asignaciones.map((a) => a.idAsignacionDocente));
  const bloquesHoy = bloques
    .filter((b) => idsAsignacion.has(b.idAsignacionDocente) && b.dia === codigoHoy)
    .sort((x, y) => x.horaInicio.localeCompare(y.horaInicio));

  const cargando = cargandoAsig || cargandoBloques;

  return (
    <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
        <div className="p-2 rounded-lg bg-sidebar-bg/5">
          <span className="material-symbols-outlined text-sidebar-bg">today</span>
        </div>
        <div>
          <h4 className="font-headline text-[18px] font-semibold text-on-primary-fixed">
            Tu horario de hoy
          </h4>
          <p className="text-[12px] text-text-muted capitalize">{nombreHoy}</p>
        </div>
      </div>

      {cargando && (
        <div className="px-6 py-8 text-center text-[13px] text-text-muted">Cargando…</div>
      )}

      {!cargando && bloquesHoy.length === 0 && (
        <div className="px-6 py-10 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-text-muted text-[32px] mb-2">
            self_improvement
          </span>
          <p className="text-[13px] text-text-muted">
            No tienes clases programadas hoy.
          </p>
        </div>
      )}

      {!cargando && bloquesHoy.length > 0 && (
        <ul className="divide-y divide-border-subtle">
          {bloquesHoy.map((b) => {
            const asig = asignaciones.find((a) => a.idAsignacionDocente === b.idAsignacionDocente);
            return (
              <li key={b.idBloqueHorario} className="flex items-center gap-4 px-6 py-4">
                <div className="shrink-0 bg-sidebar-bg/5 text-sidebar-bg rounded-lg px-3 py-2 text-center min-w-[92px]">
                  <div className="text-[13px] font-semibold">{b.horaInicio.slice(0, 5)}</div>
                  <div className="text-[11px] text-text-muted">{b.horaFin.slice(0, 5)}</div>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-main">
                    {asig ? nombreAsignatura(asig.idPlanEstudios) : "—"}
                  </p>
                  <p className="text-[12px] text-text-muted">
                    {asig ? nombreGrupo(asig.idGrupo) : "—"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface TarjetaProximamenteProps {
  icono: string;
  titulo: string;
  mensaje: string;
}

function TarjetaProximamente({ icono, titulo, mensaje }: TarjetaProximamenteProps) {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-stack-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-sidebar-bg/5">
          <span className="material-symbols-outlined text-sidebar-bg">
            {icono}
          </span>
        </div>
        <h4 className="font-headline text-[18px] font-semibold text-on-primary-fixed">
          {titulo}
        </h4>
      </div>
      <p className="text-[13px] text-text-muted">{mensaje}</p>
    </div>
  );
}
