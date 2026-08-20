package co.edu.unab.gimpafre.matricula.documentoanexo;

import java.time.LocalDate;
import co.edu.unab.gimpafre.configuracion.tipodocumento.TipoDocumento;
import co.edu.unab.gimpafre.matricula.matricula.Matricula;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "DocumentoAnexo")
@Getter
@Setter
public class DocumentoAnexo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento_anexo")
    private Integer idDocumentoAnexo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_matricula", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_documento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Column(name = "referencia_archivo", length = 255)
    private String referenciaArchivo;
}