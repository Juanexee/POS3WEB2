// shared/services/ventaService.js
import { BASE_URL } from './config.js';

/**
 * Obtiene la lista completa de ventas desde la API
 * @returns {Promise<Array>} Lista de objetos de ventas
 */
export async function obtenerVentas() {
    const endpoint = `${BASE_URL}/api/Ventas`;
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
        if (response.status === 404) {
            return []; // No hay ventas registradas
        }
        throw new Error('No se pudo cargar la lista de ventas del servidor.');
    }

    return await response.json();
}

/**
 * Obtiene una venta específica con sus detalles
 * @param {number} id ID de la venta
 * @returns {Promise<object>} Objeto de la venta con detalles
 */
export async function obtenerVentaPorId(id) {
    const endpoint = `${BASE_URL}/api/Ventas/${id}`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('No se encontró la factura especificada.');
        }
        throw new Error('Error al cargar los detalles de la factura.');
    }

    return await response.json();
}

/**
 * Registra una nueva venta con sus detalles
 * @param {object} ventaData Objeto con los datos de la venta y sus detalles
 */
export async function registrarVenta(ventaData) {
    const endpoint = `${BASE_URL}/api/Ventas/registrar`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventaData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar la venta.');
    }

    return await response.json();
}

/**
 * Actualiza el estado de un grupo de pedidos
 * @param {string} ids Cadena de IDs separados por coma
 * @param {string} nuevoEstado Estado destino ('EnPreparacion' o 'Listo')
 */
export async function actualizarEstadoPedidos(ids, nuevoEstado) {
    const endpoint = `${BASE_URL}/api/Ventas/actualizar-estado-grupo?ids=${encodeURIComponent(ids)}&nuevoEstado=${encodeURIComponent(nuevoEstado)}`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('No se pudo actualizar el estado de los pedidos.');
    }

    return await response.json();
}

/**
 * Obtiene los pedidos pendientes para la cocina
 * @returns {Promise<Array>} Lista de pedidos agrupados
 */
export async function obtenerPedidosCocina() {
    const endpoint = `${BASE_URL}/api/Ventas/pedidos`;
    const token = localStorage.getItem('token_mimi');

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            return []; // No hay pedidos pendientes
        }
        throw new Error('No se pudieron cargar los pedidos de cocina.');
    }

    return await response.json();
}