-- =====================================================================
-- V2 - Carga academica
-- Plataforma de gestion academica GIMPAFRE
-- Ya confirmado con Nicolas en sesion de diseño (frontend chat, previo a Etapa de backend).
-- =====================================================================

CREATE TABLE Area (
    id_area INT IDENTITY(1,1) PRIMARY KEY,
    codigo  NVARCHAR(20) NOT NULL UNIQUE,
    nombre  NVARCHAR(80) NOT NULL
);

CREATE TABLE Asignatura (
    id_asignatura INT IDENTITY(1,1) PRIMARY KEY,
    id_area       INT NOT NULL,
    codigo        NVARCHAR(20) NOT NULL UNIQUE,
    nombre        NVARCHAR(80) NOT NULL,
    CONSTRAINT fk_asignatura_area
        FOREIGN KEY (id_area) REFERENCES Area(id_area)
);

-- Intensidad horaria institucional (RF-16): por asignatura y grado,
-- independiente del grupo/docente/año lectivo — es catalogo, no asignacion.
CREATE TABLE PlanEstudios (
    id_plan_estudios           INT IDENTITY(1,1) PRIMARY KEY,
    id_asignatura              INT NOT NULL,
    id_grado                   INT NOT NULL,
    intensidad_horaria_semanal INT NOT NULL,
    CONSTRAINT fk_plan_asignatura
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura),
    CONSTRAINT fk_plan_grado
        FOREIGN KEY (id_grado) REFERENCES Grado(id_grado),
    CONSTRAINT uq_plan_asignatura_grado UNIQUE (id_asignatura, id_grado)
);

-- Asignacion operativa (RF-18): que docente dicta ese plan de estudios
-- a un grupo concreto. El año lectivo se hereda de Grupo.id_ano_lectivo,
-- igual que ya hace Matricula.
CREATE TABLE AsignacionDocente (
    id_asignacion_docente INT IDENTITY(1,1) PRIMARY KEY,
    id_grupo              INT NOT NULL,
    id_plan_estudios      INT NOT NULL,
    id_docente            INT NOT NULL,
    fecha_asignacion      DATE NOT NULL,
    CONSTRAINT fk_asigdoc_grupo
        FOREIGN KEY (id_grupo) REFERENCES Grupo(id_grupo),
    CONSTRAINT fk_asigdoc_plan
        FOREIGN KEY (id_plan_estudios) REFERENCES PlanEstudios(id_plan_estudios),
    CONSTRAINT fk_asigdoc_docente
        FOREIGN KEY (id_docente) REFERENCES Docente(id_docente),
    CONSTRAINT uq_asigdoc_grupo_plan UNIQUE (id_grupo, id_plan_estudios)
);
