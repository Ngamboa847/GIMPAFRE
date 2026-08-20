package co.edu.unab.gimpafre.configuracion.grupo;

import java.util.List;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivo;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivoRepository;
import co.edu.unab.gimpafre.configuracion.grado.Grado;
import co.edu.unab.gimpafre.configuracion.grado.GradoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final GradoRepository gradoRepository;
    private final AnoLectivoRepository anoLectivoRepository;

    public GrupoService(GrupoRepository grupoRepository,
                        GradoRepository gradoRepository,
                        AnoLectivoRepository anoLectivoRepository) {
        this.grupoRepository = grupoRepository;
        this.gradoRepository = gradoRepository;
        this.anoLectivoRepository = anoLectivoRepository;
    }

    @Transactional(readOnly = true)
    public List<Grupo> listar() {
        return grupoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Grupo> listarPorAnoLectivo(Integer idAnoLectivo) {
        return grupoRepository.findByAnoLectivoIdAnoLectivo(idAnoLectivo);
    }

    @Transactional(readOnly = true)
    public List<Grupo> listarPorGradoYAno(Integer idGrado, Integer idAnoLectivo) {
        return grupoRepository.findByGradoIdGradoAndAnoLectivoIdAnoLectivo(idGrado, idAnoLectivo);
    }

    @Transactional(readOnly = true)
    public Grupo obtenerPorId(Integer id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un grupo con id " + id));
    }

    @Transactional
    public Grupo crear(Grupo grupo, Integer idGrado, Integer idAnoLectivo) {
        Grado grado = gradoRepository.findById(idGrado)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un grado con id " + idGrado));
        AnoLectivo anoLectivo = anoLectivoRepository.findById(idAnoLectivo)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un ano lectivo con id " + idAnoLectivo));
        if (grupoRepository.existsByGradoIdGradoAndAnoLectivoIdAnoLectivoAndDenominacion(
                idGrado, idAnoLectivo, grupo.getDenominacion())) {
            throw new RecursoDuplicadoException(
                    "Ya existe el grupo " + grupo.getDenominacion()
                    + " para el grado y ano lectivo indicados");
        }
        grupo.setGrado(grado);
        grupo.setAnoLectivo(anoLectivo);
        return grupoRepository.save(grupo);
    }

    @Transactional
    public Grupo actualizar(Integer id, Grupo datos) {
        Grupo grupo = obtenerPorId(id);
        grupo.setDenominacion(datos.getDenominacion());
        grupo.setCupoMaximo(datos.getCupoMaximo());
        return grupoRepository.save(grupo);
    }

    @Transactional
    public void eliminar(Integer id) {
        Grupo grupo = obtenerPorId(id);
        grupoRepository.delete(grupo);
    }
}