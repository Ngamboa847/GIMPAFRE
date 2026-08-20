import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  buscarEstudiantePorDocumento,
  crearEstudiante,
  actualizarEstudiante,
} from "../estudiantes/api";
import type { Estudiante } from "../estudiantes/types";
import { crearMatricula, actualizarMatricula, obtenerMatricula } from "./api";
import type { Matricula } from "./types";
import { listarAnosLectivos } from "../configuracion/anos-lectivos/api";
import { listarGrados } from "../configuracion/grados/api";
import { listarGruposPorGradoYAno } from "../configuracion/grupos/api";
import type { AnoLectivo } from "../configuracion/anos-lectivos/types";
import type { Grado } from "../configuracion/grados/types";
import type { Grupo } from "../configuracion/grupos/types";
import { ApiError } from "../../shared/api/client";
import { nombreCompleto } from "./presentacion";
import { DocumentosAnexosSection } from "../documentos-anexos/DocumentosAnexosSection";
const ESTUDIANTE_VACIO: Estudiante = {
  tipoDocumento: "",
  numeroDocumento: "",
  lugarExpedicionDoc: "",
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  sexo: "",
  fechaNacimiento: "",
  lugarNacimiento: "",
  nacionalidad: "",
  direccion: "",
  barrio: "",
  telefono: "",
  movil: "",
};

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

const TIPOS_MATRICULA = [
  { value: "NUEVA", label: "Nueva" },
  { value: "REINGRESO", label: "Reingreso" },
  { value: "TRASLADO", label: "Traslado" },
];

export function RegistrarMatriculaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const modoEdicion = Boolean(id);
  const [paso, setPaso] = useState(1);

  // --- Datos del estudiante (Paso 1, no aplica en modo edición) ---
  const [estudiante, setEstudiante] = useState<Estudiante>(ESTUDIANTE_VACIO);
  const [idExistente, setIdExistente] = useState<number | null>(null);
  const [documentoResuelto, setDocumentoResuelto] = useState(false);
  const [docBusqueda, setDocBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [avisoBusqueda, setAvisoBusqueda] = useState<{ tipo: "encontrado" | "libre" | "error"; texto: string } | null>(null);
  const [creandoComplementarios, setCreandoComplementarios] = useState(false);
  const [errorComplementarios, setErrorComplementarios] = useState<string | null>(null);
  // --- Datos académicos (Paso 2, y también el formulario de edición) ---
  const [anoLectivo, setAnoLectivo] = useState<AnoLectivo | null>(null);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [idGrado, setIdGrado] = useState("");
  const [idGrupo, setIdGrupo] = useState("");
  const [tipoMatricula, setTipoMatricula] = useState("NUEVA");
  const [conceptoPsicopedagogico, setConceptoPsicopedagogico] = useState("");
  // Grupo pendiente por restaurar cuando, en modo edición, la carga inicial
  // fija idGrado y eso dispara el efecto que recalcula la lista de grupos
  // (y normalmente resetearía la selección a vacío).
  const [idGrupoObjetivo, setIdGrupoObjetivo] = useState<string | null>(null);

  // --- Envío (creación) y Paso 3 (documentos) ---
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [matriculaCreada, setMatriculaCreada] = useState<Matricula | null>(null);

  // --- Modo edición: carga de la matrícula existente y guardado ---
  const [matriculaOriginal, setMatriculaOriginal] = useState<Matricula | null>(null);
  const [cargandoMatricula, setCargandoMatricula] = useState(modoEdicion);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  // Cargar año lectivo activo + grados al montar. La matrícula de la grilla
  // que se puede editar siempre pertenece a este mismo año lectivo (la
  // grilla solo lista matrículas de "el año más reciente"), así que no hace
  // falta derivarlo de la matrícula cargada — y de hecho no se puede: el
  // tipo Matricula del frontend no trae anoLectivo.
  useEffect(() => {
    async function cargar() {
      try {
        const [anos, gradosData] = await Promise.all([listarAnosLectivos(), listarGrados()]);
        const activo =
          anos.length > 0
            ? [...anos].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))[0]
            : null;
        setAnoLectivo(activo);
        setGrados(gradosData);
      } catch {
        // Si falla, el paso 2 (o el formulario de edición) lo indicará al intentar avanzar/guardar.
      }
    }
    cargar();
  }, []);

  // En modo edición, cargar la matrícula existente y fijar el formulario con
  // sus datos. Paso 1 no aplica: el estudiante ya está resuelto.
  useEffect(() => {
    if (!id) return;
    let activo = true;
    async function cargarMatricula() {
      try {
        const m = await obtenerMatricula(Number(id));
        if (!activo) return;
        setMatriculaOriginal(m);
        setEstudiante(m.estudiante);
        setIdExistente(m.estudiante.idEstudiante ?? null);
        setIdGrado(m.grado ? String(m.grado.idGrado) : "");
        setIdGrupoObjetivo(m.grupo ? String(m.grupo.idGrupo) : "");
        setTipoMatricula(m.tipo);
        setConceptoPsicopedagogico(m.conceptoPsicopedagogico ?? "");
      } catch {
        if (activo) setErrorCarga("No se pudo cargar la matrícula.");
      } finally {
        if (activo) setCargandoMatricula(false);
      }
    }
    cargarMatricula();
    return () => {
      activo = false;
    };
  }, [id]);

  // Al cambiar el grado (o el año lectivo), recargar sus grupos.
  // Si hay un idGrupoObjetivo pendiente (carga inicial en modo edición), se
  // restaura una vez llega la lista, en vez de resetear la selección a vacío.
  useEffect(() => {
    if (idGrupoObjetivo === null) {
      setIdGrupo("");
    }
    if (!idGrado || !anoLectivo) {
      setGrupos([]);
      return;
    }
    let activo = true;
    listarGruposPorGradoYAno(Number(idGrado), anoLectivo.idAnoLectivo)
      .then((data) => {
        if (!activo) return;
        setGrupos(data);
        if (idGrupoObjetivo !== null) {
          setIdGrupo(idGrupoObjetivo);
          setIdGrupoObjetivo(null);
        }
      })
      .catch(() => activo && setGrupos([]));
    return () => {
      activo = false;
    };
  }, [idGrado, anoLectivo, idGrupoObjetivo]);

    // Si venimos de vuelta desde "Capturar datos complementarios", el documento
// viaja en la URL — se autobusca una sola vez al montar, sin que el usuario
// tenga que volver a digitarlo. No aplica en modo edición (no hay Paso 1).
useEffect(() => {
  if (modoEdicion) return;
  const documentoRetorno = searchParams.get("documento");
  if (documentoRetorno) {
    setDocBusqueda(documentoRetorno);
    buscarDocumento(documentoRetorno);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  function actualizarCampo(campo: keyof Estudiante, valor: string) {
    setEstudiante((prev) => ({ ...prev, [campo]: valor }));
  }

  async function buscarDocumento(valorForzado?: string) {
  const doc = (valorForzado ?? docBusqueda).trim();
  if (!doc) return;
  setBuscando(true);
  setAvisoBusqueda(null);
  try {
    const encontrado = await buscarEstudiantePorDocumento(doc);
    if (encontrado) {
      setEstudiante({ ...ESTUDIANTE_VACIO, ...encontrado });
      setIdExistente(encontrado.idEstudiante ?? null);
      setAvisoBusqueda({ tipo: "encontrado", texto: "Estudiante encontrado. Verifica los datos y actualiza si es necesario." });
    } else {
      setEstudiante({ ...ESTUDIANTE_VACIO, numeroDocumento: doc });
      setIdExistente(null);
      setAvisoBusqueda({ tipo: "libre", texto: "Documento libre. Completa los datos para registrar al nuevo estudiante." });
    }
    setDocumentoResuelto(true);
  } catch {
    setAvisoBusqueda({ tipo: "error", texto: "Error al buscar el estudiante. Intenta de nuevo." });
    setDocumentoResuelto(false);
  } finally {
    setBuscando(false);
  }
}

  // Validación mínima para avanzar del paso 1.
  const paso1Valido =
    estudiante.primerNombre.trim() &&
    estudiante.primerApellido.trim() &&
    estudiante.tipoDocumento &&
    estudiante.numeroDocumento.trim() &&
    estudiante.sexo &&
    estudiante.fechaNacimiento;

  const paso2Valido = idGrado && anoLectivo && tipoMatricula;

  // Guarda (crea o actualiza) el estudiante con lo que ya está en el wizard,
// y navega a su ficha completa en modo edición para capturar Salud, Familia
// y Familiares. Si el estudiante era nuevo, de acá en adelante el wizard lo
// trata como existente (idExistente queda seteado).
async function capturarDatosComplementarios() {
  if (!paso1Valido) return;
  setCreandoComplementarios(true);
  setErrorComplementarios(null);
  try {
    let idFinal: number;
    if (idExistente) {
      const actualizado = await actualizarEstudiante(idExistente, estudiante);
      idFinal = actualizado.idEstudiante!;
    } else {
      const creado = await crearEstudiante(estudiante);
      idFinal = creado.idEstudiante!;
      setIdExistente(idFinal);
    }
    const volverA = `${window.location.pathname}?documento=${encodeURIComponent(estudiante.numeroDocumento)}`;
    navigate(`/estudiantes/${idFinal}?editar=1`, { state: { volverA } });
  } catch (err) {
    if (err instanceof ApiError) {
      setErrorComplementarios((err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el estudiante.");
    } else {
      setErrorComplementarios("No se pudo conectar con el servidor.");
    }
  } finally {
    setCreandoComplementarios(false);
  }
}

  // Resuelve estudiante + crea la matrícula (igual que antes), pero en vez de
  // navegar fuera del wizard, guarda la matrícula creada y avanza al Paso 3
  // ("Documentos"), donde ya se puede gestionar DocumentoAnexo porque
  // idMatricula existe. Si ya se había creado en este montaje (por ejemplo,
  // el usuario ya avanzó una vez), no se vuelve a crear — solo se avanza,
  // para no disparar el 409 de "ya tiene matrícula en este año".
  async function continuarADocumentos() {
    if (!anoLectivo || !idGrado) return;
    if (matriculaCreada) {
      setPaso(3);
      return;
    }
    setEnviando(true);
    setErrorEnvio(null);
    try {
      // 1. Resolver estudiante (crear o actualizar).
      let idEstudianteFinal: number;
      if (idExistente) {
        const actualizado = await actualizarEstudiante(idExistente, estudiante);
        idEstudianteFinal = actualizado.idEstudiante!;
      } else {
        const creado = await crearEstudiante(estudiante);
        idEstudianteFinal = creado.idEstudiante!;
      }

      // 2. Crear matrícula. El servidor fija estado (TRAMITE), fecha,
      //    consecutivo y SIMAT (PENDIENTE); el front solo envía 'tipo'.
      const matricula = await crearMatricula(
        { tipo: tipoMatricula },
        {
          idEstudiante: idEstudianteFinal,
          idAnoLectivo: anoLectivo.idAnoLectivo,
          idGrado: Number(idGrado),
          idGrupo: idGrupo ? Number(idGrupo) : undefined,
        }
      );

      // 3. La matrícula ya existe: avanzar a "Documentos" en vez de salir del wizard.
      setMatriculaCreada(matricula);
      setPaso(3);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorEnvio("Este estudiante ya tiene una matrícula registrada en el año lectivo seleccionado.");
        } else if (err.status === 404) {
          setErrorEnvio("Alguno de los datos seleccionados (grado, grupo o año) no existe. Revisa la selección.");
        } else {
          setErrorEnvio(
            (err.body as { mensaje?: string })?.mensaje ?? "No se pudo registrar la matrícula."
          );
        }
      } else {
        setErrorEnvio("No se pudo conectar con el servidor.");
      }
    } finally {
      setEnviando(false);
    }
  }

  // Guarda los cambios de una matrícula existente (grado, grupo, tipo,
  // concepto psicopedagógico). Parte de la copia completa cargada al montar
  // (matriculaOriginal) y la envía completa de vuelta (D-F2), con grado/grupo
  // resueltos por query param porque así los lee MatriculaService.actualizar.
  async function guardarEdicion() {
    if (!id || !matriculaOriginal || !idGrado) return;
    setGuardandoEdicion(true);
    setErrorEdicion(null);
    try {
      const datos: Matricula = {
        ...matriculaOriginal,
        tipo: tipoMatricula,
        conceptoPsicopedagogico: conceptoPsicopedagogico || undefined,
      };
      const actualizada = await actualizarMatricula(Number(id), datos, {
        idGrado: Number(idGrado),
        idGrupo: idGrupo ? Number(idGrupo) : undefined,
      });
      navigate(`/matriculas/${actualizada.idMatricula}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorEdicion((err.body as { mensaje?: string })?.mensaje ?? "No se pudo actualizar la matrícula.");
      } else {
        setErrorEdicion("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardandoEdicion(false);
    }
  }

  const gradoSel = grados.find((g) => String(g.idGrado) === idGrado);
  const grupoSel = grupos.find((g) => String(g.idGrupo) === idGrupo);

  // ===================== MODO EDICIÓN =====================
  if (modoEdicion) {
    return (
      <>
        <button
          onClick={() => navigate(`/matriculas/${id}`)}
          className="flex items-center gap-1 text-text-muted text-[13px] hover:text-text-main mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a la matrícula
        </button>

        <h1 className="font-headline text-[28px] font-bold text-text-main mb-1">Editar matrícula</h1>

        {cargandoMatricula ? (
          <p className="font-body text-[14px] text-text-muted">Cargando matrícula...</p>
        ) : errorCarga ? (
          <p className="font-body text-[14px] text-error">{errorCarga}</p>
        ) : (
          <>
            <p className="font-body text-[14px] text-text-muted mb-stack-lg">
              {nombreCompleto(estudiante)} · {estudiante.tipoDocumento} {estudiante.numeroDocumento}
              {matriculaOriginal ? ` · Folio ${matriculaOriginal.consecutivo}` : ""}
            </p>

            <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
                <span className="material-symbols-outlined text-sidebar-bg">school</span>
                <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Datos académicos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-text-main mb-1">Año lectivo</label>
                  <input
                    type="text"
                    value={anoLectivo?.denominacion ?? "—"}
                    disabled
                    className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-surface-container-low text-text-muted"
                  />
                </div>
                <CampoSelect
                  label="Grado *"
                  valor={idGrado}
                  opciones={grados.map((g) => ({ value: String(g.idGrado), label: g.nombre }))}
                  onChange={setIdGrado}
                />
                <div>
                  <label className="block text-[12px] font-semibold text-text-main mb-1">Grupo</label>
                  <select
                    value={idGrupo}
                    onChange={(e) => setIdGrupo(e.target.value)}
                    disabled={!idGrado || grupos.length === 0}
                    className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none disabled:bg-surface-container-low disabled:text-text-muted"
                  >
                    <option value="">{!idGrado ? "Seleccione un grado primero" : grupos.length === 0 ? "Sin grupos disponibles" : "Sin asignar"}</option>
                    {grupos.map((g) => (
                      <option key={g.idGrupo} value={String(g.idGrupo)}>{g.denominacion}</option>
                    ))}
                  </select>
                </div>
                <CampoSelect label="Tipo de matrícula *" valor={tipoMatricula} opciones={TIPOS_MATRICULA} onChange={setTipoMatricula} />
              </div>
              <div className="mt-6">
                <label className="block text-[12px] font-semibold text-text-main mb-1">Concepto psicopedagógico</label>
                <textarea
                  value={conceptoPsicopedagogico}
                  onChange={(e) => setConceptoPsicopedagogico(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
                />
              </div>
              <p className="mt-4 text-[12px] text-text-muted">
                Grado: <strong>{gradoSel?.nombre ?? "—"}</strong> · Grupo: <strong>{grupoSel?.denominacion ?? "Sin asignar"}</strong>
              </p>
            </div>

            {errorEdicion && (
              <div className="mb-stack-md text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
                {errorEdicion}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => navigate(`/matriculas/${id}`)}
                disabled={guardandoEdicion}
                className="px-6 py-2.5 rounded-lg text-[14px] font-semibold border border-border-subtle text-text-muted hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={guardandoEdicion || !paso2Valido}
                className="px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </>
        )}
      </>
    );
  }

  // ===================== MODO CREACIÓN (wizard original) =====================
  return (
    <>
      <button
        onClick={() => navigate("/matriculas")}
        className="flex items-center gap-1 text-text-muted text-[13px] hover:text-text-main mb-4"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a Matrículas
      </button>

      <h1 className="font-headline text-[28px] font-bold text-text-main mb-1">Registrar matrícula</h1>
      <p className="font-body text-[14px] text-text-muted mb-stack-lg">
        {anoLectivo ? anoLectivo.denominacion : "Cargando año lectivo..."}
      </p>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-4 mb-stack-lg">
        <PasoIndicador numero={1} activo={paso === 1} completado={paso > 1} label="Datos del estudiante" />
        <div className="flex-1 h-px bg-border-subtle" />
        <PasoIndicador numero={2} activo={paso === 2} completado={paso > 2} label="Datos académicos" />
        <div className="flex-1 h-px bg-border-subtle" />
        <PasoIndicador numero={3} activo={paso === 3} completado={false} label="Documentos" />
      </div>

      {/* ===================== PASO 1 ===================== */}
      {paso === 1 && (
        <>
          <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-sidebar-bg">search</span>
              <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Identificar estudiante</h3>
            </div>
            <p className="text-[13px] text-text-muted mb-4">
              Ingresa el número de documento. Si el estudiante ya existe, cargaremos sus datos.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={docBusqueda}
                onChange={(e) => setDocBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarDocumento()}
                placeholder="Número de documento"
                className="flex-1 max-w-xs px-4 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
              />
              <button
                onClick={() => buscarDocumento()}
                disabled={buscando || !docBusqueda.trim()}
                className="px-5 py-2.5 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buscando ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {avisoBusqueda && (
              <div className={`mt-4 text-[13px] rounded-lg px-3 py-2 ${
                avisoBusqueda.tipo === "encontrado" ? "bg-status-success/10 text-status-success"
                : avisoBusqueda.tipo === "libre" ? "bg-sidebar-bg/5 text-sidebar-bg"
                : "bg-error/10 text-error"}`}>
                {avisoBusqueda.texto}
              </div>
            )}
          </div>

          {documentoResuelto && (
            <>
              <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sidebar-bg">person</span>
                    <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Identificación</h3>
                  </div>
                  {idExistente && (
                    <span className="text-[12px] bg-status-success/10 text-status-success px-3 py-1 rounded-full font-medium">Actualizando existente</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  <CampoTexto label="Primer nombre *" valor={estudiante.primerNombre} onChange={(v) => actualizarCampo("primerNombre", v)} />
                  <CampoTexto label="Segundo nombre" valor={estudiante.segundoNombre ?? ""} onChange={(v) => actualizarCampo("segundoNombre", v)} />
                  <CampoTexto label="Primer apellido *" valor={estudiante.primerApellido} onChange={(v) => actualizarCampo("primerApellido", v)} />
                  <CampoTexto label="Segundo apellido" valor={estudiante.segundoApellido ?? ""} onChange={(v) => actualizarCampo("segundoApellido", v)} />
                  <CampoSelect label="Tipo de documento *" valor={estudiante.tipoDocumento} opciones={TIPOS_DOC} onChange={(v) => actualizarCampo("tipoDocumento", v)} />
                  <CampoTexto label="Número de documento *" valor={estudiante.numeroDocumento} onChange={(v) => actualizarCampo("numeroDocumento", v)} />
                  <CampoTexto label="Lugar de expedición" valor={estudiante.lugarExpedicionDoc ?? ""} onChange={(v) => actualizarCampo("lugarExpedicionDoc", v)} />
                  <CampoTexto label="Fecha de nacimiento *" tipo="date" valor={estudiante.fechaNacimiento} onChange={(v) => actualizarCampo("fechaNacimiento", v)} />
                  <CampoTexto label="Lugar de nacimiento" valor={estudiante.lugarNacimiento ?? ""} onChange={(v) => actualizarCampo("lugarNacimiento", v)} />
                  <CampoSelect label="Sexo *" valor={estudiante.sexo} opciones={SEXOS} onChange={(v) => actualizarCampo("sexo", v)} />
                  <CampoTexto label="Nacionalidad" valor={estudiante.nacionalidad ?? ""} onChange={(v) => actualizarCampo("nacionalidad", v)} />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
                  <span className="material-symbols-outlined text-sidebar-bg">home_pin</span>
                  <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Residencia y contacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <CampoTexto label="Dirección" valor={estudiante.direccion ?? ""} onChange={(v) => actualizarCampo("direccion", v)} />
                  <CampoTexto label="Barrio" valor={estudiante.barrio ?? ""} onChange={(v) => actualizarCampo("barrio", v)} />
                  <CampoTexto label="Teléfono" valor={estudiante.telefono ?? ""} onChange={(v) => actualizarCampo("telefono", v)} />
                  <CampoTexto label="Móvil" valor={estudiante.movil ?? ""} onChange={(v) => actualizarCampo("movil", v)} />
                </div>
                <div className="mt-6 pt-4 border-t border-border-subtle">
  <button
    onClick={capturarDatosComplementarios}
    disabled={!paso1Valido || creandoComplementarios}
    title={!paso1Valido ? "Completa los campos obligatorios de identificación primero" : undefined}
    className="flex items-center gap-2 text-[13px] font-medium text-sidebar-bg border border-sidebar-bg rounded-lg px-4 py-2 hover:bg-sidebar-bg/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:text-text-muted disabled:border-border-subtle disabled:hover:bg-transparent"
  >
    <span className="material-symbols-outlined text-[18px]">note_add</span>
    {creandoComplementarios ? "Guardando..." : "Capturar datos complementarios"}
  </button>
  {errorComplementarios && (
    <p className="mt-2 text-[12px] text-error">{errorComplementarios}</p>
  )}
</div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setPaso(2)}
                  disabled={!paso1Valido}
                  className="px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ===================== PASO 2 ===================== */}
      {paso === 2 && (
        <>
          <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
              <span className="material-symbols-outlined text-sidebar-bg">school</span>
              <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Datos académicos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-text-main mb-1">Año lectivo</label>
                <input
                  type="text"
                  value={anoLectivo?.denominacion ?? "—"}
                  disabled
                  className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-surface-container-low text-text-muted"
                />
              </div>
              <CampoSelect
                label="Grado *"
                valor={idGrado}
                opciones={grados.map((g) => ({ value: String(g.idGrado), label: g.nombre }))}
                onChange={setIdGrado}
              />
              <div>
                <label className="block text-[12px] font-semibold text-text-main mb-1">Grupo</label>
                <select
                  value={idGrupo}
                  onChange={(e) => setIdGrupo(e.target.value)}
                  disabled={!idGrado || grupos.length === 0}
                  className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none disabled:bg-surface-container-low disabled:text-text-muted"
                >
                  <option value="">{!idGrado ? "Seleccione un grado primero" : grupos.length === 0 ? "Sin grupos disponibles" : "Sin asignar"}</option>
                  {grupos.map((g) => (
                    <option key={g.idGrupo} value={String(g.idGrupo)}>{g.denominacion}</option>
                  ))}
                </select>
              </div>
              <CampoSelect label="Tipo de matrícula *" valor={tipoMatricula} opciones={TIPOS_MATRICULA} onChange={setTipoMatricula} />
            </div>
          </div>

          {/* Resumen de confirmación */}
          <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
              <span className="material-symbols-outlined text-sidebar-bg">fact_check</span>
              <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Confirmación</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <ResumenCampo etiqueta="Estudiante" valor={nombreCompleto(estudiante)} />
              <ResumenCampo etiqueta="Documento" valor={`${estudiante.tipoDocumento} ${estudiante.numeroDocumento}`} />
              <ResumenCampo etiqueta="Situación" valor={idExistente ? "Estudiante existente (se actualizará)" : "Estudiante nuevo (se creará)"} />
              <ResumenCampo etiqueta="Grado" valor={gradoSel?.nombre ?? "—"} />
              <ResumenCampo etiqueta="Grupo" valor={grupoSel?.denominacion ?? "Sin asignar"} />
              <ResumenCampo etiqueta="Tipo" valor={TIPOS_MATRICULA.find((t) => t.value === tipoMatricula)?.label ?? tipoMatricula} />
            </div>
            <p className="mt-4 text-[12px] text-text-muted">
              La matrícula se registrará en estado <strong>En trámite</strong>. El folio se genera automáticamente. En el siguiente paso podrás registrar la entrega de documentos.
            </p>
          </div>

          {errorEnvio && (
            <div className="mb-stack-md text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
              {errorEnvio}
            </div>
          )}

          {/* Navegación */}
          <div className="flex justify-between">
            <button onClick={() => setPaso(1)} disabled={enviando} className="px-6 py-2.5 rounded-lg text-[14px] font-semibold border border-border-subtle text-text-muted hover:bg-surface-container-low disabled:opacity-50">
              Atrás
            </button>
            <button
              onClick={continuarADocumentos}
              disabled={enviando || !paso2Valido}
              className="px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? "Registrando..." : "Siguiente"}
            </button>
          </div>
        </>
      )}

      {/* ===================== PASO 3 — DOCUMENTOS ===================== */}
      {paso === 3 && matriculaCreada && (
        <>
          <div className="mb-stack-md text-[13px] text-status-success bg-status-success/10 border border-status-success/20 rounded-lg px-4 py-3">
            Matrícula registrada correctamente. Folio: <strong>{matriculaCreada.consecutivo}</strong>.
          </div>

          <DocumentosAnexosSection idMatricula={matriculaCreada.idMatricula} />

          <div className="flex justify-end">
            <button
              onClick={() => navigate(`/matriculas/${matriculaCreada.idMatricula}`)}
              className="px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110"
            >
              Finalizar
            </button>
          </div>
        </>
      )}
    </>
  );
}

/* ---------- Subcomponentes ---------- */

function PasoIndicador({ numero, activo, completado, label }: { numero: number; activo: boolean; completado: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-semibold ${
        activo ? "bg-sidebar-bg text-white" : completado ? "bg-status-success text-white" : "bg-surface-alt text-text-muted"}`}>
        {completado ? <span className="material-symbols-outlined text-[18px]">check</span> : numero}
      </div>
      <span className={`text-[13px] font-medium ${activo ? "text-text-main" : "text-text-muted"}`}>{label}</span>
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

function ResumenCampo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-[12px] text-text-muted uppercase tracking-wide mb-1">{etiqueta}</p>
      <p className="text-[14px] text-text-main font-medium">{valor}</p>
    </div>
  );
}
