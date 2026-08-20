package co.edu.unab.gimpafre.matricula.documentoanexo;

import java.util.List;

import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.configuracion.tipodocumento.TipoDocumento;
import co.edu.unab.gimpafre.configuracion.tipodocumento.TipoDocumentoRepository;
import co.edu.unab.gimpafre.matricula.matricula.Matricula;
import co.edu.unab.gimpafre.matricula.matricula.MatriculaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocumentoAnexoService {

    private final DocumentoAnexoRepository documentoAnexoRepository;
    private final MatriculaRepository matriculaRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;

    public DocumentoAnexoService(DocumentoAnexoRepository documentoAnexoRepository,
                                 MatriculaRepository matriculaRepository,
                                 TipoDocumentoRepository tipoDocumentoRepository) {
        this.documentoAnexoRepository = documentoAnexoRepository;
        this.matriculaRepository = matriculaRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentoAnexo> listarPorMatricula(Integer idMatricula) {
        return documentoAnexoRepository.findByMatriculaIdMatricula(idMatricula);
    }

    @Transactional(readOnly = true)
    public DocumentoAnexo obtenerPorId(Integer id) {
        return documentoAnexoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un documento anexo con id " + id));
    }

    @Transactional
    public DocumentoAnexo crear(DocumentoAnexo documento,
                                Integer idMatricula, Integer idTipoDocumento) {
        Matricula matricula = matriculaRepository.findById(idMatricula)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una matricula con id " + idMatricula));
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(idTipoDocumento)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un tipo de documento con id " + idTipoDocumento));
        documento.setMatricula(matricula);
        documento.setTipoDocumento(tipoDocumento);
        return documentoAnexoRepository.save(documento);
    }

    @Transactional
    public DocumentoAnexo actualizar(Integer id, DocumentoAnexo datos) {
        DocumentoAnexo documento = obtenerPorId(id);
        documento.setEstado(datos.getEstado());
        documento.setFechaEntrega(datos.getFechaEntrega());
        documento.setReferenciaArchivo(datos.getReferenciaArchivo());
        return documentoAnexoRepository.save(documento);
    }

    @Transactional
    public void eliminar(Integer id) {
        DocumentoAnexo documento = obtenerPorId(id);
        documentoAnexoRepository.delete(documento);
    }
}