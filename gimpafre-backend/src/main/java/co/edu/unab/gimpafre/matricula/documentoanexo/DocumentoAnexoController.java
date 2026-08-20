package co.edu.unab.gimpafre.matricula.documentoanexo;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documentos-anexos")
public class DocumentoAnexoController {

    private final DocumentoAnexoService documentoAnexoService;

    public DocumentoAnexoController(DocumentoAnexoService documentoAnexoService) {
        this.documentoAnexoService = documentoAnexoService;
    }

    @GetMapping("/matricula/{idMatricula}")
    public List<DocumentoAnexo> listarPorMatricula(@PathVariable Integer idMatricula) {
        return documentoAnexoService.listarPorMatricula(idMatricula);
    }

    @GetMapping("/{id}")
    public DocumentoAnexo obtener(@PathVariable Integer id) {
        return documentoAnexoService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<DocumentoAnexo> crear(@RequestBody DocumentoAnexo documento,
                                                @RequestParam Integer idMatricula,
                                                @RequestParam Integer idTipoDocumento) {
        DocumentoAnexo creado = documentoAnexoService.crear(documento, idMatricula, idTipoDocumento);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public DocumentoAnexo actualizar(@PathVariable Integer id,
                                     @RequestBody DocumentoAnexo datos) {
        return documentoAnexoService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        documentoAnexoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}