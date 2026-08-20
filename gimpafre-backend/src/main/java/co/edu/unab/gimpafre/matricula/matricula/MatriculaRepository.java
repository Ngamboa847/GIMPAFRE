package co.edu.unab.gimpafre.matricula.matricula;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface MatriculaRepository extends JpaRepository<Matricula, Integer> {

    Optional<Matricula> findByConsecutivo(String consecutivo);

    boolean existsByConsecutivo(String consecutivo);

    List<Matricula> findByAnoLectivoIdAnoLectivo(Integer idAnoLectivo);

    List<Matricula> findByEstudianteIdEstudiante(Integer idEstudiante);

    boolean existsByEstudianteIdEstudianteAndAnoLectivoIdAnoLectivo(
            Integer idEstudiante, Integer idAnoLectivo);

    @Query(value = """
        SELECT MAX(CAST(SUBSTRING(m.consecutivo, 6, 4) AS INT))
        FROM matricula m
        WHERE m.consecutivo LIKE :prefijo + '%'
        """, nativeQuery = true)
Integer obtenerMaximoSufijo(@Param("prefijo") String prefijo);
}

