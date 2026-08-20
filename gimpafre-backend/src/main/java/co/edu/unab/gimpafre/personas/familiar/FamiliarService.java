package co.edu.unab.gimpafre.personas.familiar;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;

@Service
public class FamiliarService {

    private final FamiliarRepository familiarRepository;

    public FamiliarService(FamiliarRepository familiarRepository) {
        this.familiarRepository = familiarRepository;
    }

    @Transactional(readOnly = true)
    public List<Familiar> listar() {
        return familiarRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Familiar obtenerPorId(Integer id) {
        return familiarRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un familiar con id " + id));
    }

    @Transactional
    public Familiar crear(Familiar familiar) {
        return familiarRepository.save(familiar);
    }

    @Transactional
    public Familiar actualizar(Integer id, Familiar datos) {
        Familiar familiar = obtenerPorId(id);
        familiar.setTipoDocumento(datos.getTipoDocumento());
        familiar.setNumeroDocumento(datos.getNumeroDocumento());
        familiar.setPrimerNombre(datos.getPrimerNombre());
        familiar.setSegundoNombre(datos.getSegundoNombre());
        familiar.setPrimerApellido(datos.getPrimerApellido());
        familiar.setSegundoApellido(datos.getSegundoApellido());
        familiar.setDireccion(datos.getDireccion());
        familiar.setTelefono(datos.getTelefono());
        familiar.setOcupacion(datos.getOcupacion());
        familiar.setEmpresa(datos.getEmpresa());
        familiar.setEstadoCivil(datos.getEstadoCivil());
        return familiarRepository.save(familiar);
    }

    @Transactional
    public void eliminar(Integer id) {
        Familiar familiar = obtenerPorId(id);
        familiarRepository.delete(familiar);
    }

    @Transactional(readOnly = true)
    public Familiar buscarPorDocumento(String numeroDocumento) {
        return familiarRepository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un familiar con documento " + numeroDocumento));
    }
}

