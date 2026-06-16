// shared/services/platilloService.js

import HttpService from './HttpService.js';
import { Platillo } from '../models/Platillo.js';

export default class PlatilloService extends HttpService {
    
    constructor() {
        super();
        // 🔴 ANTES: this.endpointBase = '/api/Platillos';
        // ✅ CORREGIDO: Usar la ruta exacta del backend
        this.endpointBase = '/Platillo';
    }

    async obtenerTodos() {
        // ✅ CORREGIDO: Usar 'Leer' como en el backend
        const response = await this.get(`${this.endpointBase}/Leer`);
        
        if (response.success === false) {
            return { success: false, data: [] };
        }
        
        const platillos = response.map(platilloData => new Platillo(platilloData));
        return { success: true, data: platillos };
    }

    async obtenerPorId(id) {
        // ✅ CORREGIDO: GET /Platillo/{id}
        const response = await this.get(`${this.endpointBase}/${id}`);
        
        if (response.success === false || !response.platilloID) {
            return { success: false, data: null };
        }
        
        const platillo = new Platillo(response);
        return { success: true, data: platillo };
    }

    async crear(platilloData) {
        // ✅ CORREGIDO: POST /Platillo/Insertar
        const platillo = platilloData instanceof Platillo ? platilloData : new Platillo(platilloData);
        const validacion = platillo.validar();
        
        if (!validacion.valido) {
            return { success: false, errores: validacion.errores };
        }
        
        const response = await this.post(`${this.endpointBase}/Insertar`, platillo.toJSON());
        return response;
    }

    async actualizar(id, platilloData) {
        // ✅ CORREGIDO: PUT /Platillo/{id}/Actualizar
        const response = await this.put(`${this.endpointBase}/${id}/Actualizar`, platilloData);
        if (response.success === false) {
            throw new Error(response.message || 'Error al actualizar el platillo');
        }
        return response;
    }

    async eliminar(id, disponible = false) {
        // ✅ CORREGIDO: PUT /Platillo/{id}/Disponibilidad?disponible=false
        const response = await this.put(`${this.endpointBase}/${id}/Disponibilidad?disponible=${disponible}`);
        if (response.success === false) {
            throw new Error(response.message || 'Error al cambiar la disponibilidad');
        }
        return response;
    }
}

// Exportaciones para compatibilidad con platillos.js
export async function obtenerPlatillos() {
    const service = new PlatilloService();
    const result = await service.obtenerTodos();
    return result.success ? result.data : [];
}

export async function obtenerPlatilloPorId(id) {
    const service = new PlatilloService();
    const result = await service.obtenerPorId(id);
    return result.success ? result.data : null;
}

export async function insertarPlatillo(payload) {
    const service = new PlatilloService();
    return await service.crear(payload);
}

export async function actualizarPlatillo(id, payload) {
    const service = new PlatilloService();
    return await service.actualizar(id, payload);
}

export async function eliminarPlatillo(id, disponible) {
    const service = new PlatilloService();
    return await service.eliminar(id, disponible);
}