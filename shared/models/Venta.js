// shared/models/Venta.js (Clase maestro-detalle)

import { DetalleVenta } from './DetalleVenta.js';

export class Venta {
    #ventaID;
    #clienteID;
    #mesaID;
    #sesionID;
    #usuarioID;
    #fecha;
    #estado;
    #estadoPedido;
    #total;
    #tipoPedido;
    #detalles;

    constructor(data = {}) {
        this.#ventaID = data.ventaID || data.VentaID || 0;
        this.#clienteID = data.clienteID || data.ClienteID || null;
        this.#mesaID = data.mesaID || data.MesaID || 0;
        this.#sesionID = data.sesionID || data.SesionID || null;
        this.#usuarioID = data.usuarioID || data.UsuarioID || null;
        this.#fecha = data.fecha || data.Fecha || data.fecha_venta || new Date();
        this.#estado = data.estado || data.Estado || 'Pendiente';
        this.#estadoPedido = data.estadoPedido || data.EstadoPedido || 'Pendiente';
        this.#total = Number(data.total || data.Total || 0);
        this.#tipoPedido = data.tipoPedido || data.TipoPedido || 'Mesero';
        
        // Manejo de detalles (herencia y polimorfismo)
        this.#detalles = [];
        if (data.detalleVenta && Array.isArray(data.detalleVenta)) {
            data.detalleVenta.forEach(det => {
                this.#detalles.push(new DetalleVenta(det));
            });
        }
    }

    // Getters
    get ventaID() { return this.#ventaID; }
    get clienteID() { return this.#clienteID; }
    get mesaID() { return this.#mesaID; }
    get sesionID() { return this.#sesionID; }
    get usuarioID() { return this.#usuarioID; }
    get fecha() { return this.#fecha; }
    get estado() { return this.#estado; }
    get estadoPedido() { return this.#estadoPedido; }
    get total() { return this.#total; }
    get tipoPedido() { return this.#tipoPedido; }
    get detalles() { return [...this.#detalles]; }
    get totalFormateado() { return `C$ ${this.#total.toFixed(2)}`; }

    // Métodos para gestionar detalles (polimorfismo)
    agregarDetalle(detalle) {
        if (!(detalle instanceof DetalleVenta)) {
            throw new Error('Debe ser una instancia de DetalleVenta');
        }
        this.#detalles.push(detalle);
        this.#recalcularTotal();
    }

    eliminarDetalle(index) {
        if (index >= 0 && index < this.#detalles.length) {
            this.#detalles.splice(index, 1);
            this.#recalcularTotal();
        }
    }

    #recalcularTotal() {
        this.#total = this.#detalles.reduce((sum, det) => sum + det.subtotal, 0);
    }

    // Validación completa (maestro-detalle)
    validar() {
        const errores = [];
        
        if (!this.#mesaID || this.#mesaID <= 0) {
            errores.push('La mesa es requerida');
        }
        
        if (this.#tipoPedido !== 'QR' && (!this.#usuarioID || this.#usuarioID <= 0)) {
            errores.push('El usuario (mesero/cajero) es requerido para pedidos presenciales');
        }
        
        if (this.#detalles.length === 0) {
            errores.push('Debe haber al menos un platillo en la venta');
        }
        
        // Validar cada detalle
        this.#detalles.forEach((detalle, idx) => {
            if (detalle.cantidad <= 0) {
                errores.push(`Detalle ${idx + 1}: cantidad inválida`);
            }
            if (detalle.precioUnitario <= 0) {
                errores.push(`Detalle ${idx + 1}: precio inválido`);
            }
        });
        
        return { valido: errores.length === 0, errores };
    }

    // Método para obtener resumen de la venta
    obtenerResumen() {
        return {
            ventaID: this.#ventaID,
            fecha: this.#fecha,
            total: this.#total,
            estado: this.#estado,
            cantidadItems: this.#detalles.length,
            items: this.#detalles.map(d => ({
                producto: d.nombreProducto,
                cantidad: d.cantidad,
                subtotal: d.subtotal
            }))
        };
    }

    toJSON() {
        return {
            ventaID: this.#ventaID,
            clienteID: this.#clienteID,
            mesaID: this.#mesaID,
            sesionID: this.#sesionID,
            usuarioID: this.#usuarioID,
            total: this.#total,
            tipoPedido: this.#tipoPedido,
            detalleVenta: this.#detalles.map(d => d.toJSON())
        };
    }
}