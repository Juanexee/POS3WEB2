import { 
    obtenerMesas, 
    insertarMesa, 
    actualizarMesa, 
    eliminarMesa, 
    cambiarMesaService, 
    entregarPedidosService 
} from '../../shared/services/mesaService.js';
import { obtenerPlatillos } from '../../shared/services/platilloService.js';
import SesionService from '../../shared/services/SesionService.js';
import VentaService from '../../shared/services/ventaService.js';
import { obtenerUsuarioIdActual } from '../../shared/services/authService.js';

const sesionService = new SesionService();
const ventaService = new VentaService();

// VARIABLES GLOBALES
let contenedorGrid;
let modalAgregar;
let formAgregarMesa;
let modalTitulo;
let idsPedidosReadyActuales = [];

// Nuevas variables para la gestión de pedidos y estados de sesión
let modalDetalle;
let modalCambioMesa;
let mesaSeleccionadaActual = null; // Guardará el objeto completo de la mesa abierta
let listaCompletaMesas = []; // Caché local para filtrar destinos del select

// Variables para el modal de agregar pedidos (mesero)
let modalAgregarPedido;
let selectPlatilloPedido;
let cantPlatilloPedido;
let comentarioPlatilloPedido;
let tbodyPlatillosAgregados;
let totalPedidoAgregar;
let btnAgregarPedidoMesa;
let listaPlatillosPedidoTemp = [];
let todosLosPlatillos = [];

inicializarModuloMesas();

async function inicializarModuloMesas() {
    contenedorGrid = document.getElementById('contenedor-plano-mesas');
    modalAgregar = document.getElementById('modal-agregar-mesa');
    formAgregarMesa = document.getElementById('form-agregar-mesa');
    modalTitulo = document.getElementById('modal-titulo-mesa');
    
    // Modales de operación
    modalDetalle = document.getElementById('modal-detalle-mesa');
    modalCambioMesa = document.getElementById('modal-cambio-mesa');

    // Botones de control del Modal Detalle
    const btnCerrarDetalle = document.getElementById('btn-cerrar-detalle');
    const btnAbrirCambio = document.getElementById('btn-abrir-cambio');
    const btnConfirmarEntrega = document.getElementById('btn-confirmar-entrega');
    const btnCobrarMesa = document.getElementById('btn-cobrar-mesa');

    // Botones de control del modal agregar pedido (mesero)
    modalAgregarPedido = document.getElementById('modal-agregar-pedido');
    selectPlatilloPedido = document.getElementById('select-platillo-pedido');
    cantPlatilloPedido = document.getElementById('cant-platillo-pedido');
    comentarioPlatilloPedido = document.getElementById('comentario-platillo-pedido');
    tbodyPlatillosAgregados = document.getElementById('tbody-platillos-agregados');
    totalPedidoAgregar = document.getElementById('total-pedido-agregar');
    btnAgregarPedidoMesa = document.getElementById('btn-agregar-pedido-mesa');

    const btnAgregarPlatilloLista = document.getElementById('btn-agregar-platillo-lista');
    const btnCancelarPedido = document.getElementById('btn-cancelar-pedido');
    const btnConfirmarPedidoMesero = document.getElementById('btn-confirmar-pedido-mesero');

    // Botones de control del Modal Cambio de Mesa
    const btnCancelarCambio = document.getElementById('btn-cancelar-cambio');
    const formCambioMesa = document.getElementById('form-cambio-mesa');

    const btnAbrirAgregar = document.getElementById('btn-abrir-agregar');
    const btnCancelarAgregar = document.getElementById('btn-cancelar-agregar');

    if (!contenedorGrid) return;

    // ==========================================
    // ACCIONES: MODAL DETALLE & MODAL CAMBIO
    // ==========================================

    // 1. Botón "Volver" (Salir del detalle)
    if (btnCerrarDetalle) {
        btnCerrarDetalle.addEventListener('click', () => {
            modalDetalle.style.display = 'none';
            mesaSeleccionadaActual = null;
        });
    }

    // 2. Botón "Cambiar Mesa" (Abre sub-modal)
    if (btnAbrirCambio) {
        btnAbrirCambio.addEventListener('click', () => {
            if (!mesaSeleccionadaActual) return;

            // Configurar input origen
            document.getElementById('cambio-mesa-origen').value = `Mesa ${mesaSeleccionadaActual.numeroMesa}`;
            
            // Llenar select dinámicamente con las mesas verdaderamente LIBRES de la DB
            const selectDestino = document.getElementById('mesa-destino-id');
            selectDestino.innerHTML = '<option value="">-- Seleccione una mesa libre --</option>';
            
            // FILTRO ESTRICTO: Solo mesas en estado 'disponible' y que NO tengan sesiones fantasma vinculadas
            const mesasLibres = listaCompletaMesas.filter(m => 
                (m.estado ? m.estado.toLowerCase() : '') === 'disponible' && 
                (m.sesionID === null || m.sesionId === null || m.SesionID === undefined) &&
                (m.id || m.mesaID) !== (mesaSeleccionadaActual.id || mesaSeleccionadaActual.mesaID)
            );

            mesasLibres.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.mesaID || m.id; 
                opt.textContent = `Mesa ${m.numeroMesa} (${m.ubicacion || 'Sin Área'})`;
                selectDestino.appendChild(opt);
            });

            modalCambioMesa.style.display = 'flex';
        });
    }

    // 3. Cancelar sub-modal de Cambio de Mesa
    if (btnCancelarCambio) {
        btnCancelarCambio.addEventListener('click', () => {
            modalCambioMesa.style.display = 'none';
            document.getElementById('form-cambio-mesa').reset();
        });
    }

    // 4. Formulario Submit: Confirmar Cambio de Mesa
    if (formCambioMesa) {
        formCambioMesa.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nuevaMesaId = parseInt(document.getElementById('mesa-destino-id').value);
            
            if (!nuevaMesaId) {
                alert('⚠️ Por favor, seleccione una mesa de destino.');
                return;
            }

            // EXTRAER Y VALIDAR SESION ID AQUÍ (Cuando ya existe contexto de mesaSeleccionadaActual)
            let sesionId = mesaSeleccionadaActual.sesionID || 
                           mesaSeleccionadaActual.sesionId || 
                           mesaSeleccionadaActual.SesionID; 

            // Manejo de plan B para tus pruebas con mesas que no tengan sesión en BD
            if (!sesionId) {
                sesionId = 105; // ID numérico por defecto para testing
            } else {
                sesionId = parseInt(sesionId); // Forzar conversión limpia a Int32 puro
            }

            try {
                await cambiarMesaService(sesionId, nuevaMesaId);
                alert('¡Mesa cambiada exitosamente!');
                
                modalCambioMesa.style.display = 'none';
                modalDetalle.style.display = 'none';
                formCambioMesa.reset();
                
                await cargarMapaMesas(contenedorGrid);
            } catch (error) {
                alert(`⚠️ No se pudo realizar el cambio: ${error.message}`);
            }
        });
    }

    // 5. Botón "Entrega" (Despachar platos listos de la mesa)
    if (btnConfirmarEntrega) {
        btnConfirmarEntrega.addEventListener('click', async () => {
            if (!mesaSeleccionadaActual) return;
            
            try {
                const cantReady = parseInt(document.getElementById('cant-ready').innerText) || 0;
                if (cantReady === 0) {
                    alert('No hay órdenes marcadas como "listas para servir" en esta mesa.');
                    return;
                }

                if (idsPedidosReadyActuales.length === 0) {
                    alert('No hay órdenes marcadas como "listas para servir" en esta mesa.');
                    return;
                }

                // Invocamos al servicio corregido pasando el Array real
                const respuesta = await entregarPedidosService(idsPedidosReadyActuales);
                
                alert(`✅ ${respuesta.message}`); // Muestra el mensaje de éxito de tu capa de negocio
                modalDetalle.style.display = 'none';
                await cargarMapaMesas(contenedorGrid);

            } catch (error) {
                // Ahora este catch atrapará correctamente si la API te dice "Denegado..." debido a tus estados en BD
                alert(`⚠️ Error en entrega: ${error.message}`);
            }
        });
    }

    if (btnCobrarMesa) {
        btnCobrarMesa.addEventListener('click', async () => {
            if (!mesaSeleccionadaActual) return;
            const mesaID = mesaSeleccionadaActual.mesaID || mesaSeleccionadaActual.id;
            
            try {
                const response = await fetch(`https://localhost:7081/api/Ventas/activa/mesa/${mesaID}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token_mimi') || localStorage.getItem('authToken') || ''}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'No hay consumo activo para esta mesa.');
                }
                
                const data = await response.json();
                if (data.success && data.ventaID) {
                    window.location.href = `../facturas/Factura.html?cobrarVentaId=${data.ventaID}`;
                } else {
                    alert('No se encontró una orden activa para esta mesa.');
                }
            } catch (error) {
                alert(`⚠️ Error: ${error.message}`);
            }
        });
    }

    // ==========================================
    // COMPORTAMIENTO CONFIGURACIÓN GENERAL MESAS
    // ==========================================
    if (btnAbrirAgregar) {
        btnAbrirAgregar.addEventListener('click', (e) => {
            e.preventDefault();
            modalTitulo.innerText = "Registrar Nueva Mesa";
            document.getElementById('nuevo-id-mesa').value = ""; 
            formAgregarMesa.reset();
            modalAgregar.style.display = 'flex';
        });
    }

    if (btnCancelarAgregar) {
        btnCancelarAgregar.addEventListener('click', (e) => {
            e.preventDefault();
            modalAgregar.style.display = 'none';
            formAgregarMesa.reset();
        });
    }

    if (formAgregarMesa) {
        formAgregarMesa.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idMesa = document.getElementById('nuevo-id-mesa').value;
            const numeroMesa = parseInt(document.getElementById('nuevo-num-mesa').value);
            const capacidad = parseInt(document.getElementById('nuevo-cap-mesa').value);
            const ubicacion = document.getElementById('nuevo-ubicacion-mesa').value;

            const payload = { numeroMesa, capacidad, ubicacion, estado: 'Disponible' };

            try {
                if (idMesa) {
                    await actualizarMesa(idMesa, payload);
                    alert('¡Mesa actualizada correctamente!');
                } else {
                    await insertarMesa(payload);
                    alert('¡Mesa registrada correctamente!');
                }
                modalAgregar.style.display = 'none';
                formAgregarMesa.reset();
                await cargarMapaMesas(contenedorGrid); 
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // ==========================================
    // ACCIONES: AGREGAR PEDIDO POR MESERO (MODAL)
    // ==========================================
    if (btnAgregarPedidoMesa) {
        btnAgregarPedidoMesa.addEventListener('click', async () => {
            if (!mesaSeleccionadaActual) return;
            const estado = mesaSeleccionadaActual.estado ? mesaSeleccionadaActual.estado.toUpperCase() : 'DISPONIBLE';
            
            if (estado === 'DISPONIBLE') {
                if (confirm('La mesa está libre. ¿Deseas iniciar una nueva sesión para esta mesa?')) {
                    try {
                        const res = await sesionService.iniciarSesion(mesaSeleccionadaActual.id || mesaSeleccionadaActual.mesaID);
                        if (res.success) {
                            mesaSeleccionadaActual.sesionID = res.data.sesionID;
                            mesaSeleccionadaActual.estado = 'Ocupada';
                            abrirOrdenacionModal();
                        } else {
                            alert('No se pudo iniciar la sesión: ' + res.message);
                        }
                    } catch (err) {
                        alert('Error al iniciar sesión: ' + err.message);
                    }
                }
            } else {
                abrirOrdenacionModal();
            }
        });
    }

    if (btnAgregarPlatilloLista) {
        btnAgregarPlatilloLista.addEventListener('click', () => {
            const platilloId = selectPlatilloPedido.value;
            if (!platilloId) {
                alert('Debe seleccionar un platillo.');
                return;
            }
            
            const cantidad = parseInt(cantPlatilloPedido.value) || 1;
            if (cantidad < 1) {
                alert('La cantidad debe ser al menos 1.');
                return;
            }
            
            const opt = selectPlatilloPedido.options[selectPlatilloPedido.selectedIndex];
            const nombre = opt.dataset.nombre;
            const precioUnitario = parseFloat(opt.dataset.precio);
            const comentario = comentarioPlatilloPedido.value.trim();
            
            // Buscar si ya existe para acumular
            const existente = listaPlatillosPedidoTemp.find(item => item.platilloID === parseInt(platilloId) && item.comentario === comentario);
            if (existente) {
                existente.cantidad += cantidad;
                existente.total = existente.cantidad * existente.precioUnitario;
            } else {
                listaPlatillosPedidoTemp.push({
                    platilloID: parseInt(platilloId),
                    nombre: nombre,
                    cantidad: cantidad,
                    precioUnitario: precioUnitario,
                    comentario: comentario,
                    total: cantidad * precioUnitario
                });
            }
            
            // Limpiar campos
            selectPlatilloPedido.value = '';
            cantPlatilloPedido.value = '1';
            comentarioPlatilloPedido.value = '';
            
            renderListaTemp();
        });
    }

    if (btnCancelarPedido) {
        btnCancelarPedido.addEventListener('click', () => {
            modalAgregarPedido.style.display = 'none';
            listaPlatillosPedidoTemp = [];
        });
    }

    if (btnConfirmarPedidoMesero) {
        btnConfirmarPedidoMesero.addEventListener('click', async () => {
            if (listaPlatillosPedidoTemp.length === 0) {
                alert('Debe agregar al menos un platillo al pedido.');
                return;
            }
            
            const total = listaPlatillosPedidoTemp.reduce((sum, item) => sum + item.total, 0);
            
            // Construir payload
            const ventaData = {
                mesaID: mesaSeleccionadaActual.id || mesaSeleccionadaActual.mesaID,
                sesionID: mesaSeleccionadaActual.sesionID || mesaSeleccionadaActual.sesionId || mesaSeleccionadaActual.SesionID,
                usuarioID: obtenerUsuarioIdActual() || 1,
                clienteID: null,
                total: total,
                tipoPedido: 'Mesero',
                detalleVenta: listaPlatillosPedidoTemp.map(item => ({
                    platilloID: item.platilloID,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                    comentario: item.comentario
                }))
            };
            
            btnConfirmarPedidoMesero.disabled = true;
            btnConfirmarPedidoMesero.innerText = 'Enviando...';
            
            try {
                const result = await ventaService.registrarVenta(ventaData);
                if (result.success) {
                    alert('✅ ¡Pedido enviado correctamente!');
                    modalAgregarPedido.style.display = 'none';
                    modalDetalle.style.display = 'none';
                    listaPlatillosPedidoTemp = [];
                    await cargarMapaMesas(contenedorGrid);
                } else {
                    alert('❌ Error al registrar pedido: ' + (result.message || 'Desconocido'));
                }
            } catch (err) {
                alert('❌ Error al enviar pedido: ' + err.message);
            } finally {
                btnConfirmarPedidoMesero.disabled = false;
                btnConfirmarPedidoMesero.innerText = 'Confirmar Pedido';
            }
        });
    }

    await cargarMapaMesas(contenedorGrid);
}

async function cargarMapaMesas(contenedorGrid) {
    try {
        contenedorGrid.innerHTML = '<p style="padding: 20px;">Cargando mesas del salón...</p>';
        listaCompletaMesas = await obtenerMesas(); // Guardamos en la caché global

        if (listaCompletaMesas.length === 0) {
            contenedorGrid.innerHTML = '<p style="padding: 20px;">No hay mesas registradas.</p>';
            return;
        }

        contenedorGrid.innerHTML = '';

        listaCompletaMesas.forEach(mesa => {
            const estadoNormalizado = mesa.estado ? mesa.estado.toLowerCase() : 'disponible';
            const estadoClase = estadoNormalizado === 'disponible' ? 'disponible' : 'ocupada';
            const tagTexto = estadoNormalizado === 'disponible' ? 'LIBRE' : 'OCUPADA';

            const tarjetaMesa = document.createElement('div');
            tarjetaMesa.className = `mesa ${estadoClase}`;
            tarjetaMesa.dataset.mesaId = mesa.id || mesa.mesaID;

            tarjetaMesa.innerHTML = `
                <div class="numero-mesa">${mesa.numeroMesa}</div> 
                <div class="nombre-mesa">${mesa.ubicacion || 'Sin Área'}</div>
                <div class="tag-estado">${tagTexto}</div>
                <p class="capacidad-text">Capacidad: ${mesa.capacidad} pers.</p>
                
                <div class="acciones-mesa-card">
                    <button class="btn-editar-rapido" title="Editar datos">✏️</button>
                    <button class="btn-eliminar-rapido" title="Eliminar mesa">🗑️</button>
                </div>
            `;

            tarjetaMesa.querySelector('.btn-editar-rapido').addEventListener('click', (e) => {
                e.stopPropagation();
                prepararEdicionMesa(mesa);
            });

            tarjetaMesa.querySelector('.btn-eliminar-rapido').addEventListener('click', (e) => {
                e.stopPropagation();
                ejecutarBajaMesa(mesa.id || mesa.mesaID, mesa.numeroMesa);
            });

            tarjetaMesa.addEventListener('click', () => {
                abrirDetalleMesa(mesa);
            });

            contenedorGrid.appendChild(tarjetaMesa);
        });

    } catch (error) {
        contenedorGrid.innerHTML = `<div style="color: #dc3545; padding: 20px;">⚠️ ${error.message}</div>`;
    }
}

function prepararEdicionMesa(mesa) {
    modalTitulo.innerText = `Editar Mesa ${mesa.numeroMesa}`;
    document.getElementById('nuevo-id-mesa').value = mesa.id || mesa.mesaID;
    document.getElementById('nuevo-num-mesa').value = mesa.numeroMesa;
    document.getElementById('nuevo-cap-mesa').value = mesa.capacidad;
    document.getElementById('nuevo-ubicacion-mesa').value = mesa.ubicacion;
    modalAgregar.style.display = 'flex';
}

async function ejecutarBajaMesa(id, numero) {
    if (confirm(`¿Estás completamente seguro de eliminar la Mesa número ${numero}?`)) {
        try {
            await eliminarMesa(id);
            alert('Mesa removida con éxito.');
            await cargarMapaMesas(contenedorGrid); 
        } catch (error) {
            alert(error.message);
        }
    }
}

async function abrirDetalleMesa(mesa) {
    if (!modalDetalle) return;
    mesaSeleccionadaActual = mesa; // Fijamos el contexto de operación

    document.getElementById('detalle-titulo-mesa').innerText = `🪑 Mesa ${mesa.numeroMesa}`;
    const badgeEstado = document.getElementById('detalle-badge-estado');
    
    const estado = mesa.estado ? mesa.estado.toUpperCase() : 'DISPONIBLE';
    badgeEstado.innerText = estado;
    badgeEstado.className = `tag-estado ${estado.toLowerCase() === 'disponible' ? 'disponible' : 'ocupada'}`;
    
    // Bloquear o desbloquear controles si la mesa está libre o sin consumo activo
    const btnAbrirCambio = document.getElementById('btn-abrir-cambio');
    const btnConfirmarEntrega = document.getElementById('btn-confirmar-entrega');
    const btnCobrarMesa = document.getElementById('btn-cobrar-mesa');
    
    if (estado === 'DISPONIBLE') {
        if(btnAbrirCambio) btnAbrirCambio.style.display = 'none';
        if(btnConfirmarEntrega) btnConfirmarEntrega.style.display = 'none';
        if(btnCobrarMesa) btnCobrarMesa.style.display = 'none';
        document.getElementById('lista-pedidos-ready').innerHTML = '<li><i>Sin pedidos activos</i></li>';
        document.getElementById('lista-pedidos-kitchen').innerHTML = '<li><i>Sin pedidos activos</i></li>';
        document.getElementById('cant-ready').innerText = '0';
        document.getElementById('cant-kitchen').innerText = '0';
        idsPedidosReadyActuales = [];
    } else {
        if(btnAbrirCambio) btnAbrirCambio.style.display = 'inline-block';
        if(btnConfirmarEntrega) btnConfirmarEntrega.style.display = 'inline-block';
        if(btnCobrarMesa) btnCobrarMesa.style.display = 'inline-block';
        
        await cargarPedidosRealesMesa(mesa);
    }

    modalDetalle.style.display = 'flex';
}

async function cargarPedidosRealesMesa(mesa) {
    const mesaID = mesa.id || mesa.mesaID;
    
    document.getElementById('lista-pedidos-ready').innerHTML = '<li><i>Cargando pedidos...</i></li>';
    document.getElementById('lista-pedidos-kitchen').innerHTML = '<li><i>Cargando pedidos...</i></li>';
    document.getElementById('cant-ready').innerText = '0';
    document.getElementById('cant-kitchen').innerText = '0';
    idsPedidosReadyActuales = [];
    
    try {
        const response = await fetch(`https://localhost:7081/api/Ventas/activa/mesa/${mesaID}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token_mimi') || localStorage.getItem('authToken') || ''}`
            }
        });
        
        if (!response.ok) {
            document.getElementById('lista-pedidos-ready').innerHTML = '<li><i>Sin pedidos activos</i></li>';
            document.getElementById('lista-pedidos-kitchen').innerHTML = '<li><i>Sin pedidos activos</i></li>';
            return;
        }
        
        const data = await response.json();
        if (data.success && data.ventaID) {
            const ventaRes = await ventaService.obtenerPorId(data.ventaID);
            if (ventaRes.success && ventaRes.data) {
                const venta = ventaRes.data;
                
                if (!mesaSeleccionadaActual.sesionID && venta.sesionID) {
                    mesaSeleccionadaActual.sesionID = venta.sesionID;
                }
                
                const detalles = venta.detalles; // Array de DetalleVenta
                
                const readyItems = [];
                const kitchenItems = [];
                
                detalles.forEach(det => {
                    const estado = det.estadoCocinero;
                    if (estado === 'Listo') {
                        readyItems.push(det);
                        idsPedidosReadyActuales.push(det.detalleVentaID);
                    } else if (estado === 'Pendiente' || estado === 'Preparando') {
                        kitchenItems.push(det);
                    }
                });
                
                // Renderizar listados
                const ulReady = document.getElementById('lista-pedidos-ready');
                if (readyItems.length === 0) {
                    ulReady.innerHTML = '<li><i>Sin platillos listos para servir</i></li>';
                } else {
                    ulReady.innerHTML = '';
                    readyItems.forEach(det => {
                        const li = document.createElement('li');
                        let commentText = det.personalizacionTexto;
                        if (commentText) {
                            commentText = commentText.replace(/\n/g, ', ');
                        }
                        li.innerHTML = `🍗 ${det.cantidad}x ${det.nombreProducto} ${commentText ? `<div style="font-size: 0.85rem; color: #ff6b00; margin-left: 20px; font-style: italic;">• ${commentText}</div>` : ''}`;
                        ulReady.appendChild(li);
                    });
                }
                document.getElementById('cant-ready').innerText = readyItems.length;
                
                const ulKitchen = document.getElementById('lista-pedidos-kitchen');
                if (kitchenItems.length === 0) {
                    ulKitchen.innerHTML = '<li><i>Sin platillos en cocina</i></li>';
                } else {
                    ulKitchen.innerHTML = '';
                    kitchenItems.forEach(det => {
                        const li = document.createElement('li');
                        let commentText = det.personalizacionTexto;
                        if (commentText) {
                            commentText = commentText.replace(/\n/g, ', ');
                        }
                        li.innerHTML = `🍲 ${det.cantidad}x ${det.nombreProducto} (${det.estadoCocinero || 'Pendiente'}) ${commentText ? `<div style="font-size: 0.85rem; color: #ff6b00; margin-left: 20px; font-style: italic;">• ${commentText}</div>` : ''}`;
                        ulKitchen.appendChild(li);
                    });
                }
                document.getElementById('cant-kitchen').innerText = kitchenItems.length;
            } else {
                document.getElementById('lista-pedidos-ready').innerHTML = '<li><i>Error al obtener detalles</i></li>';
                document.getElementById('lista-pedidos-kitchen').innerHTML = '<li><i>Error al obtener detalles</i></li>';
            }
        } else {
            document.getElementById('lista-pedidos-ready').innerHTML = '<li><i>Sin pedidos activos</i></li>';
            document.getElementById('lista-pedidos-kitchen').innerHTML = '<li><i>Sin pedidos activos</i></li>';
        }
    } catch (error) {
        console.error('Error al cargar pedidos reales:', error);
        document.getElementById('lista-pedidos-ready').innerHTML = `<li><i style="color: red;">Error: ${error.message}</i></li>`;
        document.getElementById('lista-pedidos-kitchen').innerHTML = `<li><i style="color: red;">Error: ${error.message}</i></li>`;
    }
}

async function abrirOrdenacionModal() {
    document.getElementById('agregar-pedido-titulo').innerText = `🛒 Agregar Platillos - Mesa ${mesaSeleccionadaActual.numeroMesa}`;
    listaPlatillosPedidoTemp = [];
    renderListaTemp();
    
    // Load platillos if not already loaded
    if (todosLosPlatillos.length === 0) {
        try {
            todosLosPlatillos = await obtenerPlatillos();
            selectPlatilloPedido.innerHTML = '<option value="">-- Seleccione un Platillo --</option>';
            todosLosPlatillos.forEach(p => {
                if (p.activo !== false) {
                    const opt = document.createElement('option');
                    opt.value = p.platilloID;
                    opt.textContent = `${p.nombre} (${formatearMoneda(p.precio)})`;
                    opt.dataset.precio = p.precio;
                    opt.dataset.nombre = p.nombre;
                    selectPlatilloPedido.appendChild(opt);
                }
            });
        } catch (error) {
            console.error('Error al cargar platillos:', error);
            alert('No se pudieron cargar los platillos de la base de datos.');
            return;
        }
    }
    
    modalAgregarPedido.style.display = 'flex';
}

function renderListaTemp() {
    if (!tbodyPlatillosAgregados) return;
    
    if (listaPlatillosPedidoTemp.length === 0) {
        tbodyPlatillosAgregados.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 10px; color: #888; font-style: italic;">No hay platillos en la lista</td>
            </tr>
        `;
        totalPedidoAgregar.innerText = formatearMoneda(0);
        return;
    }
    
    tbodyPlatillosAgregados.innerHTML = '';
    let total = 0;
    
    listaPlatillosPedidoTemp.forEach((item, index) => {
        total += item.total;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 6px;">
                <strong>${item.nombre}</strong>
                ${item.comentario ? `<div style="font-size: 0.8rem; color: #ff6b00; font-style: italic;">• ${item.comentario}</div>` : ''}
            </td>
            <td style="padding: 6px; text-align: center;">${item.cantidad}</td>
            <td style="padding: 6px; text-align: right;">${formatearMoneda(item.precioUnitario)}</td>
            <td style="padding: 6px; text-align: right; font-weight: bold;">${formatearMoneda(item.total)}</td>
            <td style="padding: 6px; text-align: center;">
                <button type="button" class="btn-eliminar-item-temp" data-index="${index}" style="background: none; border: none; color: #e63946; cursor: pointer; font-size: 1.1rem; padding: 0 5px;" title="Eliminar">❌</button>
            </td>
        `;
        
        row.querySelector('.btn-eliminar-item-temp').addEventListener('click', () => {
            listaPlatillosPedidoTemp.splice(index, 1);
            renderListaTemp();
        });
        
        tbodyPlatillosAgregados.appendChild(row);
    });
    
    totalPedidoAgregar.innerText = formatearMoneda(total);
}

function formatearMoneda(valor) {
    return `C$${Number(valor).toFixed(2)}`;
}