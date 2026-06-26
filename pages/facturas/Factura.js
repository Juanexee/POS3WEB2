// pages/facturas/Factura.js

import VentaService from '../../shared/services/ventaService.js';
import { Venta } from '../../shared/models/Venta.js';
import { DetalleVenta } from '../../shared/models/DetalleVenta.js';

const ventaService = new VentaService();

// Variables globales
let facturasActuales = [];
let facturaSeleccionada = null;
let currentPage = 1;
let itemsPerPage = 10;
let filtroTexto = '';

// Elementos DOM
let tablaBody;
let cardsContainer;
let modalDetalle;
let modalTicket;
let inputBuscar;
let btnRefrescar;
let btnPrev, btnNext, infoPagina;

// Inicialización robusta
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Factura.js: DOMContentLoaded fired.');
        inicializarModuloFacturas();
    });
} else {
    console.log('Factura.js: DOM already ready.');
    inicializarModuloFacturas();
}

async function inicializarModuloFacturas() {
    console.log('Factura.js: inicializarModuloFacturas() started.');
    // Obtener referencias
    tablaBody = document.getElementById('invoice-table-body');
    cardsContainer = document.getElementById('invoice-cards-container');
    modalDetalle = document.getElementById('modal-detalle-factura');
    modalTicket = document.getElementById('modal-ticket');
    inputBuscar = document.getElementById('input-buscar-factura');
    btnRefrescar = document.getElementById('btn-refrescar');
    btnPrev = document.getElementById('btn-prev');
    btnNext = document.getElementById('btn-next');
    infoPagina = document.getElementById('info-pagina');
    
    // Configurar eventos
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            filtroTexto = e.target.value.toLowerCase();
            currentPage = 1;
            renderizarFacturas();
        });
    }
    
    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', () => cargarFacturas());
    }
    
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderizarFacturas();
            }
        });
    }
    
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentPage < totalPages()) {
                currentPage++;
                renderizarFacturas();
            }
        });
    }
    
    // Configurar modal de cobro
    const formCobro = document.getElementById('form-cobro');
    if (formCobro) {
        formCobro.addEventListener('submit', async (e) => {
            e.preventDefault();
            await procesarCobro();
        });
    }
    
    const pagoRecibido = document.getElementById('pago-recibido');
    if (pagoRecibido) {
        pagoRecibido.addEventListener('input', calcularCambio);
    }
    
    // Botones de cerrar modales
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => {
            modalDetalle.style.display = 'none';
            facturaSeleccionada = null;
        });
    }
    
    const btnCerrarTicket = document.getElementById('btn-cerrar-ticket');
    if (btnCerrarTicket) {
        btnCerrarTicket.addEventListener('click', () => {
            modalTicket.style.display = 'none';
        });
    }
    
    const btnImprimirTicket = document.getElementById('btn-imprimir-ticket');
    if (btnImprimirTicket) {
        btnImprimirTicket.addEventListener('click', () => {
            imprimirTicket();
        });
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalDetalle) {
        modalDetalle.addEventListener('click', (e) => {
            if (e.target === modalDetalle) {
                modalDetalle.style.display = 'none';
                facturaSeleccionada = null;
            }
        });
    }
    
    if (modalTicket) {
        modalTicket.addEventListener('click', (e) => {
            if (e.target === modalTicket) {
                modalTicket.style.display = 'none';
            }
        });
    }
    
    // Cargar datos
    await cargarFacturas();

    // Procesar cobro automático si viene redireccionado del módulo de mesas
    const urlParams = new URLSearchParams(window.location.search);
    const cobrarVentaId = urlParams.get('cobrarVentaId');
    if (cobrarVentaId) {
        abrirModalCobro(parseInt(cobrarVentaId));
    }
}

async function cargarFacturas() {
    console.log('Factura.js: cargarFacturas() invoked.');
    try {
        if (tablaBody) {
            tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando facturas...</td></tr>';
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = '<div class="loading-cards">Cargando facturas...</div>';
        }
        
        console.log('Factura.js: Fetching all invoices from ventaService...');
        const { success, data: facturas } = await ventaService.obtenerTodas();
        console.log('Factura.js: Fetch finished.', { success, count: facturas ? facturas.length : 0 });
        
        if (!success || !facturas) {
            throw new Error('No se pudieron cargar las facturas');
        }
        
        facturasActuales = facturas;
        renderizarFacturas();
        
    } catch (error) {
        console.error('Factura.js: Error in cargarFacturas():', error);
        if (tablaBody) {
            tablaBody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:#dc3545;">⚠️ ${error.message}</td></tr>`;
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = `<div class="error-cards" style="color:#dc3545; text-align:center;">⚠️ ${error.message}</div>`;
        }
    }
}

function totalPages() {
    let datosFiltrados = filtrarFacturas();
    return Math.ceil(datosFiltrados.length / itemsPerPage);
}

function filtrarFacturas() {
    if (!filtroTexto) return facturasActuales;
    
    return facturasActuales.filter(factura => {
        const idMatch = factura.ventaID.toString().includes(filtroTexto);
        const nombreMatch = factura.nombreCajero && factura.nombreCajero.toLowerCase().includes(filtroTexto);
        const mesaMatch = factura.mesaID && factura.mesaID.toString().includes(filtroTexto);
        return idMatch || nombreMatch || mesaMatch;
    });
}

function renderizarFacturas() {
    const datosFiltrados = filtrarFacturas();
    const totalItems = datosFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const datosPagina = datosFiltrados.slice(startIndex, endIndex);
    
    // Actualizar paginación
    if (infoPagina) {
        infoPagina.textContent = `Página ${currentPage} de ${totalPaginas || 1}`;
    }
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage === totalPaginas || totalPaginas === 0;
    
    // Renderizar tabla (Desktop)
    renderizarTabla(datosPagina);
    
    // Renderizar tarjetas (Móvil)
    renderizarCards(datosPagina);
}

function renderizarTabla(facturas) {
    if (!tablaBody) return;
    
    if (facturas.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay facturas registradas</td></tr>';
        return;
    }
    
    tablaBody.innerHTML = '';
    
    facturas.forEach(factura => {
        const fecha = new Date(factura.fechaVenta);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const estadoClass = factura.estado === 'Pagada' ? 'estado-pagado' : 'estado-pendiente';
        const estadoTexto = factura.estado === 'Pagada' ? 'Pagado' : 'Pendiente';
        
        const row = document.createElement('tr');
        row.className = `row-${factura.estado === 'Pagada' ? 'paid' : 'pending'}`;
        row.innerHTML = `
            <td><strong>#${factura.ventaID}</strong></td>
            <td>${fechaFormateada}</td>
            <td>Mesa ${factura.mesaID || 'N/A'}</td>
            <td>${factura.nombreCajero || 'QR Cliente'}</td>
            <td><span class="estado-badge ${estadoClass}">${estadoTexto}</span></td>
            <td class="text-bold">C$${factura.total.toFixed(2)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-view" data-id="${factura.ventaID}" title="Ver Detalle">
                        👁️ Ver
                    </button>
                    ${factura.estado !== 'Pagada' ? 
                        `<button class="btn-pay" data-id="${factura.ventaID}" title="Cobrar">
                            💰 Cobrar
                        </button>` : ''
                    }
                    <button class="btn-print" data-id="${factura.ventaID}" title="Imprimir">
                        🖨️ Imprimir
                    </button>
                </div>
            </td>
        `;
        
        tablaBody.appendChild(row);
    });
    
    // Event listeners para botones de la tabla
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => verDetalleFactura(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.btn-pay').forEach(btn => {
        btn.addEventListener('click', () => abrirModalCobro(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', () => imprimirFactura(parseInt(btn.dataset.id)));
    });
}

function renderizarCards(facturas) {
    if (!cardsContainer) return;
    
    if (facturas.length === 0) {
        cardsContainer.innerHTML = '<div class="no-results">No hay facturas registradas</div>';
        return;
    }
    
    cardsContainer.innerHTML = '';
    
    facturas.forEach(factura => {
        const fecha = new Date(factura.fechaVenta);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        
        const estadoClass = factura.estado === 'Pagada' ? 'status-pagado' : 'status-pendiente';
        const estadoTexto = factura.estado === 'Pagada' ? 'Pagado' : 'Pendiente';
        
        const card = document.createElement('div');
        card.className = `invoice-card ${estadoClass}`;
        card.innerHTML = `
            <div class="card-header">
                <span class="invoice-number">#${factura.ventaID}</span>
                <span class="badge badge-${factura.estado === 'Pagada' ? 'pagado' : 'pendiente'}">${estadoTexto}</span>
            </div>
            <div class="card-body">
                <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>🪑 Mesa:</strong> ${factura.mesaID || 'N/A'}</p>
                <p><strong>👤 Cajero:</strong> ${factura.nombreCajero || 'QR Cliente'}</p>
                <p class="invoice-total">Total: C$${factura.total.toFixed(2)}</p>
            </div>
            <div class="card-actions">
                <button class="btn-view" data-id="${factura.ventaID}" title="Ver Detalle">
                    👁️
                </button>
                ${factura.estado !== 'Pagada' ? 
                    `<button class="btn-pay" data-id="${factura.ventaID}" title="Cobrar">
                        💰
                    </button>` : ''
                }
                <button class="btn-print" data-id="${factura.ventaID}" title="Imprimir">
                    🖨️
                </button>
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
    
    // Event listeners para botones de las tarjetas
    cardsContainer.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => verDetalleFactura(parseInt(btn.dataset.id)));
    });
    
    cardsContainer.querySelectorAll('.btn-pay').forEach(btn => {
        btn.addEventListener('click', () => abrirModalCobro(parseInt(btn.dataset.id)));
    });
    
    cardsContainer.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', () => imprimirFactura(parseInt(btn.dataset.id)));
    });
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

async function verDetalleFactura(ventaID) {
    try {
        const { success, data: venta } = await ventaService.obtenerPorId(ventaID);
        
        if (!success || !venta) {
            alert('No se pudo cargar el detalle de la factura');
            return;
        }
        
        facturaSeleccionada = venta;
        
        // Llenar modal con datos
        document.getElementById('venta-id').value = venta.ventaID;
        document.getElementById('modal-factura-numero').textContent = `#${venta.ventaID}`;
        document.getElementById('factura-fecha').textContent = new Date(venta.fecha).toLocaleString();
        document.getElementById('factura-mesa').textContent = `Mesa ${venta.mesaID}`;
        document.getElementById('factura-usuario').textContent = venta.usuarioID ? `Usuario ID: ${venta.usuarioID}` : 'Cliente QR';
        document.getElementById('factura-total').textContent = `C$${venta.total.toFixed(2)}`;
        
        // Renderizar productos
        const listaProductos = document.getElementById('lista-productos');
        if (listaProductos && venta.detalles) {
            if (venta.detalles.length === 0) {
                listaProductos.innerHTML = '<p class="text-center">No hay productos en esta factura</p>';
            } else {
                listaProductos.innerHTML = venta.detalles.map(detalle => {
                    const commentText = detalle.personalizacionTexto ? detalle.personalizacionTexto.replace(/\n/g, ', ') : '';
                    const notesHtml = commentText ? `<div class="producto-nota" style="font-size: 0.85rem; color: #ff6b00; margin-left: 10px; font-style: italic;">• ${commentText}</div>` : '';
                    return `
                        <div class="producto-item-wrapper" style="margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 6px;">
                            <div class="producto-item" style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="producto-nombre" style="font-weight: 500;">${detalle.nombreProducto}</span>
                                <span class="producto-cantidad">x${detalle.cantidad}</span>
                                <span class="producto-precio">C$${detalle.precioUnitario.toFixed(2)}</span>
                                <span class="producto-subtotal" style="font-weight: 600;">C$${detalle.subtotal.toFixed(2)}</span>
                            </div>
                            ${notesHtml}
                        </div>
                    `;
                }).join('');
            }
        }
        
        // Resetear campos de pago
        document.getElementById('pago-recibido').value = '';
        document.getElementById('cambio-calculo').value = 'C$ 0.00';
        document.getElementById('metodo-pago').value = 'Efectivo';
        
        modalDetalle.style.display = 'flex';
        
    } catch (error) {
        console.error('Error al ver detalle:', error);
        alert('Error al cargar el detalle de la factura');
    }
}

function calcularCambio() {
    const pagoRecibido = parseFloat(document.getElementById('pago-recibido').value) || 0;
    const total = facturaSeleccionada ? facturaSeleccionada.total : 0;
    const cambio = pagoRecibido - total;
    
    const cambioElement = document.getElementById('cambio-calculo');
    if (cambioElement) {
        if (cambio >= 0) {
            cambioElement.value = `C$ ${cambio.toFixed(2)}`;
            cambioElement.style.color = '#28a745';
        } else {
            cambioElement.value = `Faltan C$ ${Math.abs(cambio).toFixed(2)}`;
            cambioElement.style.color = '#dc3545';
        }
    }
}

async function procesarCobro() {
    if (!facturaSeleccionada) return;
    
    const pagoRecibido = parseFloat(document.getElementById('pago-recibido').value) || 0;
    const total = facturaSeleccionada.total;
    const metodoPago = document.getElementById('metodo-pago').value;
    
    if (pagoRecibido < total) {
        alert(`⚠️ El pago recibido (C$${pagoRecibido.toFixed(2)}) es menor al total (C$${total.toFixed(2)})`);
        return;
    }
    
    const cambio = pagoRecibido - total;
    const confirmar = confirm(`💰 Confirmar Cobro:\n\nTotal: C$${total.toFixed(2)}\nPago: C$${pagoRecibido.toFixed(2)}\nCambio: C$${cambio.toFixed(2)}\nMétodo: ${metodoPago}\n\n¿Procesar cobro?`);
    
    if (!confirmar) return;
    
    try {
        const response = await ventaService.cobrar(facturaSeleccionada.ventaID);
        if (response.success === false) {
            throw new Error(response.message || 'Error al procesar el cobro en el servidor');
        }
        
        mostrarNotificacion('✅ Cobro registrado exitosamente', 'success');
        
        modalDetalle.style.display = 'none';
        facturaSeleccionada = null;
        await cargarFacturas(); // Recargar lista
        
    } catch (error) {
        console.error('Error al procesar cobro:', error);
        mostrarNotificacion('❌ Error al procesar el cobro', 'error');
    }
}

function abrirModalCobro(ventaID) {
    verDetalleFactura(ventaID);
}

async function imprimirFactura(ventaID) {
    try {
        const { success, data: venta } = await ventaService.obtenerPorId(ventaID);
        
        if (!success || !venta) {
            alert('No se pudo cargar la factura para imprimir');
            return;
        }
        
        const ticketHTML = generarTicketHTML(venta);
        document.getElementById('ticket-contenido').innerHTML = ticketHTML;
        modalTicket.style.display = 'flex';
        
    } catch (error) {
        console.error('Error al imprimir factura:', error);
        alert('Error al generar el ticket');
    }
}

function generarTicketHTML(venta) {
    const fecha = new Date(venta.fecha);
    const fechaStr = fecha.toLocaleString('es-ES');
    
    return `
        <div class="ticket">
            <div class="ticket-header">
                <h3>🍽️ EL RANCHO DE LA MIMI</h3>
                <p>Jinotepe, Carazo, Nicaragua</p>
                <p>Tel: (505) 1234-5678</p>
                <div class="ticket-line">--------------------------------</div>
                <p><strong>FACTURA #${venta.ventaID}</strong></p>
                <p>Fecha: ${fechaStr}</p>
                <p>Mesa: ${venta.mesaID}</p>
                <p>Atendido por: ${venta.usuarioID ? `Usuario #${venta.usuarioID}` : 'Cliente QR'}</p>
                <div class="ticket-line">--------------------------------</div>
            </div>
            <div class="ticket-body">
                ${venta.detalles.map(detalle => `
                    <div class="ticket-item">
                        <span>${detalle.cantidad}x ${detalle.nombreProducto}</span>
                        <span>C$${detalle.subtotal.toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="ticket-line">--------------------------------</div>
            </div>
            <div class="ticket-footer">
                <p><strong>TOTAL: C$${venta.total.toFixed(2)}</strong></p>
                <p>🎉 ¡Gracias por su visita!</p>
                <p>⭐ Síguenos en redes sociales</p>
            </div>
        </div>
    `;
}

function imprimirTicket() {
    const contenido = document.getElementById('ticket-contenido').innerHTML;
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
            <head>
                <title>Ticket de Venta</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        margin: 0;
                        padding: 20px;
                        background: white;
                    }
                    .ticket {
                        max-width: 300px;
                        margin: 0 auto;
                        text-align: center;
                    }
                    .ticket-header, .ticket-footer {
                        margin: 10px 0;
                    }
                    .ticket-item {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                    }
                    .ticket-line {
                        border-top: 1px dashed #000;
                        margin: 10px 0;
                    }
                    h3 {
                        margin: 0;
                        color: #ff6b00;
                    }
                </style>
            </head>
            <body>${contenido}</body>
        </html>
    `);
    ventana.document.close();
    ventana.print();
    ventana.close();
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: ${tipo === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        border-radius: 8px;
        z-index: 1100;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);