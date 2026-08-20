package co.edu.unab.gimpafre.personas.estudiantefamiliar;

import co.edu.unab.gimpafre.personas.estudiante.Estudiante;
import co.edu.unab.gimpafre.personas.familiar.Familiar;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "EstudianteFamiliar")
@Getter
@Setter
public class EstudianteFamiliar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estudiante_familiar")
    private Integer idEstudianteFamiliar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_familiar", nullable = false)
    private Familiar familiar;

    @Column(name = "parentesco", nullable = false, length = 40)
    private String parentesco;

    @Column(name = "es_acudiente", nullable = false)
    private boolean esAcudiente = false;
}