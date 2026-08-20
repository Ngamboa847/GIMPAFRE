package co.edu.unab.gimpafre.certificados;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/documentos-expedidos")
@RequiredArgsConstructor
public class DocumentoExpedidoController {

    private final DocumentoExpedidoRepository documentoExpedidoRepository;

    @GetMapping
    public List<DocumentoExpedido> listar() {
        return documentoExpedidoRepository.findAll();
    }
}
