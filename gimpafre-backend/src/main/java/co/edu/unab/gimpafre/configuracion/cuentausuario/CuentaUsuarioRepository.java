package co.edu.unab.gimpafre.configuracion.cuentausuario;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CuentaUsuarioRepository extends JpaRepository<CuentaUsuario, Integer> {

    Optional<CuentaUsuario> findByNombreUsuario(String nombreUsuario);

    boolean existsByNombreUsuario(String nombreUsuario);

    @Query("SELECT c FROM CuentaUsuario c JOIN FETCH c.rol WHERE c.nombreUsuario = :nombreUsuario")
    Optional<CuentaUsuario> buscarPorNombreUsuarioConRol(String nombreUsuario);
}