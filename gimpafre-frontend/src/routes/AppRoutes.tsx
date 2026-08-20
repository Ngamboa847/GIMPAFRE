import { Routes, Route, Navigate } from "react-router";
import { LoginPage } from "../features/auth/LoginPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { MatriculasListPage } from "../features/matriculas/MatriculasListPage";
import { MatriculaDetallePage } from "../features/matriculas/MatriculaDetallePage";
import { ProtectedRoute } from "../shared/auth/ProtectedRoute";
import { AppLayout } from "../shared/components/layout/AppLayout";
import { RegistrarMatriculaPage } from "../features/matriculas/RegistrarMatriculaPage";
import { EstudianteDetallePage } from "../features/estudiantes/EstudianteDetallePage";
import { ConfiguracionPage } from "../features/configuracion/ConfiguracionPage";
import { AnosLectivosPage } from "../features/configuracion/anos-lectivos/AnosLectivosPage";
import { GradosPage } from "../features/configuracion/grados/GradosPage";
import { GruposPage } from "../features/configuracion/grupos/GruposPage";
import { RolesPage } from "../features/configuracion/roles/RolesPage";
import { TiposDocumentoPage } from "../features/configuracion/tipos-documento/TiposDocumentoPage";
import { PeriodosPage } from "../features/configuracion/periodos/PeriodosPage";
import { DocentesListPage } from "../features/docentes/DocentesListPage.tsx";
import { DocenteDetallePage } from "../features/docentes/DocenteDetallePage";
import { CuentasUsuarioListPage } from "../features/cuentas-usuario/CuentasUsuarioListPage";
import { CuentaUsuarioDetallePage } from "../features/cuentas-usuario/CuentaUsuarioDetallePage";
import { CargaAcademicaListPage } from "../features/carga-academica/CargaAcademicaListPage";
import { CalificacionesAsistenciaListPage } from "../features/calificaciones/CalificacionesAsistenciaListPage";
import { HorariosListPage } from "../features/horarios/HorariosListPage";
import { CertificadosListPage } from "../features/certificados/CertificadosListPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/matriculas" element={<MatriculasListPage />} />
          <Route path="/matriculas/nueva" element={<RegistrarMatriculaPage />} />
          <Route path="/matriculas/:id" element={<MatriculaDetallePage />} />
          <Route path="/estudiantes/:id" element={<EstudianteDetallePage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/configuracion/anos-lectivos" element={<AnosLectivosPage />} />
          <Route path="/configuracion/grados" element={<GradosPage />} />
          <Route path="/configuracion/grupos" element={<GruposPage />} />
          <Route path="/configuracion/roles" element={<RolesPage />} />
          <Route path="/configuracion/tipos-documento" element={<TiposDocumentoPage />} />
          <Route path="/configuracion/periodos" element={<PeriodosPage />} />
          <Route path="/matriculas/:id/editar" element={<RegistrarMatriculaPage />} />
          <Route path="/docentes" element={<DocentesListPage />} />
          <Route path="/docentes/nuevo" element={<DocenteDetallePage />} />
          <Route path="/docentes/:id" element={<DocenteDetallePage />} />
          <Route path="/cuentas-usuario" element={<CuentasUsuarioListPage />} />
          <Route path="/cuentas-usuario/nuevo" element={<CuentaUsuarioDetallePage />} />
          <Route path="/cuentas-usuario/:id" element={<CuentaUsuarioDetallePage />} />
          <Route path="/carga-academica" element={<CargaAcademicaListPage />} />
          <Route path="/calificaciones" element={<CalificacionesAsistenciaListPage />} />
          <Route path="/horarios" element={<HorariosListPage />} />
          <Route path="/certificados" element={<CertificadosListPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}