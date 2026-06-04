// pages/facturas/Factura.js
import { obtenerVentas, obtenerVentaPorId } from '../../shared/services/ventaService.js';

// Variables globales
let listaVentas = [];
let ventaSeleccionada = null;
let currentPage = 1;
let itemsPerPage = 8;
let filtroTexto = '';

// Elementos DOM
let tablaBody;
let cardsContainer;
let inputBuscar;
let btnPrev, btnNext, infoPagina;
let modalDetalle, modalTicket;
let formCobro;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloFacturas();
});

async function inicializarModuloFacturas() {
    // Obtener referencias
    tablaBody = document.getElementById('invoice-table-body');
    cardsContainer = document.getElementById('invoice-cards-container');
    inputBuscar = document.getElementById('input-buscar-factura');
    btnPrev = document.getElementById('btn-prev');
    btnNext = document.getElementById('btn-next');
    infoPagina = document.getElementById('info-pagina');
    modalDetalle = document.getElementById('modal-detalle-factura');
    modalTicket = document.getElementById('modal-ticket');
    formCobro = document.getElementById('form-cobro');

    const btnRefrescar = document.getElementById('btn-refrescar');

    // Configurar eventos
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            filtroTexto = e.target.value.toLowerCase();
            currentPage = 1;
            renderizarLista();
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderizarLista();
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentPage < totalPages()) {
                currentPage++;
                renderizarLista();
            }
        });
    }

    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', async () => {
            await cargarVentas();
        });
    }

    if (formCobro) {
        formCobro.addEventListener('submit', (e) => {
            e.preventDefault();
            procesarCobro();
        });
    }

    // Cargar datos
    await cargarVentas();

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modalDetalle) cerrarModalDetalle();
        if (e.target === modalTicket) cerrarModalTicket();
    });
}

async function cargarVentas() {
    try {
        mostrarLoading();
        listaVentas = await obtenerVentas();
        renderizarLista();
    } catch (error) {
        console.error('Error al cargar ventas:', error);
        mostrarError(error.message);
    }
}

function renderizarLista() {
    // Filtrar datos
    let datosFiltrados = [...listaVentas];
    
    if (filtroTexto) {
        datosFiltrados = datosFiltrados.filter(venta => 
            venta.ventaID?.toString().includes(filtroTexto) ||
            venta.nombreCajero?.toLowerCase().includes(filtroTexto)
        );
    }
    
    // Paginación
    const totalItems = datosFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const datosPagina = datosFiltrados.slice(startIndex, endIndex);
    
    // Actualizar controles de paginación
    if (infoPagina) {
        infoPagina.textContent = `Página ${currentPage} de ${totalPaginas || 1}`;
    }
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage === totalPaginas || totalPaginas === 0;
    
    // Renderizar según vista
    renderizarTabla(datosPagina);
    renderizarTarjetas(datosPagina);
}

function renderizarTabla(ventas) {
    if (!tablaBody) return;
    
    if (ventas.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay facturas registradas</td></tr>';
        return;
    }
    
    tablaBody.innerHTML = '';
    
    ventas.forEach(venta => {
        const fecha = venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : '-';
        const estado = venta.estado?.toLowerCase() === 'pagada' ? 'Pagado' : 'Pendiente';
        const estadoClass = venta.estado?.toLowerCase() === 'pagada' ? 'estado-pagado' : 'estado-pendiente';
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>#${venta.ventaID}</strong></td>
            <td>${fecha}</td>
            <td>Mesa ${venta.mesaID || 'N/A'}</td>
            <td>${escapeHtml(venta.nombreCajero || 'N/A')}</td>
            <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
            <td class="text-bold">C$ ${venta.total?.toFixed(2) || '0.00'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-view" data-id="${venta.ventaID}" title="Ver Detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${venta.estado?.toLowerCase() !== 'pagada' ? 
                        `<button class="btn-action btn-print" data-id="${venta.ventaID}" title="Cobrar">
                            <i class="fas fa-cash-register"></i>
                        </button>` : ''}
                </div>
            </td>
        `;
        
        tablaBody.appendChild(fila);
    });
    
    // Agregar event listeners a botones
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => verDetalleVenta(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', () => abrirModalCobro(parseInt(btn.dataset.id)));
    });
}

function renderizarTarjetas(ventas) {
    if (!cardsContainer) return;
    
    if (ventas.length === 0) {
        cardsContainer.innerHTML = '<div class="loading-cards">No hay facturas registradas</div>';
        return;
    }
    
    cardsContainer.innerHTML = '';
    
    ventas.forEach(venta => {
        const fecha = venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : '-';
        const estado = venta.estado?.toLowerCase() === 'pagada' ? 'pagado' : 'pendiente';
        const estadoTexto = venta.estado?.toLowerCase() === 'pagada' ? 'Pagado' : 'Pendiente';
        const estadoClass = venta.estado?.toLowerCase() === 'pagada' ? 'badge-pagado' : 'badge-pendiente';
        
        const card = document.createElement('div');
        card.className = `invoice-card status-${estado}`;
        card.innerHTML = `
            <div class="card-header">
                <span class="invoice-number">#${venta.ventaID}</span>
                <span class="badge ${estadoClass}">${estadoTexto}</span>
            </div>
            <div class="card-body">
                <p><strong>📅 Fecha:</strong> ${fecha}</p>
                <p><strong>🪑 Mesa:</strong> ${venta.mesaID || 'N/A'}</p>
                <p><strong>👤 Atendido:</strong> ${escapeHtml(venta.nombreCajero || 'N/A')}</p>
                <p class="invoice-total"><strong>Total:</strong> C$ ${venta.total?.toFixed(2) || '0.00'}</p>
            </div>
            <div class="card-actions">
                <button class="btn-action btn-view" data-id="${venta.ventaID}" title="Ver Detalle">
                    <i class="fas fa-eye"></i>
                </button>
                ${venta.estado?.toLowerCase() !== 'pagada' ? 
                    `<button class="btn-action btn-print" data-id="${venta.ventaID}" title="Cobrar">
                        <i class="fas fa-cash-register"></i>
                    </button>` : ''}
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
    
    // Agregar event listeners a botones de tarjetas
    document.querySelectorAll('.invoice-card .btn-view').forEach(btn => {
        btn.addEventListener('click', () => verDetalleVenta(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.invoice-card .btn-print').forEach(btn => {
        btn.addEventListener('click', () => abrirModalCobro(parseInt(btn.dataset.id)));
    });
}

async function verDetalleVenta(id) {
    try {
        const venta = await obtenerVentaPorId(id);
        mostrarDetalleVenta(venta);
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function mostrarDetalleVenta(venta) {
    // Mostrar información básica
    document.getElementById('modal-titulo').textContent = '🧾 Detalle de Factura';
    document.getElementById('modal-factura-numero').textContent = `#${venta.ventaID}`;
    document.getElementById('venta-id').value = venta.ventaID;
    
    const fecha = venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleString() : '-';
    document.getElementById('factura-fecha').textContent = fecha;
    document.getElementById('factura-mesa').textContent = venta.mesaID ? `Mesa ${venta.mesaID}` : 'N/A';
    document.getElementById('factura-usuario').textContent = venta.nombreMesero || venta.nombreCajero || 'N/A';
    document.getElementById('factura-total').textContent = `C$ ${venta.total?.toFixed(2) || '0.00'}`;
    
    // Mostrar productos
    const listaProductos = document.getElementById('lista-productos');
    if (venta.detalles && venta.detalles.length > 0) {
        listaProductos.innerHTML = '';
        venta.detalles.forEach(detalle => {
            const item = document.createElement('div');
            item.className = 'producto-item';
            item.innerHTML = `
                <span class="producto-nombre">${escapeHtml(detalle.nombrePlatillo || detalle.NombrePlatillo || 'Producto')}</span>
                <span class="producto-cantidad">x${detalle.cantidad || 1}</span>
                <span class="producto-precio">C$ ${((detalle.precio_unitario || 0) * (detalle.cantidad || 1)).toFixed(2)}</span>
            `;
            listaProductos.appendChild(item);
        });
    } else {
        listaProductos.innerHTML = '<p class="text-center">No hay productos registrados</p>';
    }
    
    // Limpiar campos de pago
    document.getElementById('pago-recibido').value = '';
    document.getElementById('cambio-calculo').value = 'C$ 0.00';
    document.getElementById('metodo-pago').value = 'Efectivo';
    
    // Configurar cálculo de cambio
    const pagoRecibidoInput = document.getElementById('pago-recibido');
    const cambioSpan = document.getElementById('cambio-calculo');
    const total = venta.total || 0;
    
    pagoRecibidoInput.oninput = () => {
        const pago = parseFloat(pagoRecibidoInput.value) || 0;
        const cambio = pago - total;
        if (cambio >= 0) {
            cambioSpan.value = `C$ ${cambio.toFixed(2)}`;
            cambioSpan.style.color = '#2e7d32';
        } else {
            cambioSpan.value = `C$ ${cambio.toFixed(2)} (Faltante)`;
            cambioSpan.style.color = '#dc3545';
        }
    };
    
    modalDetalle.style.display = 'flex';
}

function abrirModalCobro(id) {
    verDetalleVenta(id);
}

async function procesarCobro() {
    const ventaId = document.getElementById('venta-id').value;
    const pagoRecibido = parseFloat(document.getElementById('pago-recibido').value) || 0;
    const metodoPago = document.getElementById('metodo-pago').value;
    const venta = listaVentas.find(v => v.ventaID === parseInt(ventaId));
    
    if (!venta) {
        mostrarNotificacion('Error: No se encontró la factura', 'error');
        return;
    }
    
    const total = venta.total || 0;
    
    if (pagoRecibido < total) {
        mostrarNotificacion(`El monto recibido (C$${pagoRecibido.toFixed(2)}) es insuficiente. Total: C$${total.toFixed(2)}`, 'error');
        return;
    }
    
    const cambio = pagoRecibido - total;
    
    // Aquí se integraría la llamada a la API para registrar el pago
    // Por ahora, mostramos el ticket
    mostrarTicket(venta, pagoRecibido, cambio, metodoPago);
    cerrarModalDetalle();
}

function mostrarTicket(venta, pagoRecibido, cambio, metodoPago) {
    const fecha = new Date().toLocaleString();
    const ticketHTML = `
        <div class="ticket-header">
            <strong>EL RANCHO DE LA MIMI</strong><br>
            Jinotepe, Carazo, Nicaragua<br>
            ${fecha}<br>
            Factura #${venta.ventaID}
        </div>
        <div class="ticket-line"></div>
        <div>
            <small>Cant. Descripción</small><br>
            ${venta.detalles ? venta.detalles.map(d => 
                `${d.cantidad || 1}x ${d.nombrePlatillo || d.NombrePlatillo || 'Producto'} - C$${((d.precio_unitario || 0) * (d.cantidad || 1)).toFixed(2)}`
            ).join('<br>') : 'No hay productos'}
        </div>
        <div class="ticket-line"></div>
        <div>
            <strong>TOTAL: C$${(venta.total || 0).toFixed(2)}</strong><br>
            Pagado con: ${metodoPago}<br>
            Recibido: C$${pagoRecibido.toFixed(2)}<br>
            Cambio: C$${cambio.toFixed(2)}
        </div>
        <div class="ticket-line"></div>
        <div class="ticket-header">
            ¡Gracias por su visita!
        </div>
    `;
    
    const ticketContenido = document.getElementById('ticket-contenido');
    if (ticketContenido) {
        ticketContenido.innerHTML = ticketHTML;
    }
    
    modalTicket.style.display = 'flex';
}

function cerrarModalDetalle() {
    if (modalDetalle) modalDetalle.style.display = 'none';
}

function cerrarModalTicket() {
    if (modalTicket) modalTicket.style.display = 'none';
}

// Configurar botón de impresión
document.getElementById('btn-imprimir-ticket')?.addEventListener('click', () => {
    const ticketContent = document.getElementById('ticket-contenido')?.innerHTML;
    if (ticketContent) {
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <html>
            <head>
                <title>Ticket de Venta</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
                    .ticket-header { text-align: center; margin-bottom: 10px; }
                    .ticket-line { border-top: 1px dashed #000; margin: 5px 0; }
                </style>
            </head>
            <body>${ticketContent}</body>
            </html>
        `);
        ventanaImpresion.document.close();
        ventanaImpresion.print();
        ventanaImpresion.close();
    }
});

document.getElementById('btn-cerrar-modal')?.addEventListener('click', cerrarModalDetalle);
document.getElementById('btn-cerrar-ticket')?.addEventListener('click', cerrarModalTicket);

function mostrarLoading() {
    if (tablaBody) tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando facturas...<\/td></tr>';
    if (cardsContainer) cardsContainer.innerHTML = '<div class="loading-cards">Cargando facturas...</div>';
}

function mostrarError(mensaje) {
    if (tablaBody) tablaBody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: #dc3545;">⚠️ ${mensaje}<\/td></tr>`;
    if (cardsContainer) cardsContainer.innerHTML = `<div class="loading-cards" style="color: #dc3545;">⚠️ ${mensaje}</div>`;
}

function totalPages() {
    let datosFiltrados = [...listaVentas];
    if (filtroTexto) {
        datosFiltrados = datosFiltrados.filter(venta => 
            venta.ventaID?.toString().includes(filtroTexto) ||
            venta.nombreCajero?.toLowerCase().includes(filtroTexto)
        );
    }
    return Math.ceil(datosFiltrados.length / itemsPerPage);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);