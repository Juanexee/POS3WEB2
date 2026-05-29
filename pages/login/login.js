// pages/login/login.js
// Usamos 'import' para traer la lógica especializada desde la carpeta shared
import { login, guardarSesion } from '../../shared/services/authService.js';

document.getElementById('form-login').addEventListener('submit', handleLoginSubmit);

async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const nombreUsuario = formData.get('nombreUsuario');
    const password = formData.get('password');

    try {
        // Llamamos al servicio de forma limpia
        const data = await login(nombreUsuario, password);
        
        // Si la API responde con éxito, guardamos los datos en el LocalStorage
        if (data.token) {
            guardarSesion(data.token, nombreUsuario);
        }

        alert('¡Bienvenido a El Rancho de la Mimi!');
        window.location.href = "../admin/inicio.html"; // Redirige al dashboard

    } catch (error) {
        console.error('Error en controlador de login:', error);
        alert(error.message); // Muestra el mensaje exacto controlado en el servicio
    }
}