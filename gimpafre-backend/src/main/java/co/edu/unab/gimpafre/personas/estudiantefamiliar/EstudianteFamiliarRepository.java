package co.edu.unab.gimpafre.personas.estudiantefamiliar;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstudianteFamiliarRepository extends JpaRepository<EstudianteFamiliar, Integer> {

    List<EstudianteFamiliar> findByEstudianteIdEstudiante(Integer idEstudiante);

    boolean existsByEstudianteIdEstudianteAndFamiliarIdFamiliar(
            Integer idEstudiante, Integer idFamiliar);
}