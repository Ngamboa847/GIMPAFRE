package co.edu.unab.gimpafre.configuracion.tipodocumento;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;

@Service
public class TipoDocumentoService {

    private final TipoDocumentoRepository tipoDocumentoRepository;

    public TipoDocumentoService(TipoDocumentoRepository tipoDocumentoRepository) {
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    @Transactional(readOnly = true)
    public List<TipoDocumento> listar() {
        return tipoDocumentoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TipoDocumento> listarActivos() {
        return tipoDocumentoRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public TipoDocumento obtenerPorId(Integer id) {
        return tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un tipo de documento con id " + id));
    }

    @Transactional
    public TipoDocumento crear(TipoDocumento tipoDocumento) {
        return tipoDocumentoRepository.save(tipoDocumento);
    }

    @Transactional
    public TipoDocumento actualizar(Integer id, TipoDocumento datos) {
        TipoDocumento tipoDocumento = obtenerPorId(id);
        tipoDocumento.setNombre(datos.getNombre());
        tipoDocumento.setObligatorio(datos.isObligatorio());
        tipoDocumento.setActivo(datos.isActivo());
        return tipoDocumentoRepository.save(tipoDocumento);
    }

    @Transactional
    public void eliminar(Integer id) {
        TipoDocumento tipoDocumento = obtenerPorId(id);
        tipoDocumentoRepository.delete(tipoDocumento);
    }
}