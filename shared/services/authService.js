// shared/services/authService.js
import { BASE_URL } from './config.js';

/**
 * Envia las credenciales a la API para verificar el acceso.
 * @param {string} nombreUsuario 
 * @param {string} password 
 * @returns {Promise<object>} Datos de respuesta de la API (incluye el Token)
 */
export async function login(nombreUsuario, password) {
    const endpoint = `${BASE_URL}/api/Auth/login`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombreUsuario, password })
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error('Usuario o contraseña incorrectos.');
        if (response.status === 400) throw new Error('Faltan campos obligatorios.');
        throw new Error('Error de conexión con el servidor.');
    }

    const data = await response.json(); // Retorna el JSON con el token JWT
    return data; 
}

/**
 * Guarda de forma segura el Token en el almacenamiento local del navegador
 */
export function guardarSesion(token, usuario) {
    localStorage.setItem('token_mimi', token);
    localStorage.setItem('usuario_activo', usuario);
}

/**
 * Cierra la sesión eliminando las credenciales del navegador
 */
export function cerrarSesion() {
    localStorage.removeItem('token_mimi');
    localStorage.removeItem('usuario_activo');
}