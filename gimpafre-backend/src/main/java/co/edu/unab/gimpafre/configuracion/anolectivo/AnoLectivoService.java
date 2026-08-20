package co.edu.unab.gimpafre.configuracion.anolectivo;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.config.ValidacionException;
@Service
public class AnoLectivoService {

    private final AnoLectivoRepository anoLectivoRepository;

    public AnoLectivoService(AnoLectivoRepository anoLectivoRepository) {
        this.anoLectivoRepository = anoLectivoRepository;
    }

    @Transactional(readOnly = true)
    public List<AnoLectivo> listar() {
        return anoLectivoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public AnoLectivo obtenerPorId(Integer id) {
        return anoLectivoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un ano lectivo con id " + id));
    }

    @Transactional
    public AnoLectivo crear(AnoLectivo anoLectivo) {
        validarFechas(anoLectivo);
        if (anoLectivoRepository.existsByDenominacion(anoLectivo.getDenominacion())) {
            throw new RecursoDuplicadoException(
                    "Ya existe un ano lectivo con la denominacion " + anoLectivo.getDenominacion());
        }
        return anoLectivoRepository.save(anoLectivo);
    }

    @Transactional
    public AnoLectivo actualizar(Integer id, AnoLectivo datos) {
        AnoLectivo anoLectivo = obtenerPorId(id);
        anoLectivo.setFechaInicio(datos.getFechaInicio());
        anoLectivo.setFechaFin(datos.getFechaFin());
        anoLectivo.setEstado(datos.getEstado());
        validarFechas(anoLectivo);
        return anoLectivoRepository.save(anoLectivo);
    }

    @Transactional
    public void eliminar(Integer id) {
        AnoLectivo anoLectivo = obtenerPorId(id);
        anoLectivoRepository.delete(anoLectivo);
    }

    private void validarFechas(AnoLectivo anoLectivo) {
    if (anoLectivo.getFechaInicio() == null || anoLectivo.getFechaFin() == null) {
        throw new ValidacionException(
            "La fecha de inicio y la fecha de fin son obligatorias.");
    }
    if (!anoLectivo.getFechaFin().isAfter(anoLectivo.getFechaInicio())) {
        throw new ValidacionException(
            "La fecha de fin debe ser posterior a la fecha de inicio.");
    }
}
}