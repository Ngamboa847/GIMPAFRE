package co.edu.unab.gimpafre.cargaacademica;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Asignatura")
@Getter
@Setter
@NoArgsConstructor
public class Asignatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignatura")
    private Integer idAsignatura;

    // Shortcut: se expone id_area crudo (no @ManyToOne) porque no se tuvo
    // a la vista Area.java al escribir esto — no aplica aca, Area es propia
    // de este mismo paquete, pero se deja consistente con Asignatura/
    // PlanEstudios/AsignacionDocente, que si referencian entidades de otros
    // paquetes (Grado, Grupo, Docente) que no se tuvieron a la vista.
    @Column(name = "id_area", nullable = false)
    private Integer idArea;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 80)
    private String nombre;
}
