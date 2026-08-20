package co.edu.unab.gimpafre.configuracion.anolectivo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnoLectivoRepository extends JpaRepository<AnoLectivo, Integer> {

    Optional<AnoLectivo> findByDenominacion(String denominacion);

    boolean existsByDenominacion(String denominacion);
}