// shared/services/rolService.js
import HttpService from './HttpService.js';

export default class RolService extends HttpService {
    constructor() {
        super();
        this.endpointBase = '/Rol';
    }

    async obtenerTodos() {
        const response = await this.get(`${this.endpointBase}/Leer`);
        if (response.success === false) {
            throw new Error(response.message || 'Error al cargar los roles');
        }
        return response;
    }

    async crear(datosRol) {
        const response = await this.post(`${this.endpointBase}/Crear`, datosRol);
        if (response.success === false) {
            throw new Error(response.message || 'Error al crear rol');
        }
        return response;
    }

    async actualizar(datosRol) {
        const response = await this.put(`${this.endpointBase}/Actualizar`, datosRol);
        if (response.success === false) {
            throw new Error(response.message || 'Error al actualizar rol');
        }
        return response;
    }

    async desactivar(id) {
        const response = await this.put(`${this.endpointBase}/${id}/Desactivar`);
        if (response.success === false) {
            throw new Error(response.message || 'Error al desactivar rol');
        }
        return true;
    }
}

// Exportaciones para compatibilidad
export async function obtenerRoles() {
    const service = new RolService();
    return await service.obtenerTodos();
}

export async function crearRol(datosRol) {
    const service = new RolService();
    return await service.crear(datosRol);
}

export async function actualizarRol(datosRol) {
    const service = new RolService();
    return await service.actualizar(datosRol);
}

export async function desactivarRol(id) {
    const service = new RolService();
    return await service.desactivar(id);
}