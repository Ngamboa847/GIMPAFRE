package co.edu.unab.gimpafre.cargaacademica;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PlanEstudios")
@Getter
@Setter
@NoArgsConstructor
public class PlanEstudios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plan_estudios")
    private Integer idPlanEstudios;

    @Column(name = "id_asignatura", nullable = false)
    private Integer idAsignatura;

    // Shortcut: id_grado crudo (no @ManyToOne a Grado) — Grado.java no se
    // tuvo a la vista en esta sesion.
    @Column(name = "id_grado", nullable = false)
    private Integer idGrado;

    @Column(name = "intensidad_horaria_semanal", nullable = false)
    private Integer intensidadHorariaSemanal;
}
