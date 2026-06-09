// shared/services/mesaService.js

import HttpService from './HttpService.js';

export default class MesaService extends HttpService {
    
    constructor() {
        super();
        this.endpointBase = '/api/Mesas';
    }

    async obtenerTodas() {
        const response = await this.get(`${this.endpointBase}/Leer`);
        
        if (response.success === false) {
            throw new Error(response.message || 'Error al cargar mesas');
        }
        
        return response;
    }

    async insertar(datosMesa) {
        const response = await this.post(`${this.endpointBase}/Insertar`, datosMesa);
        
        if (response.success === false) {
            throw new Error(response.message || 'Error al insertar mesa');
        }
        
        return response;
    }

    async actualizar(id, datosMesa) {
        const response = await this.put(`${this.endpointBase}/Actualizar/${id}`, datosMesa);
        
        if (response.success === false) {
            throw new Error(response.message || 'Error al actualizar mesa');
        }
        
        return response;
    }

    async eliminar(id) {
        const response = await this.delete(`${this.endpointBase}/Eliminar/${id}`);
        
        if (response.success === false) {
            throw new Error(response.message || 'Error al eliminar mesa');
        }
        
        return true;
    }
}

// ⚠️ EXPORTACIONES PARA COMPATIBILIDAD CON mesas.js
// Estas son las que necesita tu controlador
export async function obtenerMesas() {
    const service = new MesaService();
    return await service.obtenerTodas();
}

export async function insertarMesa(datosMesa) {
    const service = new MesaService();
    return await service.insertar(datosMesa);
}

export async function actualizarMesa(id, datosMesa) {
    const service = new MesaService();
    return await service.actualizar(id, datosMesa);
}

export async function eliminarMesa(id) {
    const service = new MesaService();
    return await service.eliminar(id);
}

export async function cambiarMesaService(sesionId, nuevaMesaId) {
    const service = new MesaService();
    // Este endpoint puede estar en otro servicio
    const response = await service.post('/api/Sesion/cambiar-mesa', { sesionId, nuevaMesaId });
    return response;
}

export async function entregarPedidosService(idsPedidos) {
    const service = new MesaService();
    const response = await service.post('/api/Sesion/entregar-pedidos', { idsPedidos });
    return response;
}