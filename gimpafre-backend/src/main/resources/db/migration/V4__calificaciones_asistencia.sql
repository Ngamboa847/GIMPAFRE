-- =====================================================================
-- V3 - Calificaciones y asistencia
-- Plataforma de gestion academica GIMPAFRE
-- Generado a partir del Modelo de Datos oficial (PDF) + SRS RF-22 a RF-30.
-- IMPORTANTE: a diferencia de V2 (Carga Academica), este modulo NO paso
-- por una ronda de diseño confirmada decision por decision — los tipos,
-- longitudes y reglas marcadas como "supuesto" abajo deben revisarse
-- antes de dar esta migracion por cerrada.
-- =====================================================================

-- Escala de valoracion por grado: numerica (RF-22, ej. 1.0-5.0) o
-- cualitativa (RF-23, preescolar: Logro Alcanzado/No Alcanzado/En Proceso).
CREATE TABLE EscalaValoracion (
    id_escala_valoracion INT IDENTITY(1,1) PRIMARY KEY,
    id_grado             INT NOT NULL,
    nombre                NVARCHAR(80) NOT NULL,
    tipo                  NVARCHAR(20) NOT NULL,       -- SUPUESTO: 'NUMERICA' | 'CUALITATIVA' (RF-22/RF-23), string libre igual que Docente.estado
    valor_minimo          DECIMAL(4,1) NULL,           -- solo aplica si tipo = NUMERICA
    valor_maximo          DECIMAL(4,1) NULL,           -- solo aplica si tipo = NUMERICA
    valores_admitidos     NVARCHAR(255) NULL,          -- solo aplica si tipo = CUALITATIVA; SUPUESTO: lista separada por coma, sin tabla catalogo aparte
    CONSTRAINT fk_escala_grado
        FOREIGN KEY (id_grado) REFERENCES Grado(id_grado)
);

-- Bandas de desempeño sobre una escala numerica (ej. "Superior" 4.6-5.0).
CREATE TABLE NivelDesempeno (
    id_nivel_desempeno   INT IDENTITY(1,1) PRIMARY KEY,
    id_escala_valoracion INT NOT NULL,
    denominacion         NVARCHAR(40) NOT NULL,
    limite_inferior       DECIMAL(4,1) NOT NULL,
    limite_superior       DECIMAL(4,1) NOT NULL,
    CONSTRAINT fk_niveldesempeno_escala
        FOREIGN KEY (id_escala_valoracion) REFERENCES EscalaValoracion(id_escala_valoracion)
);

-- Componentes de evaluacion y ponderacion (RF-17). El Modelo de Datos los
-- liga a EscalaValoracion (por grado), no a Asignatura/PlanEstudios — se
-- respeta tal cual el diagrama, aunque vale la pena confirmarlo con
-- Nicolas: ¿los componentes son iguales para todas las asignaturas de un
-- grado, o deberian variar por asignatura? Tal como esta la tabla, son
-- iguales para todas las asignaturas que comparten esa escala.
CREATE TABLE ComponenteEvaluacion (
    id_componente_evaluacion INT IDENTITY(1,1) PRIMARY KEY,
    id_escala_valoracion     INT NOT NULL,
    codigo                    NVARCHAR(20) NOT NULL,
    denominacion              NVARCHAR(80) NOT NULL,
    porcentaje                DECIMAL(4,1) NOT NULL,   -- RF-17: la suma de componentes de una escala debe validarse en 100% — regla de negocio en servicio, no CHECK de BD (mismo patron que el resto del esquema)
    CONSTRAINT fk_componente_escala
        FOREIGN KEY (id_escala_valoracion) REFERENCES EscalaValoracion(id_escala_valoracion)
);

-- Calificacion de un componente puntual, para una matricula + asignacion
-- docente (=asignatura+grupo+docente) + periodo.
CREATE TABLE Calificacion (
    id_calificacion          INT IDENTITY(1,1) PRIMARY KEY,
    id_matricula              INT NOT NULL,
    id_asignacion_docente     INT NOT NULL,
    id_periodo                 INT NOT NULL,
    id_componente_evaluacion   INT NOT NULL,
    valor                       DECIMAL(4,1) NOT NULL,  -- RF-22: rango 1.0-5.0 validado en servicio contra EscalaValoracion, no en BD
    fecha_registro               DATE NOT NULL,
    CONSTRAINT fk_calificacion_matricula
        FOREIGN KEY (id_matricula) REFERENCES Matricula(id_matricula),
    CONSTRAINT fk_calificacion_asigdoc
        FOREIGN KEY (id_asignacion_docente) REFERENCES AsignacionDocente(id_asignacion_docente),
    CONSTRAINT fk_calificacion_periodo
        FOREIGN KEY (id_periodo) REFERENCES Periodo(id_periodo),
    CONSTRAINT fk_calificacion_componente
        FOREIGN KEY (id_componente_evaluacion) REFERENCES ComponenteEvaluacion(id_componente_evaluacion),
    CONSTRAINT uq_calificacion_unica UNIQUE (id_matricula, id_asignacion_docente, id_periodo, id_componente_evaluacion)
);

-- Evidencia individual dentro de un componente de evaluacion.
CREATE TABLE Evidencia (
    id_evidencia     INT IDENTITY(1,1) PRIMARY KEY,
    id_calificacion  INT NOT NULL,
    denominacion     NVARCHAR(120) NOT NULL,
    fecha            DATE NOT NULL,
    valor            DECIMAL(4,1) NOT NULL,
    CONSTRAINT fk_evidencia_calificacion
        FOREIGN KEY (id_calificacion) REFERENCES Calificacion(id_calificacion)
);

-- Nota/valoracion definitiva del periodo (RF-24). valor_definitivo es
-- texto para cubrir tanto nota numerica ("4.5") como cualitativa
-- ("Logro Alcanzado") con la misma columna — asi lo define el diagrama.
CREATE TABLE ValoracionPeriodo (
    id_valoracion_periodo INT IDENTITY(1,1) PRIMARY KEY,
    id_matricula           INT NOT NULL,
    id_asignacion_docente  INT NOT NULL,
    id_periodo              INT NOT NULL,
    valor_definitivo         NVARCHAR(20) NOT NULL,
    fecha_consolidacion       DATE NOT NULL,
    CONSTRAINT fk_valoracion_matricula
        FOREIGN KEY (id_matricula) REFERENCES Matricula(id_matricula),
    CONSTRAINT fk_valoracion_asigdoc
        FOREIGN KEY (id_asignacion_docente) REFERENCES AsignacionDocente(id_asignacion_docente),
    CONSTRAINT fk_valoracion_periodo
        FOREIGN KEY (id_periodo) REFERENCES Periodo(id_periodo),
    CONSTRAINT uq_valoracion_unica UNIQUE (id_matricula, id_asignacion_docente, id_periodo)
);

-- Asistencia diaria (RF-25/RF-26). soporte_justificacion sigue el mismo
-- patron que DocumentoAnexo.referencia_archivo (referencia, no el binario).
CREATE TABLE Asistencia (
    id_asistencia          INT IDENTITY(1,1) PRIMARY KEY,
    id_matricula            INT NOT NULL,
    id_asignacion_docente   INT NOT NULL,
    fecha                     DATE NOT NULL,
    estado                     NVARCHAR(20) NOT NULL,   -- string libre, mismo patron que Docente.estado
    motivo                     NVARCHAR(255) NULL,
    soporte_justificacion       NVARCHAR(255) NULL,
    CONSTRAINT fk_asistencia_matricula
        FOREIGN KEY (id_matricula) REFERENCES Matricula(id_matricula),
    CONSTRAINT fk_asistencia_asigdoc
        FOREIGN KEY (id_asignacion_docente) REFERENCES AsignacionDocente(id_asignacion_docente),
    CONSTRAINT uq_asistencia_unica UNIQUE (id_matricula, id_asignacion_docente, fecha)
);

-- Observaciones de seguimiento (RF-27), asociadas al periodo, no a una
-- asignatura puntual (el diagrama liga a id_docente directo, no a
-- id_asignacion_docente).
CREATE TABLE Observacion (
    id_observacion INT IDENTITY(1,1) PRIMARY KEY,
    id_matricula    INT NOT NULL,
    id_periodo       INT NOT NULL,
    id_docente        INT NOT NULL,
    fecha              DATE NOT NULL,
    descripcion         NVARCHAR(MAX) NOT NULL,
    CONSTRAINT fk_observacion_matricula
        FOREIGN KEY (id_matricula) REFERENCES Matricula(id_matricula),
    CONSTRAINT fk_observacion_periodo
        FOREIGN KEY (id_periodo) REFERENCES Periodo(id_periodo),
    CONSTRAINT fk_observacion_docente
        FOREIGN KEY (id_docente) REFERENCES Docente(id_docente)
);
