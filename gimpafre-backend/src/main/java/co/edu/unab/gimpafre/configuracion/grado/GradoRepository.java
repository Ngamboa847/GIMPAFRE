package co.edu.unab.gimpafre.configuracion.grado;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradoRepository extends JpaRepository<Grado, Integer> {

    Optional<Grado> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}