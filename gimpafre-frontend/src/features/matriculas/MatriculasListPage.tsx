import { useEffect, useMemo, useRef, useState } from "react";
import { listarMatriculasPorAno } from "./api";
import { listarAnosLectivos } from "../configuracion/anos-lectivos/api";
import { listarGrados } from "../configuracion/grados/api";
import { listarGrupos } from "../configuracion/grupos/api";
import type { Matricula } from "./types";
import type { Grado } from "../configuracion/grados/types";
import type { Grupo } from "../configuracion/grupos/types";
import {
  nombreCompleto,
  iniciales,
  formatearFecha,
  estiloEstado,
  filtrarMatriculas,
  contarPorEstado,
} from "./presentacion";
import { useNavigate } from "react-router";
const ESTADOS = [
  { value: "", label: "Estado: Todos" },
  { value: "TRAMITE", label: "En trámite" },
  { value: "APROBADA", label: "Aprobada" },
  { value: "RECHAZADA", label: "Rechazada" },
  { value: "RETIRADA", label: "Retirada" },
  { value: "ANULADA", label: "Anulada" },
];

const POR_PAGINA = 10;

export function MatriculasListPage() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");
  const [idGrado, setIdGrado] = useState("");
  const [idGrupo, setIdGrupo] = useState("");

  // Paginación
  const [pagina, setPagina] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const [anos, gradosData, gruposData] = await Promise.all([
          listarAnosLectivos(),
          listarGrados(),
          listarGrupos(),
        ]);
        const anoActual =
          anos.length > 0
            ? [...anos].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))[0]
            : null;
        const datos = anoActual
          ? await listarMatriculasPorAno(anoActual.idAnoLectivo)
          : [];
        if (activo) {
          setMatriculas(datos);
          setGrados(gradosData);
          setGrupos(gruposData);
          setCargando(false);
        }
      } catch {
        if (activo) {
          setError("No se pudieron cargar las matrículas.");
          setCargando(false);
        }
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  // Resultado filtrado (recalcula al cambiar filtros o datos).
  const visibles = useMemo(
    () => filtrarMatriculas(matriculas, { texto, estado, idGrado, idGrupo }),
    [matriculas, texto, estado, idGrado, idGrupo]
  );

  // Al cambiar cualquier filtro, volver a la página 1.
  useEffect(() => {
    setPagina(1);
  }, [texto, estado, idGrado, idGrupo]);

  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginadas = visibles.slice(inicio, inicio + POR_PAGINA);

  // Indicadores: sobre el conjunto filtrado (reflejan lo que el usuario ve).
  const conteos = contarPorEstado(visibles);

  return (
    <>
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-stack-md">
        <div>
          <h1 className="font-headline text-[32px] font-bold text-text-main">
            Gestión de Matrículas
          </h1>
          <p className="font-body text-[14px] text-text-muted mt-1">
            Registro y seguimiento de estudiantes matriculados
          </p>
        </div>
        <button
          onClick={() => navigate("/matriculas/nueva")}
          className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Registrar matrícula
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-border-subtle p-4 mb-stack-md flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nombre o documento"
            className="w-full pl-10 pr-4 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="px-4 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
        >
          {ESTADOS.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        <select
          value={idGrado}
          onChange={(e) => setIdGrado(e.target.value)}
          className="px-4 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
        >
          <option value="">Grado: Todos</option>
          {grados.map((g) => (
            <option key={g.idGrado} value={String(g.idGrado)}>{g.nombre}</option>
          ))}
        </select>
        <select
          value={idGrupo}
          onChange={(e) => setIdGrupo(e.target.value)}
          className="px-4 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
        >
          <option value="">Grupo: Todos</option>
          {grupos.map((g) => (
            <option key={g.idGrupo} value={String(g.idGrupo)}>{g.denominacion}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
<div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border-subtle bg-surface-container-low">
          <th className="px-4 py-3 w-10" />
          {["Folio", "Estudiante", "Documento", "Grado", "Grupo", "Fecha", "Estado"].map((h) => (
            <th key={h} className="px-4 py-3 font-body text-[12px] font-semibold text-text-muted uppercase tracking-wide">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cargando ? (
          <tr><td colSpan={8} className="px-4 py-12 text-center text-text-muted text-[14px]">Cargando matrículas...</td></tr>
        ) : error ? (
          <tr><td colSpan={8} className="px-4 py-12 text-center text-error text-[14px]">{error}</td></tr>
        ) : paginadas.length === 0 ? (
          <tr><td colSpan={8} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay matrículas que coincidan con los filtros.</td></tr>
        ) : (
          paginadas.map((m) => {
            const est = estiloEstado(m.estado);
            return (
              <tr
                key={m.idMatricula}
                onClick={() => navigate(`/matriculas/${m.idMatricula}`)}
                className="border-b border-border-subtle last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <MenuAccionesFila idMatricula={m.idMatricula} idEstudiante={m.estudiante.idEstudiante} />
                </td>
                <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{m.consecutivo}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sidebar-bg/10 text-sidebar-bg flex items-center justify-center text-[11px] font-bold shrink-0">
                      {iniciales(m.estudiante)}
                    </div>
                    <span className="font-body text-[13px] text-text-main">{nombreCompleto(m.estudiante)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-body text-[13px] text-text-muted">{m.estudiante.numeroDocumento}</td>
                <td className="px-4 py-3 font-body text-[13px] text-text-muted">{m.grado?.nombre ?? "—"}</td>
                <td className="px-4 py-3 font-body text-[13px] text-text-muted">{m.grupo?.denominacion ?? "— Sin asignar —"}</td>
                <td className="px-4 py-3 font-body text-[13px] text-text-muted">{formatearFecha(m.fecha)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${est.clases}`}>{est.label}</span>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>

        {/* Paginación */}
        {!cargando && !error && visibles.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-border-subtle">
            <span className="text-[12px] text-text-muted">
              Mostrando {paginadas.length} de {visibles.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle text-text-muted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-3 text-[13px] text-text-main font-medium">
                {pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle text-text-muted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Indicadores inferiores */}
      {!cargando && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-stack-md">
          <IndicadorCard icono="check_circle" etiqueta="Aprobadas" valor={conteos.aprobadas} color="success" />
          <IndicadorCard icono="pending" etiqueta="En trámite" valor={conteos.tramite} color="warning" />
          <IndicadorCard icono="cancel" etiqueta="Rechazadas" valor={conteos.rechazadas} color="danger" />
        </div>
      )}
    </>
  );
}

interface IndicadorProps {
  icono: string;
  etiqueta: string;
  valor: number;
  color: "success" | "warning" | "danger";
}

function IndicadorCard({ icono, etiqueta, valor, color }: IndicadorProps) {
  const estilos = {
    success: "bg-status-success/10 text-status-success",
    warning: "bg-status-warning/10 text-status-warning",
    danger: "bg-secondary/10 text-secondary",
  }[color];

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${estilos}`}>
        <span className="material-symbols-outlined">{icono}</span>
      </div>
      <div>
        <p className="text-[12px] text-text-muted uppercase tracking-wide">{etiqueta}</p>
        <p className="text-[24px] font-headline font-semibold text-on-primary-fixed">{valor}</p>
      </div>
    </div>
  );
}

function MenuAccionesFila({ idMatricula, idEstudiante }: { idMatricula: number; idEstudiante?: number }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function alClicFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, [abierto]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {abierto && (
        <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg border border-border-subtle shadow-lg z-50 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAbierto(false);
              navigate(`/matriculas/${idMatricula}`);
            }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-text-main hover:bg-surface-container-low transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-text-muted">how_to_reg</span>
            Ver matrícula
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAbierto(false);
              navigate(`/matriculas/${idMatricula}/editar`);
            }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-text-main hover:bg-surface-container-low transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-text-muted">edit</span>
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAbierto(false);
              navigate(`/estudiantes/${idEstudiante}`);
            }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-text-main hover:bg-surface-container-low transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-text-muted">person</span>
            Ver estudiante
          </button>
        </div>
      )}
    </div>
  );
}