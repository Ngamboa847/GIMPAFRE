import { useEffect, useState } from "react";
import { listarMatriculasPorAno } from "../matriculas/api";
import { listarGrupos } from "../configuracion/grupos/api";
import { listarDocentes } from "../docentes/api";
import { listarAnosLectivos } from "../configuracion/anos-lectivos/api";

export interface DashboardKpis {
  matriculasActivas: number;
  matriculasTramite: number;
  gruposActivos: number;
  docentesActivos: number;
  anoLectivoDenominacion: string | null;
}

interface EstadoKpis {
  datos: DashboardKpis | null;
  cargando: boolean;
  error: string | null;
}

export function useDashboardKpis(): EstadoKpis {
  const [estado, setEstado] = useState<EstadoKpis>({
    datos: null,
    cargando: true,
    error: null,
  });

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        // Grupos y docentes no dependen del año.
        const [grupos, docentes, anos] = await Promise.all([
          listarGrupos(),
          listarDocentes(),
          listarAnosLectivos(),
        ]);

        // Heurística MVP: el año lectivo más reciente por fecha de inicio.
        const anoActual =
          anos.length > 0
            ? [...anos].sort((a, b) =>
                b.fechaInicio.localeCompare(a.fechaInicio)
              )[0]
            : null;

        // Matrículas solo si hay un año lectivo.
        const matriculas = anoActual
          ? await listarMatriculasPorAno(anoActual.idAnoLectivo)
          : [];

        if (!activo) return;

        setEstado({
          cargando: false,
          error: null,
          datos: {
            matriculasActivas: matriculas.filter((m) => m.estado === "APROBADA")
              .length,
            matriculasTramite: matriculas.filter((m) => m.estado === "TRAMITE")
              .length,
            gruposActivos: grupos.length,
            docentesActivos: docentes.filter((d) => d.estado === "ACTIVO")
              .length,
            anoLectivoDenominacion: anoActual?.denominacion ?? null,
          },
        });
      } catch {
        if (!activo) return;
        setEstado({
          datos: null,
          cargando: false,
          error: "No se pudieron cargar los indicadores.",
        });
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return estado;
}