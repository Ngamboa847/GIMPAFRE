package co.edu.unab.gimpafre.personas.estudiantefamiliar;

import java.util.List;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.personas.estudiante.Estudiante;
import co.edu.unab.gimpafre.personas.estudiante.EstudianteRepository;
import co.edu.unab.gimpafre.personas.familiar.Familiar;
import co.edu.unab.gimpafre.personas.familiar.FamiliarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstudianteFamiliarService {

    private final EstudianteFamiliarRepository estudianteFamiliarRepository;
    private final EstudianteRepository estudianteRepository;
    private final FamiliarRepository familiarRepository;

    public EstudianteFamiliarService(EstudianteFamiliarRepository estudianteFamiliarRepository,
                                     EstudianteRepository estudianteRepository,
                                     FamiliarRepository familiarRepository) {
        this.estudianteFamiliarRepository = estudianteFamiliarRepository;
        this.estudianteRepository = estudianteRepository;
        this.familiarRepository = familiarRepository;
    }

    @Transactional(readOnly = true)
    public List<EstudianteFamiliar> listarPorEstudiante(Integer idEstudiante) {
        return estudianteFamiliarRepository.findByEstudianteIdEstudiante(idEstudiante);
    }

    @Transactional(readOnly = true)
    public EstudianteFamiliar obtenerPorId(Integer id) {
        return estudianteFamiliarRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un vinculo estudiante-familiar con id " + id));
    }

    @Transactional
    public EstudianteFamiliar crear(EstudianteFamiliar vinculo,
                                    Integer idEstudiante, Integer idFamiliar) {
        Estudiante estudiante = estudianteRepository.findById(idEstudiante)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un estudiante con id " + idEstudiante));
        Familiar familiar = familiarRepository.findById(idFamiliar)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un familiar con id " + idFamiliar));
        if (estudianteFamiliarRepository.existsByEstudianteIdEstudianteAndFamiliarIdFamiliar(
                idEstudiante, idFamiliar)) {
            throw new RecursoDuplicadoException(
                    "El familiar ya esta vinculado a este estudiante");
        }
        vinculo.setEstudiante(estudiante);
        vinculo.setFamiliar(familiar);
        return estudianteFamiliarRepository.save(vinculo);
    }

    @Transactional
    public EstudianteFamiliar actualizar(Integer id, EstudianteFamiliar datos) {
        EstudianteFamiliar vinculo = obtenerPorId(id);
        vinculo.setParentesco(datos.getParentesco());
        vinculo.setEsAcudiente(datos.isEsAcudiente());
        return estudianteFamiliarRepository.save(vinculo);
    }

    @Transactional
    public void eliminar(Integer id) {
        EstudianteFamiliar vinculo = obtenerPorId(id);
        estudianteFamiliarRepository.delete(vinculo);
    }
}