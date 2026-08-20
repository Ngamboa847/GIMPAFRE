package co.edu.unab.gimpafre.configuracion.grado;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;

@Service
public class GradoService {

    private final GradoRepository gradoRepository;

    public GradoService(GradoRepository gradoRepository) {
        this.gradoRepository = gradoRepository;
    }

    @Transactional(readOnly = true)
    public List<Grado> listar() {
        return gradoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Grado obtenerPorId(Integer id) {
        return gradoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un grado con id " + id));
    }

    @Transactional
    public Grado crear(Grado grado) {
        if (gradoRepository.existsByCodigo(grado.getCodigo())) {
            throw new RecursoDuplicadoException(
                    "Ya existe un grado con el codigo " + grado.getCodigo());
        }
        return gradoRepository.save(grado);
    }

    @Transactional
    public Grado actualizar(Integer id, Grado datos) {
        Grado grado = obtenerPorId(id);
        grado.setNombre(datos.getNombre());
        grado.setNivel(datos.getNivel());
        return gradoRepository.save(grado);
    }

    @Transactional
    public void eliminar(Integer id) {
        Grado grado = obtenerPorId(id);
        gradoRepository.delete(grado);
    }
}