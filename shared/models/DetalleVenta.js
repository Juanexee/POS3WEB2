// shared/models/DetalleVenta.js

export class DetalleVenta {
    #detalleVentaID;
    #ventaID;
    #platilloID;
    #nombreProducto;
    #cantidad;
    #precioUnitario;
    #subtotal;
    #personalizacion;
    #estadoCocinero;

    constructor(data = {}) {
        this.#detalleVentaID = data.detalleVentaID || data.DetalleVentaID || 0;
        this.#ventaID = data.ventaID || data.VentaID || 0;
        this.#platilloID = data.platilloID || data.PlatilloID || 0;
        this.#nombreProducto = data.nombreProducto || data.NombreProducto || data.nombre || data.nombrePlatillo || '';
        this.#cantidad = data.cantidad || data.Cantidad || 1;
        this.#precioUnitario = Number(data.precioUnitario || data.PrecioUnitario || data.precio_unitario || 0);
        this.#subtotal = Number(data.subtotal || data.Subtotal || this.#cantidad * this.#precioUnitario);
        
        let p = data.personalizacion || data.comentario || data.Comentario || null;
        if (typeof p === 'string' && p.trim().startsWith('{')) {
            try {
                p = JSON.parse(p);
            } catch (e) {
                // No es JSON válido, conservar como cadena
            }
        }
        this.#personalizacion = p;
        
        this.#estadoCocinero = data.estadoCocinero || data.EstadoCocinero || 'Pendiente';
    }

    // Getters
    get detalleVentaID() { return this.#detalleVentaID; }
    get ventaID() { return this.#ventaID; }
    get platilloID() { return this.#platilloID; }
    get nombreProducto() { return this.#nombreProducto; }
    get cantidad() { return this.#cantidad; }
    get precioUnitario() { return this.#precioUnitario; }
    get subtotal() { return this.#subtotal; }
    get personalizacion() { return this.#personalizacion; }
    get estadoCocinero() { return this.#estadoCocinero; }

    // Setters con validación
    set cantidad(valor) {
        if (valor < 1) throw new Error('La cantidad debe ser al menos 1');
        if (valor > 99) throw new Error('La cantidad no puede superar 99');
        this.#cantidad = valor;
        this.#recalcularSubtotal();
    }

    // Métodos privados
    #recalcularSubtotal() {
        this.#subtotal = this.#cantidad * this.#precioUnitario;
    }

    // Formatear personalización para mostrar
    get personalizacionTexto() {
        if (!this.#personalizacion) return '';
        
        if (typeof this.#personalizacion === 'string') {
            return this.#personalizacion;
        }
        
        const { opciones = [], nota = '' } = this.#personalizacion;
        let texto = '';
        
        opciones.forEach(opt => {
            if (opt.seleccion) {
                const seleccion = Array.isArray(opt.seleccion) ? opt.seleccion.join(', ') : opt.seleccion;
                texto += `${opt.grupo}: ${seleccion}\n`;
            }
        });
        
        if (nota) texto += `Nota: "${nota}"`;
        
        return texto;
    }

    toJSON() {
        return {
            platilloID: this.#platilloID,
            cantidad: this.#cantidad,
            precio_unitario: this.#precioUnitario,
            personalizacion: typeof this.#personalizacion === 'object' && this.#personalizacion !== null ? JSON.stringify(this.#personalizacion) : this.#personalizacion,
            estadoCocinero: this.#estadoCocinero
        };
    }
}