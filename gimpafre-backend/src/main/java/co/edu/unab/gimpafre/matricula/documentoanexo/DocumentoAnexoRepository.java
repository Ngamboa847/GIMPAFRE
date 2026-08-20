package co.edu.unab.gimpafre.matricula.documentoanexo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentoAnexoRepository extends JpaRepository<DocumentoAnexo, Integer> {

    List<DocumentoAnexo> findByMatriculaIdMatricula(Integer idMatricula);
}