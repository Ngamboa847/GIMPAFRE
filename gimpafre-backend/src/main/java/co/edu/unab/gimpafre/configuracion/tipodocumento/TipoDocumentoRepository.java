package co.edu.unab.gimpafre.configuracion.tipodocumento;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Integer> {

    List<TipoDocumento> findByActivoTrue();
}