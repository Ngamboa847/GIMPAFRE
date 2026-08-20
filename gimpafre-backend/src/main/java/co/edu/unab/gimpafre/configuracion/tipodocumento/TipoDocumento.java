package co.edu.unab.gimpafre.configuracion.tipodocumento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "TipoDocumento")
@Getter
@Setter
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_documento")
    private Integer idTipoDocumento;

    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "obligatorio", nullable = false)
    private boolean obligatorio = false;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;
}