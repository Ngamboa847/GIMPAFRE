package co.edu.unab.gimpafre.personas.docente;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;

@Service
public class DocenteService {

    private final DocenteRepository docenteRepository;

    public DocenteService(DocenteRepository docenteRepository) {
        this.docenteRepository = docenteRepository;
    }

    @Transactional(readOnly = true)
    public List<Docente> listar() {
        return docenteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Docente obtenerPorId(Integer id) {
        return docenteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un docente con id " + id));
    }

    @Transactional
    public Docente crear(Docente docente) {
        if (docenteRepository.existsByNumeroDocumento(docente.getNumeroDocumento())) {
            throw new RecursoDuplicadoException(
                    "Ya existe un docente con el numero de documento "
                    + docente.getNumeroDocumento());
        }
        return docenteRepository.save(docente);
    }

    @Transactional
    public Docente actualizar(Integer id, Docente datos) {
        Docente docente = obtenerPorId(id);
        docente.setTipoDocumento(datos.getTipoDocumento());
        docente.setPrimerNombre(datos.getPrimerNombre());
        docente.setSegundoNombre(datos.getSegundoNombre());
        docente.setPrimerApellido(datos.getPrimerApellido());
        docente.setSegundoApellido(datos.getSegundoApellido());
        docente.setTelefono(datos.getTelefono());
        docente.setCorreo(datos.getCorreo());
        docente.setFormacionAcademica(datos.getFormacionAcademica());
        docente.setEstado(datos.getEstado());
        return docenteRepository.save(docente);
    }

    @Transactional
    public void eliminar(Integer id) {
        Docente docente = obtenerPorId(id);
        docenteRepository.delete(docente);
    }
}