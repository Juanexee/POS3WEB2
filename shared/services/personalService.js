// shared/services/personalService.js
import { BASE_URL } from './config.js';

/**
 * Obtiene la lista completa de usuarios (personal) desde la API
 * @returns {Promise<Array>} Lista de objetos de usuarios
 */
export async function obtenerPersonal() {
    const endpoint = `${BASE_URL}/Usuario/Leer`;
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
            throw new Error('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        }
        throw new Error('No se pudo cargar la lista de personal del servidor.');
    }

    return await response.json();
}

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
        throw new Error('No se pudo cargar la lista de roles del servidor.');
    }

    return await response.json();
}

/**
 * Crea un nuevo usuario (personal)
 * @param {object} datosUsuario Objeto con nombreUsuario, nombre, telefono, rolID, password
 */
export async function crearUsuario(datosUsuario) {
    const endpoint = `${BASE_URL}/Usuario/Crear`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
    });

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Datos de usuario inválidos o nombre de usuario ya existe.');
        }
        throw new Error('Error al intentar registrar el usuario en el servidor.');
    }

    return await response.json();
}

/**
 * Actualiza los datos de un usuario existente
 * @param {number} id ID del usuario
 * @param {object} datosUsuario Objeto con nombre, telefono, rolID
 */
export async function actualizarUsuario(id, datosUsuario) {
    const endpoint = `${BASE_URL}/Usuario/${id}/Actualizar%20usuario`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
    });

    if (!response.ok) {
        throw new Error('No se pudo actualizar el usuario en el servidor.');
    }
    return await response.json();
}

/**
 * Elimina (desactiva) un usuario por su ID
 * @param {number} id ID del usuario
 */
export async function eliminarUsuario(id) {
    const endpoint = `${BASE_URL}/Usuario/${id}/Eliminar`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('No se pudo eliminar el usuario.');
    }
    return true;
}