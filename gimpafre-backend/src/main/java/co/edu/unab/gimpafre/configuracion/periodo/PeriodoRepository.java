package co.edu.unab.gimpafre.configuracion.periodo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeriodoRepository extends JpaRepository<Periodo, Integer> {

    List<Periodo> findByAnoLectivoIdAnoLectivo(Integer idAnoLectivo);

    boolean existsByAnoLectivoIdAnoLectivoAndNumero(Integer idAnoLectivo, Integer numero);
}