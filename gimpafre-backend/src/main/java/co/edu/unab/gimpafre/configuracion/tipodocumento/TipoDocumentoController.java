package co.edu.unab.gimpafre.configuracion.tipodocumento;

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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tipos-documento")
public class TipoDocumentoController {

    private final TipoDocumentoService tipoDocumentoService;

    public TipoDocumentoController(TipoDocumentoService tipoDocumentoService) {
        this.tipoDocumentoService = tipoDocumentoService;
    }

    @GetMapping
    public List<TipoDocumento> listar() {
        return tipoDocumentoService.listar();
    }

    @GetMapping("/activos")
    public List<TipoDocumento> listarActivos() {
        return tipoDocumentoService.listarActivos();
    }

    @GetMapping("/{id}")
    public TipoDocumento obtener(@PathVariable Integer id) {
        return tipoDocumentoService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<TipoDocumento> crear(@RequestBody TipoDocumento tipoDocumento) {
        TipoDocumento creado = tipoDocumentoService.crear(tipoDocumento);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public TipoDocumento actualizar(@PathVariable Integer id, @RequestBody TipoDocumento datos) {
        return tipoDocumentoService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        tipoDocumentoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}