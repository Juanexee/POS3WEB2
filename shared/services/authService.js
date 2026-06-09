// shared/services/authService.js

import HttpService from './HttpService.js';

export default class AuthService extends HttpService {
    
    constructor() {
        super();
        this.endpointBase = '/api/Auth';
    }

    /**
     * Envía las credenciales a la API para verificar el acceso.
     * @param {string} nombreUsuario 
     * @param {string} password 
     * @returns {Promise<object>}
     */
    async login(nombreUsuario, password) {
        const response = await this.post(`${this.endpointBase}/login`, { nombreUsuario, password });
        
        if (response.success === false) {
            if (response.status === 401) throw new Error('Usuario o contraseña incorrectos.');
            if (response.status === 400) throw new Error('Faltan campos obligatorios.');
            throw new Error(response.message || 'Error de conexión con el servidor.');
        }
        
        if (response.token) {
            this.guardarSesion(response.token, nombreUsuario);
        }
        
        return response;
    }
    
    guardarSesion(token, usuario) {
        localStorage.setItem('token_mimi', token);
        localStorage.setItem('usuario_activo', usuario);
        localStorage.setItem('authToken', token);
    }

    cerrarSesion() {
        localStorage.removeItem('token_mimi');
        localStorage.removeItem('usuario_activo');
        localStorage.removeItem('authToken');
        localStorage.removeItem('sesionActiva');
        localStorage.removeItem('mesaActual');
    }

    estaAutenticado() {
        const token = localStorage.getItem('token_mimi');
        return !!token;
    }

    obtenerUsuarioActual() {
        return localStorage.getItem('usuario_activo');
    }
}

// Exportaciones para compatibilidad con login.js
export async function login(nombreUsuario, password) {
    const authService = new AuthService();
    return await authService.login(nombreUsuario, password);
}

export function guardarSesion(token, usuario) {
    const authService = new AuthService();
    authService.guardarSesion(token, usuario);
}

export function cerrarSesion() {
    const authService = new AuthService();
    authService.cerrarSesion();
}

export function estaAutenticado() {
    const authService = new AuthService();
    return authService.estaAutenticado();
}

export function obtenerUsuarioActual() {
    const authService = new AuthService();
    return authService.obtenerUsuarioActual();
}