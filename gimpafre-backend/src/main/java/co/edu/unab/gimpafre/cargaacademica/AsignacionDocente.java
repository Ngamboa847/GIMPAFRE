package co.edu.unab.gimpafre.cargaacademica;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "AsignacionDocente")
@Getter
@Setter
@NoArgsConstructor
public class AsignacionDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion_docente")
    private Integer idAsignacionDocente;

    // Shortcut: id_grupo / id_docente crudos (no @ManyToOne a Grupo/Docente)
    // — esos archivos no se tuvieron a la vista en esta sesion. El listado
    // del frontend mostrara estos IDs tal cual por ahora.
    @Column(name = "id_grupo", nullable = false)
    private Integer idGrupo;

    @Column(name = "id_plan_estudios", nullable = false)
    private Integer idPlanEstudios;

    @Column(name = "id_docente", nullable = false)
    private Integer idDocente;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDate fechaAsignacion;
}
