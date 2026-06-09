// pages/cocina/cocina.js

import VentaService from '../../shared/services/VentaService.js';
import SesionService from '../../shared/services/SesionService.js';

const ventaService = new VentaService();
const sesionService = new SesionService();

let connection = null;
let pedidosActuales = [];

async function configurarSignalR() {
    const API_BASE_URL = 'https://localhost:7081';
    
    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/cocinaHub`)
        .withAutomaticReconnect()
        .build();

    connection.on("PedidoActualizado", () => {
        console.log("📢 Nuevo pedido recibido");
        cargarPedidos();
    });

    try {
        await connection.start();
        console.log("✅ SignalR conectado");
    } catch (err) {
        console.error("❌ Error SignalR:", err);
        setTimeout(configurarSignalR, 5000);
    }
}

async function cargarPedidos() {
    const contenedor = document.getElementById('contenedor-kds');
    if (!contenedor) return;
    
    contenedor.innerHTML = '<div style="text-align: center; padding: 50px;">Cargando...</div>';
    
    const { success, data: pedidos } = await ventaService.obtenerPedidosCocina();
    
    if (!success || pedidos.length === 0) {
        contenedor.innerHTML = '<div style="text-align: center; padding: 50px; color: #999;">🍽️ No hay pedidos pendientes</div>';
        return;
    }
    
    pedidosActuales = pedidos;
    renderizarPedidos(pedidos);
}

function renderizarPedidos(pedidos) {
    const contenedor = document.getElementById('contenedor-kds');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    pedidos.forEach(({ nombrePlatillo, cantidadTotal, tiempoEspera, idsRelacionados }) => {
        const alertaClass = getAlertaClass(tiempoEspera);
        
        const tarjeta = document.createElement('div');
        tarjeta.className = `tarjeta-cocina ${alertaClass}`;
        tarjeta.innerHTML = `
            <div class="kds-badge">x${cantidadTotal}</div>
            <div class="kds-cuerpo">
                <h2>${nombrePlatillo}</h2>
                <p class="kds-tiempo">${tiempoEspera}</p>
            </div>
            <div class="kds-footer">
                <button class="btn-despachar" data-ids="${idsRelacionados}" data-nombre="${nombrePlatillo}">
                    🍳 ACEPTAR LOTE
                </button>
                <button class="btn-listo" data-ids="${idsRelacionados}" data-nombre="${nombrePlatillo}">
                    ✅ COMIDA LISTA
                </button>
            </div>
        `;
        
        contenedor.appendChild(tarjeta);
    });
    
    contenedor.querySelectorAll('.btn-despachar').forEach(btn => {
        btn.addEventListener('click', () => aceptarPedido(btn.dataset.ids, btn.dataset.nombre));
    });
    
    contenedor.querySelectorAll('.btn-listo').forEach(btn => {
        btn.addEventListener('click', () => marcarListo(btn.dataset.ids, btn.dataset.nombre));
    });
}

function getAlertaClass(tiempoEspera) {
    const minutos = parseInt(tiempoEspera);
    if (isNaN(minutos)) return 'alerta-verde';
    if (minutos > 20) return 'alerta-roja';
    if (minutos > 10) return 'alerta-amarilla';
    return 'alerta-verde';
}

async function aceptarPedido(ids, nombrePlatillo) {
    const idsArray = ids.split(',').map(id => parseInt(id));
    
    const result = await sesionService.aceptarLote(idsArray, 'EnPreparacion');
    
    if (result.success !== false) {
        console.log(`✅ Pedido "${nombrePlatillo}" aceptado`);
        await cargarPedidos();
    } else {
        alert(`Error: ${result.message}`);
    }
}

async function marcarListo(ids, nombrePlatillo) {
    const idsArray = ids.split(',').map(id => parseInt(id));
    
    const result = await sesionService.entregarPedidos(idsArray, 'Listo');
    
    if (result.success !== false) {
        console.log(`✅ Pedido "${nombrePlatillo}" listo`);
        await cargarPedidos();
    } else {
        alert(`Error: ${result.message}`);
    }
}

async function init() {
    await configurarSignalR();
    await cargarPedidos();
    setInterval(cargarPedidos, 10000);
}

// Exponer globalmente
window.aceptarPedido = aceptarPedido;
window.marcarListo = marcarListo;
window.cargarPedidos = cargarPedidos;

document.addEventListener('DOMContentLoaded', init);