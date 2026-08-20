package co.edu.unab.gimpafre.personas.estudiante;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;

    public EstudianteService(EstudianteRepository estudianteRepository) {
        this.estudianteRepository = estudianteRepository;
    }

    @Transactional(readOnly = true)
    public List<Estudiante> listar() {
        return estudianteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Estudiante obtenerPorId(Integer id) {
        return estudianteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un estudiante con id " + id));
    }

    @Transactional
    public Estudiante crear(Estudiante estudiante) {
        if (estudianteRepository.existsByNumeroDocumento(estudiante.getNumeroDocumento())) {
            throw new RecursoDuplicadoException(
                    "Ya existe un estudiante con el numero de documento "
                    + estudiante.getNumeroDocumento());
        }
        return estudianteRepository.save(estudiante);
    }

    @Transactional
    public Estudiante actualizar(Integer id, Estudiante datos) {
        Estudiante estudiante = obtenerPorId(id);
        estudiante.setTipoDocumento(datos.getTipoDocumento());
        estudiante.setLugarExpedicionDoc(datos.getLugarExpedicionDoc());
        estudiante.setPrimerNombre(datos.getPrimerNombre());
        estudiante.setSegundoNombre(datos.getSegundoNombre());
        estudiante.setPrimerApellido(datos.getPrimerApellido());
        estudiante.setSegundoApellido(datos.getSegundoApellido());
        estudiante.setSexo(datos.getSexo());
        estudiante.setFechaNacimiento(datos.getFechaNacimiento());
        estudiante.setLugarNacimiento(datos.getLugarNacimiento());
        estudiante.setNacionalidad(datos.getNacionalidad());
        estudiante.setDireccion(datos.getDireccion());
        estudiante.setBarrio(datos.getBarrio());
        estudiante.setTelefono(datos.getTelefono());
        estudiante.setMovil(datos.getMovil());
        estudiante.setFotografia(datos.getFotografia());
        estudiante.setSisben(datos.getSisben());
        estudiante.setEstrato(datos.getEstrato());
        estudiante.setGrupoSanguineo(datos.getGrupoSanguineo());
        estudiante.setTalla(datos.getTalla());
        estudiante.setPeso(datos.getPeso());
        estudiante.setInfoSeguridadSocial(datos.getInfoSeguridadSocial());
        estudiante.setNumeroAfiliacion(datos.getNumeroAfiliacion());
        estudiante.setDiagnosticoClinico(datos.getDiagnosticoClinico());
        estudiante.setPertenenciaEtnica(datos.getPertenenciaEtnica());
        estudiante.setAreaInteres(datos.getAreaInteres());
        estudiante.setAreaDificultad(datos.getAreaDificultad());
        estudiante.setNumeroHermanos(datos.getNumeroHermanos());
        estudiante.setHermanosMujeres(datos.getHermanosMujeres());
        estudiante.setHermanosHombres(datos.getHermanosHombres());
        estudiante.setLugarEntreHermanos(datos.getLugarEntreHermanos());
        estudiante.setConQuienVive(datos.getConQuienVive());
        estudiante.setObservaciones(datos.getObservaciones());
        return estudianteRepository.save(estudiante);
    }

    @Transactional
    public void eliminar(Integer id) {
        Estudiante estudiante = obtenerPorId(id);
        estudianteRepository.delete(estudiante);
    }

    @Transactional(readOnly = true)
    public Estudiante obtenerPorDocumento(String numeroDocumento) {
        return estudianteRepository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un estudiante con número de documento " + numeroDocumento));
    }
}