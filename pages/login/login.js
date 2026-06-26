// pages/login/login.js


import { login, guardarSesion } from '../../shared/services/authService.js';

document.getElementById('form-login').addEventListener('submit', handleLoginSubmit);

async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const nombreUsuario = formData.get('nombreUsuario');
    const password = formData.get('password');

    // Mostrar loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Ingresando...';
    submitBtn.disabled = true;

    try {
        console.log('Intentando login con:', nombreUsuario);
        
        const data = await login(nombreUsuario, password);
        
        console.log('Respuesta del servidor:', data);
        
        if (data.token) {
            guardarSesion(data.token, nombreUsuario);
            alert('¡Bienvenido a El Rancho de la Mimi!');
            window.location.href = "../admin/inicio.html";
        } else {
            throw new Error('No se recibió token de autenticación');
        }
        
    } catch (error) {
        console.error('Error en controlador de login:', error);
        alert(error.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}