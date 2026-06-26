// pages/cocina/cocina.js

import VentaService from '../../shared/services/ventaService.js';
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

function formatComment(commentStr) {
    if (!commentStr) return '';
    try {
        const obj = JSON.parse(commentStr);
        let parts = [];
        if (obj.opciones && Array.isArray(obj.opciones)) {
            obj.opciones.forEach(opt => {
                if (opt.seleccion) {
                    const sel = Array.isArray(opt.seleccion) ? opt.seleccion.join(', ') : opt.seleccion;
                    parts.push(`${opt.grupo}: ${sel}`);
                }
            });
        }
        if (obj.nota) {
            parts.push(`Nota: "${obj.nota}"`);
        }
        if (parts.length > 0) return parts.join(', ');
    } catch (e) {
        // Not a JSON string
    }
    return commentStr;
}

function renderizarPedidos(pedidos) {
    const contenedor = document.getElementById('contenedor-kds');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    pedidos.forEach(({ nombrePlatillo, cantidadTotal, tiempoEspera, idsRelacionados, numerosMesas, estado, comentarios }) => {
        const alertaClass = getAlertaClass(tiempoEspera);
        
        let botonesHtml = '';
        if (estado === 'Preparando') {
            botonesHtml = `
                <button class="btn-despachar" disabled style="opacity: 0.6; cursor: not-allowed; background-color: #555; pointer-events: none;">
                    👨‍🍳 EN PREPARACIÓN
                </button>
                <button class="btn-listo" data-ids="${idsRelacionados}" data-nombre="${nombrePlatillo}">
                    ✅ COMIDA LISTA
                </button>
            `;
        } else {
            botonesHtml = `
                <button class="btn-despachar" data-ids="${idsRelacionados}" data-nombre="${nombrePlatillo}">
                    🍳 ACEPTAR LOTE
                </button>
                <button class="btn-listo" disabled style="opacity: 0.5; cursor: not-allowed; pointer-events: none;">
                    ✅ COMIDA LISTA
                </button>
            `;
        }

        let comentariosHtml = '';
        if (comentarios) {
            const comentList = comentarios.split(' | ')
                .map(c => c.trim())
                .filter(c => c && c !== 'null' && c !== 'undefined')
                .map(c => formatComment(c))
                .filter(c => c);
                
            if (comentList.length > 0) {
                comentariosHtml = `
                    <div class="kds-notas" style="margin-top: 10px;">
                        <span>📌 Notas:</span>
                        <ul>
                            ${comentList.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }

        const tarjeta = document.createElement('div');
        tarjeta.className = `tarjeta-cocina ${alertaClass}`;
        tarjeta.innerHTML = `
            <div class="kds-badge">x${cantidadTotal}</div>
            <div class="kds-cuerpo">
                <h2>${nombrePlatillo}</h2>
                <p class="kds-tiempo">${tiempoEspera}</p>
                <p class="kds-mesas" style="margin-top: 8px; font-weight: bold; color: #555;">
                    🪑 Mesas: ${numerosMesas || 'N/A'}
                </p>
                ${comentariosHtml}
            </div>
            <div class="kds-footer">
                ${botonesHtml}
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
    
    const result = await sesionService.aceptarLote(idsArray, 'Preparando');
    
    if (result.success !== false) {
        console.log(`✅ Pedido "${nombrePlatillo}" aceptado`);
        await cargarPedidos();
    } else {
        alert(`Error: ${result.message}`);
    }
}

async function marcarListo(ids, nombrePlatillo) {
    const idsArray = ids.split(',').map(id => parseInt(id));
    
    const result = await sesionService.aceptarLote(idsArray, 'Listo');
    
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