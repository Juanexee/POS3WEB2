// shared/services/platilloService.js

const API_URL = 'https://localhost:7081';

function obtenerCabeceras() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// GET: Leer todos los platillos
export async function obtenerPlatillos() {
    const respuesta = await fetch(`${API_URL}/Platillo/Leer`, {
        method: 'GET',
        headers: obtenerCabeceras()
    });
    if (!respuesta.ok) throw new Error('Error al leer la lista de platillos desde el servidor.');
    return await respuesta.json();
}

// POST: Insertar un nuevo platillo
export async function insertarPlatillo(payload) {
    const respuesta = await fetch(`${API_URL}/Platillo/Insertar`, {
        method: 'POST',
        headers: obtenerCabeceras(),
        body: JSON.stringify(payload)
    });
    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al insertar el platillo en el sistema.');
    }
    return await respuesta.json();
}

// PUT: Cambiar la disponibilidad del platillo (Disponible / Agotado)
export async function cambiarDisponibilidadPlatillo(id, disponible) {
    const respuesta = await fetch(`${API_URL}/Platillo/${id}/Disponibilidad?disponible=${disponible}`, {
        method: 'PUT',
        headers: obtenerCabeceras()
    });
    if (!respuesta.ok) throw new Error('No se pudo actualizar el estado de disponibilidad.');
    return await respuesta.json();
}