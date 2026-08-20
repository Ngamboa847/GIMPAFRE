import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation  } from "react-router";
import { obtenerEstudiante, actualizarEstudiante } from "./api";
import type { Estudiante } from "./types";
import { nombreCompleto, iniciales, formatearFecha } from "../matriculas/presentacion";
import { ApiError } from "../../shared/api/client";
import { FamiliaresSection } from "../familiares/FamiliaresSection";


const TIPOS_DOC = [
  { value: "RC", label: "R.C. - Registro Civil" },
  { value: "TI", label: "T.I. - Tarjeta de Identidad" },
  { value: "CC", label: "C.C. - Cédula de Ciudadanía" },
  { value: "CE", label: "C.E. - Cédula de Extranjería" },
];

const SEXOS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];

export function EstudianteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoEditar = searchParams.get("editar") === "1";
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const volverA = (location.state as { volverA?: string } | null)?.volverA;
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Estudiante | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  useEffect(() => {
  let activo = true;
  async function cargar() {
    try {
      const datos = await obtenerEstudiante(Number(id));
      if (activo) {
        setEstudiante(datos);
        setCargando(false);
        if (autoEditar) {
          setBorrador({ ...datos });
          setEditando(true);
        }
      }
    } catch {
      if (activo) {
        setError("No se pudo cargar el estudiante.");
        setCargando(false);
      }
    }
  }
  cargar();
  return () => {
    activo = false;
  };
}, [id]);

  function iniciarEdicion() {
    if (!estudiante) return;
    setBorrador({ ...estudiante });
    setErrorGuardado(null);
    setEditando(true);
  }

  function cancelarEdicion() {
    setEditando(false);
    setBorrador(null);
    setErrorGuardado(null);
  }

  function actualizarCampo(campo: keyof Estudiante, valor: string) {
    setBorrador((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  }

  function actualizarCampoNumerico(campo: keyof Estudiante, valor: string) {
    setBorrador((prev) =>
      prev ? { ...prev, [campo]: valor === "" ? undefined : Number(valor) } : prev
    );
  }

  async function guardar() {
    if (!borrador) return;
    setGuardando(true);
    setErrorGuardado(null);
    try {
      // Se manda el objeto COMPLETO: el borrador parte de una copia del
      // estudiante ya cargado por GET, así que los campos no tocados en este
      // formulario viajan igual. Esto resuelve el bug de "campos en null"
      // que tenía el wizard (que solo conocía un subconjunto de 15 campos).
      const actualizado = await actualizarEstudiante(Number(id), borrador);
      setEstudiante(actualizado);
      setEditando(false);
      setBorrador(null);
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar los cambios.";
        setErrorGuardado(msg);
      } else {
        setErrorGuardado("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="text-text-muted text-[14px]">Cargando estudiante...</p>;
  }
  if (error || !estudiante) {
    return (
      <div>
        <p className="text-error text-[14px] mb-4">{error ?? "Estudiante no encontrado."}</p>
        <button onClick={() => (volverA ? navigate(volverA) : navigate(-1))} className="text-sidebar-bg text-[14px] underline">
          Volver
        </button>
      </div>
    );
  }

  const datos = editando ? borrador! : estudiante;

  return (
    <>
      <button
        onClick={() => (volverA ? navigate(volverA) : navigate(-1))}
        className="flex items-center gap-1 text-text-muted text-[13px] hover:text-text-main mb-4"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver
      </button>

      {/* Encabezado: avatar + nombre + acciones */}
      <div className="flex justify-between items-start mb-stack-lg gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sidebar-bg/10 text-sidebar-bg flex items-center justify-center text-[18px] font-bold shrink-0 overflow-hidden">
            {estudiante.fotografia ? (
              <img src={estudiante.fotografia} alt="" className="w-full h-full object-cover" />
            ) : (
              iniciales(estudiante)
            )}
          </div>
          <div>
            <h1 className="font-headline text-[28px] font-bold text-text-main">
              {nombreCompleto(estudiante)}
            </h1>
            <p className="font-body text-[14px] text-text-muted mt-1">
              {estudiante.tipoDocumento} {estudiante.numeroDocumento}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editando ? (
            <>
              <button
                onClick={cancelarEdicion}
                disabled={guardando}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-border-subtle text-text-muted hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          ) : (
            <button
              onClick={iniciarEdicion}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-sidebar-bg text-white hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar
            </button>
          )}
        </div>
      </div>

      {errorGuardado && (
        <div className="mb-stack-md text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
          {errorGuardado}
        </div>
      )}

      {/* Identificación */}
      <Seccion titulo="Identificación" icono="badge">
        {editando ? (
          <>
            <CampoTexto label="Primer nombre *" valor={datos.primerNombre} onChange={(v) => actualizarCampo("primerNombre", v)} />
            <CampoTexto label="Segundo nombre" valor={datos.segundoNombre ?? ""} onChange={(v) => actualizarCampo("segundoNombre", v)} />
            <CampoTexto label="Primer apellido *" valor={datos.primerApellido} onChange={(v) => actualizarCampo("primerApellido", v)} />
            <CampoTexto label="Segundo apellido" valor={datos.segundoApellido ?? ""} onChange={(v) => actualizarCampo("segundoApellido", v)} />
            <CampoSelect label="Tipo de documento *" valor={datos.tipoDocumento} opciones={TIPOS_DOC} onChange={(v) => actualizarCampo("tipoDocumento", v)} />
            <CampoTexto label="Número de documento *" valor={datos.numeroDocumento} onChange={(v) => actualizarCampo("numeroDocumento", v)} />
            <CampoTexto label="Lugar de expedición" valor={datos.lugarExpedicionDoc ?? ""} onChange={(v) => actualizarCampo("lugarExpedicionDoc", v)} />
            <CampoTexto label="Fecha de nacimiento *" tipo="date" valor={datos.fechaNacimiento} onChange={(v) => actualizarCampo("fechaNacimiento", v)} />
            <CampoTexto label="Lugar de nacimiento" valor={datos.lugarNacimiento ?? ""} onChange={(v) => actualizarCampo("lugarNacimiento", v)} />
            <CampoSelect label="Sexo *" valor={datos.sexo} opciones={SEXOS} onChange={(v) => actualizarCampo("sexo", v)} />
            <CampoTexto label="Nacionalidad" valor={datos.nacionalidad ?? ""} onChange={(v) => actualizarCampo("nacionalidad", v)} />
            <CampoTexto label="URL de fotografía" valor={datos.fotografia ?? ""} onChange={(v) => actualizarCampo("fotografia", v)} />
          </>
        ) : (
          <>
            <CampoLectura etiqueta="Tipo de documento" valor={datos.tipoDocumento} />
            <CampoLectura etiqueta="Número de documento" valor={datos.numeroDocumento} />
            <CampoLectura etiqueta="Lugar de expedición" valor={datos.lugarExpedicionDoc} />
            <CampoLectura etiqueta="Fecha de nacimiento" valor={datos.fechaNacimiento ? formatearFecha(datos.fechaNacimiento) : undefined} />
            <CampoLectura etiqueta="Lugar de nacimiento" valor={datos.lugarNacimiento} />
            <CampoLectura etiqueta="Sexo" valor={datos.sexo} />
            <CampoLectura etiqueta="Nacionalidad" valor={datos.nacionalidad} />
          </>
        )}
      </Seccion>

      {/* Residencia y contacto */}
      <Seccion titulo="Residencia y contacto" icono="home_pin">
        {editando ? (
          <>
            <CampoTexto label="Dirección" valor={datos.direccion ?? ""} onChange={(v) => actualizarCampo("direccion", v)} />
            <CampoTexto label="Barrio" valor={datos.barrio ?? ""} onChange={(v) => actualizarCampo("barrio", v)} />
            <CampoTexto label="Teléfono" valor={datos.telefono ?? ""} onChange={(v) => actualizarCampo("telefono", v)} />
            <CampoTexto label="Móvil" valor={datos.movil ?? ""} onChange={(v) => actualizarCampo("movil", v)} />
          </>
        ) : (
          <>
            <CampoLectura etiqueta="Dirección" valor={datos.direccion} />
            <CampoLectura etiqueta="Barrio" valor={datos.barrio} />
            <CampoLectura etiqueta="Teléfono" valor={datos.telefono} />
            <CampoLectura etiqueta="Móvil" valor={datos.movil} />
          </>
        )}
      </Seccion>

      {/* Salud */}
      <Seccion titulo="Salud" icono="health_and_safety">
        {editando ? (
          <>
            <CampoTexto label="SISBEN" valor={datos.sisben ?? ""} onChange={(v) => actualizarCampo("sisben", v)} />
            <CampoNumero label="Estrato" valor={datos.estrato} onChange={(v) => actualizarCampoNumerico("estrato", v)} />
            <CampoTexto label="Grupo sanguíneo" valor={datos.grupoSanguineo ?? ""} onChange={(v) => actualizarCampo("grupoSanguineo", v)} />
            <CampoNumero label="Talla (m)" valor={datos.talla} onChange={(v) => actualizarCampoNumerico("talla", v)} paso="0.01" />
            <CampoNumero label="Peso (kg)" valor={datos.peso} onChange={(v) => actualizarCampoNumerico("peso", v)} paso="0.1" />
            <CampoTexto label="Información seguridad social" valor={datos.infoSeguridadSocial ?? ""} onChange={(v) => actualizarCampo("infoSeguridadSocial", v)} />
            <CampoTexto label="Número de afiliación" valor={datos.numeroAfiliacion ?? ""} onChange={(v) => actualizarCampo("numeroAfiliacion", v)} />
            <CampoTextoLargo label="Diagnóstico clínico" valor={datos.diagnosticoClinico ?? ""} onChange={(v) => actualizarCampo("diagnosticoClinico", v)} />
          </>
        ) : (
          <>
            <CampoLectura etiqueta="SISBEN" valor={datos.sisben} />
            <CampoLectura etiqueta="Estrato" valor={datos.estrato?.toString()} />
            <CampoLectura etiqueta="Grupo sanguíneo" valor={datos.grupoSanguineo} />
            <CampoLectura etiqueta="Talla" valor={datos.talla ? `${datos.talla} m` : undefined} />
            <CampoLectura etiqueta="Peso" valor={datos.peso ? `${datos.peso} kg` : undefined} />
            <CampoLectura etiqueta="Información seguridad social" valor={datos.infoSeguridadSocial} />
            <CampoLectura etiqueta="Número de afiliación" valor={datos.numeroAfiliacion} />
            <CampoLectura etiqueta="Diagnóstico clínico" valor={datos.diagnosticoClinico} ancho="full" />
          </>
        )}
      </Seccion>

      {/* Familia y contexto */}
      <Seccion titulo="Familia y contexto" icono="diversity_3">
        {editando ? (
          <>
            <CampoTexto label="Pertenencia étnica" valor={datos.pertenenciaEtnica ?? ""} onChange={(v) => actualizarCampo("pertenenciaEtnica", v)} />
            <CampoTexto label="Área de interés" valor={datos.areaInteres ?? ""} onChange={(v) => actualizarCampo("areaInteres", v)} />
            <CampoTexto label="Área de dificultad" valor={datos.areaDificultad ?? ""} onChange={(v) => actualizarCampo("areaDificultad", v)} />
            <CampoNumero label="Número de hermanos" valor={datos.numeroHermanos} onChange={(v) => actualizarCampoNumerico("numeroHermanos", v)} />
            <CampoNumero label="Hermanas (mujeres)" valor={datos.hermanosMujeres} onChange={(v) => actualizarCampoNumerico("hermanosMujeres", v)} />
            <CampoNumero label="Hermanos (hombres)" valor={datos.hermanosHombres} onChange={(v) => actualizarCampoNumerico("hermanosHombres", v)} />
            <CampoNumero label="Lugar entre hermanos" valor={datos.lugarEntreHermanos} onChange={(v) => actualizarCampoNumerico("lugarEntreHermanos", v)} />
            <CampoTexto label="Con quién vive" valor={datos.conQuienVive ?? ""} onChange={(v) => actualizarCampo("conQuienVive", v)} />
            <CampoTextoLargo label="Observaciones" valor={datos.observaciones ?? ""} onChange={(v) => actualizarCampo("observaciones", v)} />
          </>
        ) : (
          <>
            <CampoLectura etiqueta="Pertenencia étnica" valor={datos.pertenenciaEtnica} />
            <CampoLectura etiqueta="Área de interés" valor={datos.areaInteres} />
            <CampoLectura etiqueta="Área de dificultad" valor={datos.areaDificultad} />
            <CampoLectura etiqueta="Número de hermanos" valor={datos.numeroHermanos?.toString()} />
            <CampoLectura etiqueta="Hermanas (mujeres)" valor={datos.hermanosMujeres?.toString()} />
            <CampoLectura etiqueta="Hermanos (hombres)" valor={datos.hermanosHombres?.toString()} />
            <CampoLectura etiqueta="Lugar entre hermanos" valor={datos.lugarEntreHermanos?.toString()} />
            <CampoLectura etiqueta="Con quién vive" valor={datos.conQuienVive} />
            <CampoLectura etiqueta="Observaciones" valor={datos.observaciones} ancho="full" />
          </>
        )}
      </Seccion>
      <FamiliaresSection estudiante={estudiante} editando={editando} />
    </>
  );
}

/* ---------- Subcomponentes ---------- */

function Seccion({ titulo, icono, children }: { titulo: string; icono: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
        <span className="material-symbols-outlined text-sidebar-bg">{icono}</span>
        <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">{titulo}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        {children}
      </div>
    </div>
  );
}

function CampoLectura({ etiqueta, valor, ancho }: { etiqueta: string; valor?: string; ancho?: "full" }) {
  return (
    <div className={ancho === "full" ? "col-span-full" : undefined}>
      <p className="text-[12px] text-text-muted uppercase tracking-wide mb-1">{etiqueta}</p>
      <p className="text-[14px] text-text-main font-medium">{valor && valor.trim() !== "" ? valor : "—"}</p>
    </div>
  );
}

function CampoTexto({ label, valor, onChange, tipo = "text" }: { label: string; valor: string; onChange: (v: string) => void; tipo?: string }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <input type={tipo} value={valor} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none" />
    </div>
  );
}

function CampoTextoLargo({ label, valor, onChange }: { label: string; valor: string; onChange: (v: string) => void }) {
  return (
    <div className="col-span-full">
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <textarea value={valor} onChange={(e) => onChange(e.target.value)} rows={3}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none resize-y" />
    </div>
  );
}

function CampoNumero({ label, valor, onChange, paso }: { label: string; valor?: number; onChange: (v: string) => void; paso?: string }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <input type="number" step={paso} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none" />
    </div>
  );
}

function CampoSelect({ label, valor, opciones, onChange }: { label: string; valor: string; opciones: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <select value={valor} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none">
        <option value="">Seleccione...</option>
        {opciones.map((op) => (<option key={op.value} value={op.value}>{op.label}</option>))}
      </select>
    </div>
  );
}