import { BASE_URL } from './config.js';

/**
 * Obtiene la lista completa de mesas desde la API utilizando el token de sesión.
 * @returns {Promise<Array>} Lista de objetos de mesas
 */
export async function obtenerMesas() {
    const endpoint = `${BASE_URL}/api/Mesas/Leer`;
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
        throw new Error('No se pudo cargar la lista de mesas del servidor.');
    }

    return await response.json();
}

/**
 * Envía una nueva mesa a la API para registrarla en la base de datos.
 * @param {object} datosMesa Objeto con numeroMesa, capacidad, ubicacion y estado.
 */
export async function insertarMesa(datosMesa) {
    const endpoint = `${BASE_URL}/api/Mesas/Insertar`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosMesa)
    });

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Datos de la mesa inválidos o número de mesa ya registrado.');
        }
        throw new Error('Error al intentar registrar la mesa en el servidor.');
    }

    return await response.json();
}

/**
 * Actualiza los datos de una mesa existente en la API.
 * @param {number} id ID interno de la mesa
 * @param {object} datosMesa Objeto con numeroMesa, capacidad, ubicacion
 */
export async function actualizarMesa(id, datosMesa) {
    const endpoint = `${BASE_URL}/api/Mesas/Actualizar/${id}`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosMesa)
    });

    if (!response.ok) {
        throw new Error('No se pudo actualizar la mesa en el servidor.');
    }
    return await response.json();
}

/**
 * Elimina una mesa de la base de datos por su ID.
 * @param {number} id ID interno de la mesa
 */
export async function eliminarMesa(id) {
    const endpoint = `${BASE_URL}/api/Mesas/Eliminar/${id}`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('No se pudo eliminar la mesa. Verifique que no esté ocupada.');
    }
    return true;
}

/**
 * Envía una petición para cambiar la sesión activa a una nueva mesa.
 * @param {number} sesionId ID de la sesión actual
 * @param {number} nuevaMesaId ID de la mesa destino
 */
export async function cambiarMesaService(sesionId, nuevaMesaId) {
    const endpoint = `${BASE_URL}/api/Sesion/cambiar-mesa`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sesionId, nuevaMesaId })
    });

    const resultado = await response.json();
    if (!response.ok) {
        throw new Error(resultado.message || 'Error al intentar cambiar de mesa.');
    }
    return resultado;
}

/**
 * Registra la entrega o despacho de los platos listos de la mesa.
 * @param {Array<number>} idsPedidos Lista de IDs de los pedidos a entregar
 */
export async function entregarPedidosService(idsPedidos) {
    const endpoint = `${BASE_URL}/api/Sesion/entregar-pedidos`; 
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idsPedidos }) //  ¡Ahora coincide con ActualizarPedidoRequest!
    });

    const resultado = await response.json();

    if (!response.ok) {
        // Capturamos el mensaje de tu regla de negocio (ej: "Denegado: No puedes entregar...")
        throw new Error(resultado.message || 'No se pudo registrar la entrega de los pedidos.');
    }
    return resultado;
}