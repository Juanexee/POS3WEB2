// shared/services/categoriaService.js

import HttpService from './HttpService.js';

export default class CategoriaService extends HttpService {
    
    constructor() {
        super();
        this.endpointBase = '/Categoria';
    }

    async obtenerTodas() {
 
        const response = await this.get(`${this.endpointBase}/Leer`);
        
        if (response.success === false) {
            console.error('Error en obtenerTodas:', response);
            throw new Error(response.message || 'Error al cargar las categorías');
        }
        
        if (Array.isArray(response)) {
            return response.map(cat => ({
                categoriaID: cat.categoriaID || cat.CategoriaID,
                nombre: cat.nombre || cat.Nombre,
                activo: cat.activo !== undefined ? cat.activo : (cat.Activo !== undefined ? cat.Activo : true)
            }));
        }
        
        return response;
    }

    async insertar(categoriaData) {
        const payload = {
            nombre: categoriaData.nombre || categoriaData.Nombre
        };
        
        const response = await this.post(`${this.endpointBase}/Insertar`, payload);
        
        if (response.success === false) {
            throw new Error(response.message || 'Error al insertar la categoría');
        }
        
        return response;
    }

    async actualizar(id, categoriaData) {
        const payload = {
            nombre: categoriaData.nombre || categoriaData.Nombre
        };
        
        const response = await this.put(`${this.endpointBase}/Actualizar/${id}`, payload);
        
        if (response.success === false) {
            throw new Error(response.message || 'Error al actualizar la categoría');
        }
        
        return response;
    }

    async eliminar(id) {
        const response = await this.delete(`${this.endpointBase}/Eliminar/${id}`);
        
        if (response.success === false) {
            throw new Error(response.message || 'No se pudo eliminar la categoría');
        }
        
        return true;
    }

    async activar(id) {
        const response = await this.put(`${this.endpointBase}/Activar/${id}`);
        
        if (response.success === false) {
            throw new Error(response.message || 'No se pudo activar la categoría');
        }
        
        return true;
    }
}

// Exportaciones para compatibilidad
export async function obtenerCategorias() {
    const service = new CategoriaService();
    return await service.obtenerTodas();
}

export async function insertarCategoria(payload) {
    const service = new CategoriaService();
    return await service.insertar(payload);
}

export async function actualizarCategoria(id, payload) {
    const service = new CategoriaService();
    return await service.actualizar(id, payload);
}

export async function eliminarCategoria(id) {
    const service = new CategoriaService();
    return await service.eliminar(id);
}

export async function activarCategoria(id) {
    const service = new CategoriaService();
    return await service.activar(id);
}