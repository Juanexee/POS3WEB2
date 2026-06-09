// shared/services/VentaService.js

import HttpService from './HttpService.js';
import { Venta } from '../models/Venta.js';
import { DetalleVenta } from '../models/DetalleVenta.js';

export default class VentaService extends HttpService {
    
    constructor() {
        super();
        this.endpointBase = '/api/Ventas';
    }

    // Obtener todas las ventas (facturas)
    async obtenerTodas() {
        const response = await this.get(this.endpointBase);
        
        if (response.success === false) {
            return { success: false, message: response.message, data: [] };
        }
        
        // Destructuración y mapeo a modelos
        const ventas = response.map(ventaData => ({
            ventaID: ventaData.ventaID,
            fechaVenta: ventaData.fechaVenta || ventaData.fecha_venta,
            total: ventaData.total,
            estado: ventaData.estado,
            usuarioID: ventaData.usuarioID,
            nombreCajero: ventaData.nombreCajero
        }));
        
        return { success: true, data: ventas };
    }

    // Obtener una venta específica con sus detalles
    async obtenerPorId(ventaID) {
        const response = await this.get(`${this.endpointBase}/${ventaID}`);
        
        if (response.success === false || !response.ventaID) {
            return { success: false, message: response.message || 'Venta no encontrada', data: null };
        }
        
        // Crear instancia de Venta (polimorfismo)
        const venta = new Venta(response);
        
        return { success: true, data: venta };
    }

    // Registrar nueva venta (maestro-detalle)
    async registrarVenta(ventaData) {
        // Validar usando el modelo
        const venta = ventaData instanceof Venta ? ventaData : new Venta(ventaData);
        const validacion = venta.validar();
        
        if (!validacion.valido) {
            return { 
                success: false, 
                message: 'Datos de venta inválidos', 
                errores: validacion.errores 
            };
        }
        
        const response = await this.post(`${this.endpointBase}/registrar`, venta.toJSON());
        
        return response;
    }

    // Obtener pedidos para cocina (agrupados por platillo)
    async obtenerPedidosCocina() {
        const response = await this.get(`${this.endpointBase}/pedidos`);
        
        if (response.success === false) {
            return { success: false, data: [] };
        }
        
        // Destructuración de objetos para transformar datos
        const pedidosAgrupados = response.map(({ nombrePlatillo, cantidadTotal, fechaPrimerPedido, idsRelacionados }) => ({
            nombrePlatillo,
            cantidadTotal,
            fechaPrimerPedido: new Date(fechaPrimerPedido),
            idsRelacionados,
            tiempoEspera: this.#calcularTiempoEspera(fechaPrimerPedido)
        }));
        
        return { success: true, data: pedidosAgrupados };
    }

    // Método privado para calcular tiempo de espera
    #calcularTiempoEspera(fecha) {
        const fechaPedido = new Date(fecha);
        const ahora = new Date();
        const diffMin = Math.floor((ahora - fechaPedido) / 60000);
        
        if (diffMin < 1) return `${Math.floor((ahora - fechaPedido) / 1000)} seg`;
        if (diffMin < 60) return `${diffMin} min`;
        return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
    }
}