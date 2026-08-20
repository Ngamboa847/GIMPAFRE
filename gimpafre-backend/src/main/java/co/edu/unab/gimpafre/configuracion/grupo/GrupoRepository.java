package co.edu.unab.gimpafre.configuracion.grupo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoRepository extends JpaRepository<Grupo, Integer> {

    List<Grupo> findByAnoLectivoIdAnoLectivo(Integer idAnoLectivo);

    List<Grupo> findByGradoIdGradoAndAnoLectivoIdAnoLectivo(Integer idGrado, Integer idAnoLectivo);

    boolean existsByGradoIdGradoAndAnoLectivoIdAnoLectivoAndDenominacion(
            Integer idGrado, Integer idAnoLectivo, String denominacion);
}