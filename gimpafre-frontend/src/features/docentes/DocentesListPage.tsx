import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { listarDocentes } from "./api";
import type { Docente } from "./types";

function nombreCompleto(d: Docente) {
  return [d.primerNombre, d.segundoNombre, d.primerApellido, d.segundoApellido].filter(Boolean).join(" ");
}

export function DocentesListPage() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    listarDocentes()
      .then((data) => {
        if (activo) {
          setDocentes(data);
          setCargando(false);
        }
      })
      .catch(() => {
        if (activo) {
          setError("No se pudieron cargar los docentes.");
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, []);

  const visibles = useMemo(() => {
    const t = texto.trim().toLowerCase();
    return docentes.filter((d) => {
      const coincideTexto =
        !t ||
        nombreCompleto(d).toLowerCase().includes(t) ||
        d.numeroDocumento.toLowerCase().includes(t);
      const coincideEstado = !estado || d.estado === estado;
      return coincideTexto && coincideEstado;
    });
  }, [docentes, texto, estado]);

  return (
    <>
      <div className="flex justify-between items-start mb-stack-md">
        <div>
          <h1 className="font-headline text-[32px] font-bold text-text-main">Docentes</h1>
          <p className="font-body text-[14px] text-text-muted mt-1">
            Registro del personal docente
          </p>
        </div>
        <button
          onClick={() => navigate("/docentes/nuevo")}
          className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo docente
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
            placeholder="Buscar por nombre o documento"
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
                {["Nombre completo", "Documento", "Teléfono", "Correo", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-3 font-body text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted text-[14px]">Cargando docentes...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-error text-[14px]">{error}</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay docentes que coincidan con los filtros.</td></tr>
              ) : (
                visibles.map((d) => (
                  <tr
                    key={d.idDocente}
                    onClick={() => navigate(`/docentes/${d.idDocente}`)}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{nombreCompleto(d)}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{d.tipoDocumento} {d.numeroDocumento}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{d.telefono ?? "—"}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{d.correo ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        d.estado === "ACTIVO" ? "bg-status-success/10 text-status-success" : "bg-surface-alt text-text-muted"
                      }`}>
                        {d.estado === "ACTIVO" ? "Activo" : "Inactivo"}
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
