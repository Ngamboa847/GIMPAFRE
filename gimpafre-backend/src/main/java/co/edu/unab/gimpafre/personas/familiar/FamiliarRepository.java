package co.edu.unab.gimpafre.personas.familiar;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamiliarRepository extends JpaRepository<Familiar, Integer> {

    Optional<Familiar> findByNumeroDocumento(String numeroDocumento);
}