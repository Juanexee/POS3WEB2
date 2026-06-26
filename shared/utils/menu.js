// shared/utils/menu.js
// Script global para el control de sesión, menú y cierre de sesión en el Panel de Administración

import { estaAutenticado, obtenerUsuarioActual, cerrarSesion } from '../services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario está autenticado
    const path = window.location.pathname;
    
    // Si no está autenticado y no está en la página de login, redirigir
    if (!estaAutenticado() && !path.includes('/login/')) {
        let loginUrl = '';
        if (path.includes('/pages/')) {
            const base = path.split('/pages/')[0];
            loginUrl = `${base}/pages/login/Login.html`;
        } else {
            loginUrl = '/pages/login/Login.html';
        }
        window.location.href = loginUrl;
        return;
    }

    // 2. Mostrar el nombre del usuario activo
    const userDisplay = document.getElementById('nombre-usuario-actual');
    if (userDisplay) {
        const user = obtenerUsuarioActual();
        if (user) {
            userDisplay.textContent = user;
        }
    }

    // 3. Configurar el botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (confirm('🚪 ¿Está seguro de que desea cerrar la sesión en el sistema?')) {
                cerrarSesion();
                
                let loginUrl = '';
                if (path.includes('/pages/')) {
                    const base = path.split('/pages/')[0];
                    loginUrl = `${base}/pages/login/Login.html`;
                } else {
                    loginUrl = '/pages/login/Login.html';
                }
                window.location.href = loginUrl;
            }
        });
    }
});
