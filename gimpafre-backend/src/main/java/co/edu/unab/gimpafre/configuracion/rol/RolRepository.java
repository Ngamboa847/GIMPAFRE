package co.edu.unab.gimpafre.configuracion.rol;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    Optional<Rol> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}