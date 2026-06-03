// shared/services/categoriaService.js
const API_URL = 'https://localhost:7081'; 

function obtenerCabeceras() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// GET: Leer todas las categorías
export async function obtenerCategorias() {
    const respuesta = await fetch(`${API_URL}/Categoria/Leer`, {
        method: 'GET',
        headers: obtenerCabeceras()
    });
    if (!respuesta.ok) throw new Error('Error al cargar las categorías desde el servidor.');
    return await respuesta.json();
}

// POST: Insertar categoría
export async function insertarCategoria(payload) {
    const respuesta = await fetch(`${API_URL}/Categoria/Insertar`, {
        method: 'POST',
        headers: obtenerCabeceras(),
        body: JSON.stringify(payload)
    });
    if (!respuesta.ok) throw new Error('Error al insertar la categoría.');
    return await respuesta.json();
}

// PUT: Actualizar una categoría existente por su ID
export async function actualizarCategoria(id, payload) {
    const respuesta = await fetch(`${API_URL}/Categoria/Actualizar/${id}`, {
        method: 'PUT',
        headers: obtenerCabeceras(),
        body: JSON.stringify(payload)
    });
    if (!respuesta.ok) throw new Error('Error al actualizar la categoría.');
    return await respuesta.json();
}

// DELETE: Eliminar / Desactivar categoría por ID
export async function eliminarCategoria(id) {
    const respuesta = await fetch(`${API_URL}/Categoria/Eliminar/${id}`, {
        method: 'DELETE',
        headers: obtenerCabeceras()
    });
    if (!respuesta.ok) throw new Error('No se pudo completar la baja de la categoría.');
    return await respuesta.json();
}