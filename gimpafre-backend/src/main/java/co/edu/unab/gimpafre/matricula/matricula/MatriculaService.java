package co.edu.unab.gimpafre.matricula.matricula;

import java.time.LocalDate;
import java.util.List;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.config.TransicionInvalidaException;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivo;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivoRepository;
import co.edu.unab.gimpafre.configuracion.grado.Grado;
import co.edu.unab.gimpafre.configuracion.grado.GradoRepository;
import co.edu.unab.gimpafre.configuracion.grupo.Grupo;
import co.edu.unab.gimpafre.configuracion.grupo.GrupoRepository;
import co.edu.unab.gimpafre.personas.estudiante.Estudiante;
import co.edu.unab.gimpafre.personas.estudiante.EstudianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Set;
@Service
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final EstudianteRepository estudianteRepository;
    private final AnoLectivoRepository anoLectivoRepository;
    private final GradoRepository gradoRepository;
    private final GrupoRepository grupoRepository;

    public MatriculaService(MatriculaRepository matriculaRepository,
                            EstudianteRepository estudianteRepository,
                            AnoLectivoRepository anoLectivoRepository,
                            GradoRepository gradoRepository,
                            GrupoRepository grupoRepository) {
        this.matriculaRepository = matriculaRepository;
        this.estudianteRepository = estudianteRepository;
        this.anoLectivoRepository = anoLectivoRepository;
        this.gradoRepository = gradoRepository;
        this.grupoRepository = grupoRepository;
    }

    @Transactional(readOnly = true)
    public List<Matricula> listar() {
        return matriculaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Matricula> listarPorAnoLectivo(Integer idAnoLectivo) {
        return matriculaRepository.findByAnoLectivoIdAnoLectivo(idAnoLectivo);
    }

    @Transactional(readOnly = true)
    public List<Matricula> listarPorEstudiante(Integer idEstudiante) {
        return matriculaRepository.findByEstudianteIdEstudiante(idEstudiante);
    }

    @Transactional(readOnly = true)
    public Matricula obtenerPorId(Integer id) {
        return matriculaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una matricula con id " + id));
    }

    @Transactional
public Matricula crear(Matricula matricula, Integer idEstudiante, Integer idAnoLectivo,
                       Integer idGrado, Integer idGrupo) {
    Estudiante estudiante = estudianteRepository.findById(idEstudiante)
            .orElseThrow(() -> new RecursoNoEncontradoException(
                    "No existe un estudiante con id " + idEstudiante));
    AnoLectivo anoLectivo = anoLectivoRepository.findById(idAnoLectivo)
            .orElseThrow(() -> new RecursoNoEncontradoException(
                    "No existe un ano lectivo con id " + idAnoLectivo));
    Grado grado = gradoRepository.findById(idGrado)
            .orElseThrow(() -> new RecursoNoEncontradoException(
                    "No existe un grado con id " + idGrado));

    if (matriculaRepository.existsByEstudianteIdEstudianteAndAnoLectivoIdAnoLectivo(
            idEstudiante, idAnoLectivo)) {
        throw new RecursoDuplicadoException(
                "El estudiante ya tiene una matricula en el ano lectivo indicado");
    }

    matricula.setEstudiante(estudiante);
    matricula.setAnoLectivo(anoLectivo);
    matricula.setGrado(grado);

    if (idGrupo != null) {
        Grupo grupo = grupoRepository.findById(idGrupo)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un grupo con id " + idGrupo));
        matricula.setGrupo(grupo);
    }

    matricula.setConsecutivo(generarConsecutivo(anoLectivo));
    matricula.setResultadoRegistroSimat(RegistroSimat.PENDIENTE);
    matricula.setEstado(MatriculaEstado.TRAMITE);
    matricula.setFecha(LocalDate.now());

    return matriculaRepository.save(matricula);
    }

    @Transactional
    public Matricula actualizar(Integer id, Matricula datos, Integer idGrado, Integer idGrupo) {
        Matricula matricula = obtenerPorId(id);
        matricula.setTipo(datos.getTipo());
        matricula.setEstado(datos.getEstado());
        matricula.setConceptoPsicopedagogico(datos.getConceptoPsicopedagogico());
        matricula.setResultadoRegistroSimat(datos.getResultadoRegistroSimat());

        if (idGrado != null) {
            Grado grado = gradoRepository.findById(idGrado)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No existe un grado con id " + idGrado));
            matricula.setGrado(grado);
        }

        if (idGrupo != null) {
            Grupo grupo = grupoRepository.findById(idGrupo)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No existe un grupo con id " + idGrupo));
            matricula.setGrupo(grupo);
        }

        return matriculaRepository.save(matricula);
    }

    @Transactional
    public void eliminar(Integer id) {
        Matricula matricula = obtenerPorId(id);
        matriculaRepository.delete(matricula);
    }

    private static final Map<MatriculaEstado, Set<MatriculaEstado>> TRANSICIONES_VALIDAS = Map.of(
    MatriculaEstado.TRAMITE,   Set.of(MatriculaEstado.APROBADA, MatriculaEstado.RECHAZADA, MatriculaEstado.ANULADA),
    MatriculaEstado.APROBADA,  Set.of(MatriculaEstado.RETIRADA, MatriculaEstado.ANULADA),
    MatriculaEstado.RECHAZADA, Set.of(),
    MatriculaEstado.RETIRADA,  Set.of(),
    MatriculaEstado.ANULADA,   Set.of()
);

private void validarTransicion(MatriculaEstado actual, MatriculaEstado destino) {
    if (actual == destino) {
        throw new TransicionInvalidaException(
            "La matrícula ya se encuentra en estado " + actual + ".");
    }
    Set<MatriculaEstado> permitidos = TRANSICIONES_VALIDAS.getOrDefault(actual, Set.of());
    if (!permitidos.contains(destino)) {
        throw new TransicionInvalidaException(
            "No se permite pasar de " + actual + " a " + destino + ".");
    }
    }

    @Transactional
public Matricula cambiarEstado(Integer id, MatriculaEstado destino) {
    Matricula matricula = matriculaRepository.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException(
            "No existe matrícula con id " + id + "."));

        validarTransicion(matricula.getEstado(), destino);
        matricula.setEstado(destino);

        // Los efectos de transición (consecutivo al aprobar, soporte SIMAT)
        // se engancharán aquí por ramas en los frentes siguientes.

        return matriculaRepository.save(matricula);
    }

    private String generarConsecutivo(AnoLectivo anoLectivo) {
        String anio = anoLectivo.getDenominacion();
        String prefijo = anio + "-";
        Integer maximo = matriculaRepository.obtenerMaximoSufijo(prefijo);
        int siguiente = (maximo == null ? 0 : maximo) + 1;
        return prefijo + String.format("%04d", siguiente);
    }

    @Transactional
    public Matricula actualizarRegistroSimat(Integer id, RegistroSimat registro) {
        Matricula matricula = matriculaRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException(
                "No existe matrícula con id " + id + "."));
        matricula.setResultadoRegistroSimat(registro);
        return matriculaRepository.save(matricula);
    }
}

