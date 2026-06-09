// shared/services/personalService.js
import HttpService from './HttpService.js';

export default class PersonalService extends HttpService {
    constructor() {
        super();
        this.endpointBase = '/Usuario';
    }

    async obtenerTodos() {
        const response = await this.get(`${this.endpointBase}/Leer`);
        if (response.success === false) {
            throw new Error(response.message || 'Error al cargar el personal');
        }
        return response;
    }

    async crear(datosUsuario) {
        const response = await this.post(`${this.endpointBase}/Crear`, datosUsuario);
        if (response.success === false) {
            throw new Error(response.message || 'Error al crear usuario');
        }
        return response;
    }

    async actualizar(id, datosUsuario) {
        const response = await this.put(`${this.endpointBase}/${id}/Actualizar%20usuario`, datosUsuario);
        if (response.success === false) {
            throw new Error(response.message || 'Error al actualizar usuario');
        }
        return response;
    }

    async eliminar(id) {
        const response = await this.put(`${this.endpointBase}/${id}/Eliminar`);
        if (response.success === false) {
            throw new Error(response.message || 'Error al eliminar usuario');
        }
        return true;
    }
}

// Exportaciones para compatibilidad
export async function obtenerPersonal() {
    const service = new PersonalService();
    return await service.obtenerTodos();
}

export async function obtenerRoles() {
    const service = new PersonalService();
    const response = await service.get('/Rol/Leer');
    return response;
}

export async function crearUsuario(datosUsuario) {
    const service = new PersonalService();
    return await service.crear(datosUsuario);
}

export async function actualizarUsuario(id, datosUsuario) {
    const service = new PersonalService();
    return await service.actualizar(id, datosUsuario);
}

export async function eliminarUsuario(id) {
    const service = new PersonalService();
    return await service.eliminar(id);
}