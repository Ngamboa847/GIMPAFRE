import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { obtenerMatricula, cambiarEstadoMatricula, registrarSimat } from "./api";
import type { Matricula, MatriculaEstado } from "./types";
import { nombreCompleto, formatearFecha, estiloEstado } from "./presentacion";
import { transicionesValidas, etiquetaAccion } from "./transiciones";
import { ApiError } from "../../shared/api/client";
import { DocumentosAnexosSection } from "../documentos-anexos/DocumentosAnexosSection";

export function MatriculaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState<Matricula | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menú desplegable de estado
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Diálogo de confirmación
  const [confirmacion, setConfirmacion] = useState<{
    tipo: "estado" | "simat";
    nuevoEstado?: MatriculaEstado;
    nuevoSimat?: "PENDIENTE" | "CARGADO";
    mensaje: string;
  } | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const datos = await obtenerMatricula(Number(id));
        if (activo) {
          setMatricula(datos);
          setCargando(false);
        }
      } catch {
        if (activo) {
          setError("No se pudo cargar la matrícula.");
          setCargando(false);
        }
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  // Cerrar el menú al hacer clic fuera de él.
  useEffect(() => {
    function alClicFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    if (menuAbierto) document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, [menuAbierto]);

  async function ejecutarAccion() {
    if (!confirmacion || !matricula) return;
    setProcesando(true);
    setErrorAccion(null);
    try {
      let actualizada: Matricula;
      if (confirmacion.tipo === "estado" && confirmacion.nuevoEstado) {
        actualizada = await cambiarEstadoMatricula(matricula.idMatricula, confirmacion.nuevoEstado);
      } else if (confirmacion.tipo === "simat" && confirmacion.nuevoSimat) {
        actualizada = await registrarSimat(matricula.idMatricula, confirmacion.nuevoSimat);
      } else {
        return;
      }
      setMatricula(actualizada);
      setConfirmacion(null);
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo completar la acción.";
        setErrorAccion(msg);
      } else {
        setErrorAccion("No se pudo completar la acción.");
      }
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return <p className="text-text-muted text-[14px]">Cargando matrícula...</p>;
  }
  if (error || !matricula) {
    return (
      <div>
        <p className="text-error text-[14px] mb-4">{error ?? "Matrícula no encontrada."}</p>
        <button onClick={() => navigate("/matriculas")} className="text-sidebar-bg text-[14px] underline">
          Volver al listado
        </button>
      </div>
    );
  }

  const est = estiloEstado(matricula.estado);
  const e = matricula.estudiante;
  const transiciones = transicionesValidas(matricula.estado);
  const simatCargado = matricula.resultadoRegistroSimat === "CARGADO";

  return (
    <>
      <button
        onClick={() => navigate("/matriculas")}
        className="flex items-center gap-1 text-text-muted text-[13px] hover:text-text-main mb-4"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a Matrículas
      </button>

      {/* Bloque derecho: estado + acciones */}
<div className="flex flex-col items-end gap-3 shrink-0">
  <span className={`inline-block px-3 py-1.5 rounded-full text-[13px] font-semibold ${est.clases}`}>
    {est.label}
  </span>

  <div className="flex items-center gap-2">
    {/* Menú desplegable "Gestionar estado" */}
    {transiciones.length > 0 && (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuAbierto((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-sidebar-bg text-white hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Gestionar estado
          <span className="material-symbols-outlined text-[18px]">
            {menuAbierto ? "expand_less" : "expand_more"}
          </span>
        </button>

        {menuAbierto && (
          <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg border border-border-subtle shadow-lg z-50 overflow-hidden">
            <p className="px-4 py-2 text-[11px] text-text-muted uppercase tracking-wide border-b border-border-subtle">
              Cambiar estado a
            </p>
            {transiciones.map((destino) => (
              <button
                key={destino}
                onClick={() => {
                  setMenuAbierto(false);
                  setConfirmacion({
                    tipo: "estado",
                    nuevoEstado: destino,
                    mensaje: `¿Confirma cambiar el estado de la matrícula a "${estiloEstado(destino).label}"? Esta acción quedará registrada.`,
                  });
                }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-text-main hover:bg-surface-container-low transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-text-muted">
                  arrow_forward
                </span>
                {etiquetaAccion(destino)}
              </button>
            ))}
          </div>
        )}
      </div>
    )}

    {/* SIMAT: botón solo si está pendiente; si está cargado, indicador */}
    {simatCargado ? (
      <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium bg-status-success/10 text-status-success">
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
        SIMAT cargado
      </span>
    ) : (
      <button
        onClick={() =>
          setConfirmacion({
            tipo: "simat",
            nuevoSimat: "CARGADO",
            mensaje: "¿Confirma marcar el registro SIMAT como Cargado? Esta acción no se puede revertir.",
          })
        }
        className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-sidebar-bg text-sidebar-bg hover:bg-sidebar-bg/5 transition-all"
      >
        Marcar SIMAT cargado
      </button>
    )}
  </div>
</div>

      {/* Datos de la matrícula */}
      <Seccion titulo="Datos de la matrícula" icono="how_to_reg">
        <Campo etiqueta="Folio" valor={matricula.consecutivo} />
        <Campo etiqueta="Tipo" valor={matricula.tipo} />
        <Campo etiqueta="Fecha de registro" valor={formatearFecha(matricula.fecha)} />
        <Campo etiqueta="Grado" valor={matricula.grado?.nombre ?? "—"} />
        <Campo etiqueta="Grupo" valor={matricula.grupo?.denominacion ?? "— Sin asignar —"} />
        <Campo etiqueta="Registro SIMAT" valor={simatCargado ? "Cargado" : "Pendiente"} />
      </Seccion>
      
      {/* Datos del estudiante */}
      <Seccion
  titulo="Datos del estudiante"
  icono="person"
  accion={
    <button
      onClick={() => navigate(`/estudiantes/${matricula.estudiante.idEstudiante}`)}
      className="flex items-center gap-1 text-[13px] font-semibold text-sidebar-bg hover:underline"
    >
      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
      Ver ficha completa
    </button>
  }
>
        <Campo etiqueta="Nombre completo" valor={nombreCompleto(e)} />
        <Campo etiqueta="Tipo de documento" valor={e.tipoDocumento} />
        <Campo etiqueta="Número de documento" valor={e.numeroDocumento} />
        <Campo etiqueta="Fecha de nacimiento" valor={e.fechaNacimiento ? formatearFecha(e.fechaNacimiento) : "—"} />
        <Campo etiqueta="Lugar de nacimiento" valor={e.lugarNacimiento ?? "—"} />
        <Campo etiqueta="Sexo" valor={e.sexo ?? "—"} />
        <Campo etiqueta="Nacionalidad" valor={e.nacionalidad ?? "—"} />
        <Campo etiqueta="Teléfono" valor={e.movil ?? e.telefono ?? "—"} />
        <Campo etiqueta="Dirección" valor={e.direccion ?? "—"} />
        <Campo etiqueta="Barrio" valor={e.barrio ?? "—"} />
      </Seccion>

      {matricula.conceptoPsicopedagogico && (
        <Seccion titulo="Concepto psicopedagógico" icono="psychology">
          <div className="col-span-full">
            <p className="text-[14px] text-text-main">{matricula.conceptoPsicopedagogico}</p>
          </div>
        </Seccion>
      )}
      <DocumentosAnexosSection idMatricula={matricula.idMatricula} />
      {/* Diálogo de confirmación */}
      {confirmacion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-headline text-[18px] font-semibold text-text-main mb-3">
              Confirmar acción
            </h3>
            <p className="text-[14px] text-text-muted mb-4">{confirmacion.mensaje}</p>

            {errorAccion && (
              <div className="text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 mb-4">
                {errorAccion}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmacion(null);
                  setErrorAccion(null);
                }}
                disabled={procesando}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-text-muted hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarAccion}
                disabled={procesando}
                className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-60"
              >
                {procesando ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Subcomponentes ---------- */

function Seccion({ titulo, icono, children, accion }: { titulo: string; icono: string; children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
      <div className="flex items-center justify-between gap-2 mb-6 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sidebar-bg">{icono}</span>
          <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">{titulo}</h3>
        </div>
        {accion}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        {children}
      </div>
    </div>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-[12px] text-text-muted uppercase tracking-wide mb-1">{etiqueta}</p>
      <p className="text-[14px] text-text-main font-medium">{valor}</p>
    </div>
  );
}