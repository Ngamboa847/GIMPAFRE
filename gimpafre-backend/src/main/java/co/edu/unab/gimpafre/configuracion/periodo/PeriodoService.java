package co.edu.unab.gimpafre.configuracion.periodo;

import java.util.List;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.config.ValidacionException;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivo;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PeriodoService {

    private final PeriodoRepository periodoRepository;
    private final AnoLectivoRepository anoLectivoRepository;

    public PeriodoService(PeriodoRepository periodoRepository,
                          AnoLectivoRepository anoLectivoRepository) {
        this.periodoRepository = periodoRepository;
        this.anoLectivoRepository = anoLectivoRepository;
    }

    @Transactional(readOnly = true)
    public List<Periodo> listar() {
        return periodoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Periodo> listarPorAnoLectivo(Integer idAnoLectivo) {
        return periodoRepository.findByAnoLectivoIdAnoLectivo(idAnoLectivo);
    }

    @Transactional(readOnly = true)
    public Periodo obtenerPorId(Integer id) {
        return periodoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un periodo con id " + id));
    }

    @Transactional
    public Periodo crear(Periodo periodo, Integer idAnoLectivo) {
        AnoLectivo anoLectivo = anoLectivoRepository.findById(idAnoLectivo)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un ano lectivo con id " + idAnoLectivo));
        if (periodoRepository.existsByAnoLectivoIdAnoLectivoAndNumero(idAnoLectivo, periodo.getNumero())) {
            throw new RecursoDuplicadoException(
                    "Ya existe el periodo numero " + periodo.getNumero()
                    + " para el ano lectivo indicado");
        }
        validarFechas(periodo, anoLectivo);
        periodo.setAnoLectivo(anoLectivo);
        return periodoRepository.save(periodo);
    }

    @Transactional
    public Periodo actualizar(Integer id, Periodo datos) {
        Periodo periodo = obtenerPorId(id);
        periodo.setDenominacion(datos.getDenominacion());
        periodo.setFechaInicio(datos.getFechaInicio());
        periodo.setFechaFin(datos.getFechaFin());
        periodo.setPorcentaje(datos.getPorcentaje());
        periodo.setEstado(datos.getEstado());
        validarFechas(periodo, periodo.getAnoLectivo());
        return periodoRepository.save(periodo);
    }

    @Transactional
    public void eliminar(Integer id) {
        Periodo periodo = obtenerPorId(id);
        periodoRepository.delete(periodo);
    }

    private void validarFechas(Periodo periodo, AnoLectivo anoLectivo) {
    if (periodo.getFechaInicio() == null || periodo.getFechaFin() == null) {
        throw new ValidacionException(
            "La fecha de inicio y la fecha de fin del periodo son obligatorias.");
    }
    if (!periodo.getFechaFin().isAfter(periodo.getFechaInicio())) {
        throw new ValidacionException(
            "La fecha de fin del periodo debe ser posterior a la fecha de inicio.");
    }
    if (periodo.getFechaInicio().isBefore(anoLectivo.getFechaInicio())
            || periodo.getFechaFin().isAfter(anoLectivo.getFechaFin())) {
        throw new ValidacionException(
            "Las fechas del periodo deben estar dentro del rango del ano lectivo ("
            + anoLectivo.getFechaInicio() + " a " + anoLectivo.getFechaFin() + ").");
    }
}
}