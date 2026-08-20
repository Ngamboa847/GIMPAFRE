import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { listarCuentasUsuario } from "./api";
import type { CuentaUsuario } from "./types";
import { listarDocentes } from "../docentes/api";
import type { Docente } from "../docentes/types";
import { obtenerEstudiante } from "../estudiantes/api";
import type { Estudiante } from "../estudiantes/types";

function nombreCompletoDocente(d: Docente) {
  return [d.primerNombre, d.segundoNombre, d.primerApellido, d.segundoApellido].filter(Boolean).join(" ");
}

function nombreCompletoEstudiante(e: Estudiante) {
  return [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido].filter(Boolean).join(" ");
}

export function CuentasUsuarioListPage() {
  const [cuentas, setCuentas] = useState<CuentaUsuario[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [estudiantes, setEstudiantes] = useState<Record<number, Estudiante>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");
  const navigate = useNavigate();

    useEffect(() => {
    let activo = true;
    Promise.all([listarCuentasUsuario(), listarDocentes().catch(() => [])])
      .then(([cuentasData, docentesData]) => {
        if (!activo) return;
        setCuentas(cuentasData);
        setDocentes(docentesData);
        setCargando(false);

        // No hay endpoint de listado masivo de estudiantes: se resuelve uno por uno,
        // solo para las cuentas que traen idEstudiante.
        const idsEstudiante = Array.from(
          new Set(cuentasData.map((c) => c.idEstudiante).filter((id): id is number => id != null))
        );
        idsEstudiante.forEach((idEstudiante) => {
          obtenerEstudiante(idEstudiante)
            .then((e) => {
              if (activo) setEstudiantes((prev) => ({ ...prev, [idEstudiante]: e }));
            })
            .catch(() => {});
        });
      })
      .catch(() => {
        if (activo) {
          setError("No se pudieron cargar las cuentas de usuario.");
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, []);

    function vinculadoA(c: CuentaUsuario): string {
    if (c.idDocente != null) {
      const d = docentes.find((doc) => doc.idDocente === c.idDocente);
      return d ? `Docente: ${nombreCompletoDocente(d)}` : `Docente #${c.idDocente}`;
    }
    if (c.idEstudiante != null) {
      const e = estudiantes[c.idEstudiante];
      return e ? `Estudiante: ${nombreCompletoEstudiante(e)}` : `Estudiante #${c.idEstudiante}`;
    }
    return "—";
  }

  const visibles = useMemo(() => {
    const t = texto.trim().toLowerCase();
    return cuentas.filter((c) => {
      const coincideTexto = !t || c.nombreUsuario.toLowerCase().includes(t) || c.rolDenominacion.toLowerCase().includes(t);
      const coincideEstado = !estado || c.estado === estado;
      return coincideTexto && coincideEstado;
    });
  }, [cuentas, texto, estado]);

  return (
    <>
      <div className="flex justify-between items-start mb-stack-md">
        <div>
          <h1 className="font-headline text-[32px] font-bold text-text-main">Cuentas de usuario</h1>
          <p className="font-body text-[14px] text-text-muted mt-1">
            Administración de cuentas y roles del sistema
          </p>
        </div>
        <button
          onClick={() => navigate("/cuentas-usuario/nuevo")}
          className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva cuenta
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle p-4 mb-stack-md flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por usuario o rol"
            className="w-full pl-10 pr-4 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="px-4 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
        >
          <option value="">Estado: Todos</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-low">
                {["Usuario", "Rol", "Vinculado a", "Fecha creación", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-3 font-body text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted text-[14px]">Cargando cuentas...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-error text-[14px]">{error}</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay cuentas que coincidan con los filtros.</td></tr>
              ) : (
                visibles.map((c) => (
                  <tr
                    key={c.idCuentaUsuario}
                    onClick={() => navigate(`/cuentas-usuario/${c.idCuentaUsuario}`)}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{c.nombreUsuario}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{c.rolDenominacion}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{vinculadoA(c)}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{c.fechaCreacion}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        c.estado === "ACTIVO" ? "bg-status-success/10 text-status-success" : "bg-surface-alt text-text-muted"
                      }`}>
                        {c.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}