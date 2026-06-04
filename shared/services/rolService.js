// shared/services/rolService.js
import { BASE_URL } from './config.js';

/**
 * Obtiene la lista completa de roles desde la API
 * @returns {Promise<Array>} Lista de objetos de roles
 */
export async function obtenerRoles() {
    const endpoint = `${BASE_URL}/Rol/Leer`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Sesión expirada o no autorizada.');
        }
        throw new Error('No se pudo cargar la lista de roles.');
    }

    return await response.json();
}

/**
 * Crea un nuevo rol
 * @param {object} datosRol Objeto con nombreRol, descripcionRol, activo
 */
export async function crearRol(datosRol) {
    const endpoint = `${BASE_URL}/Rol/Crear`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosRol)
    });

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Datos de rol inválidos o el nombre ya existe.');
        }
        throw new Error('Error al crear el rol.');
    }

    return await response.json();
}

/**
 * Actualiza un rol existente
 * @param {object} datosRol Objeto con rolID, nombreRol, descripcionRol, activo
 */
export async function actualizarRol(datosRol) {
    const endpoint = `${BASE_URL}/Rol/Actualizar`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosRol)
    });

    if (!response.ok) {
        throw new Error('No se pudo actualizar el rol.');
    }
    return await response.json();
}

/**
 * Desactiva un rol por su ID
 * @param {number} id ID del rol
 */
export async function desactivarRol(id) {
    const endpoint = `${BASE_URL}/Rol/${id}/Desactivar`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('No se pudo desactivar el rol.');
    }
    return true;
}