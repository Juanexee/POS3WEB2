// shared/services/SesionService.js

import HttpService from './HttpService.js';

export default class SesionService extends HttpService {
    
    constructor() {
        super();
        this.endpointBase = '/api/Sesion';
    }

    // Iniciar sesión para una mesa (QR)
    async iniciarSesion(mesaID) {
        const response = await this.post(`${this.endpointBase}/Abrir/${mesaID}`);
        
        if (response.success === false) {
            return { success: false, message: response.message };
        }
        
        // Carga robusta de las propiedades del backend (soportando camelCase y PascalCase)
        const sesionID = response.sesionID ?? response.sesionId;
        const mesaIdRetornada = response.mesaID ?? response.mesaId ?? mesaID;
        const estado = response.estado ?? response.Estado ?? 'Activo';
        
        if (sesionID) {
            localStorage.setItem('sesionActiva', sesionID);
            localStorage.setItem('mesaActual', mesaIdRetornada);
        }
        
        return { success: true, data: { sesionID, mesaID: mesaIdRetornada, estado } };
    }

    // Aceptar lote de pedidos (cocina)
    async aceptarLote(idsPedidos, nuevoEstado = 'Preparando') {
        const response = await this.post(`${this.endpointBase}/aceptar-lote`, {
            idsPedidos,
            nuevoEstado
        });
        
        return response;
    }

    // Entregar pedidos listos (mesero)
    async entregarPedidos(idsPedidos, nuevoEstado = 'Listo') {
        const response = await this.post(`${this.endpointBase}/entregar-pedidos`, {
            idsPedidos,
            nuevoEstado
        });
        
        return response;
    }

    // Cambiar mesa de una sesión activa
    async cambiarMesa(sesionID, nuevaMesaID) {
        const response = await this.post(`${this.endpointBase}/cambiar-mesa`, {
            sesionID,
            nuevaMesaID
        });
        
        return response;
    }

    // Finalizar sesión y liberar mesa
    async finalizarSesion(sesionID) {
        const response = await this.post(`${this.endpointBase}/finalizar-sesion?sesionId=${sesionID}`);
        
        if (response.success !== false) {
            localStorage.removeItem('sesionActiva');
            localStorage.removeItem('mesaActual');
        }
        
        return response;
    }
}