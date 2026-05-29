import { 
    obtenerMesas, 
    insertarMesa, 
    actualizarMesa, 
    eliminarMesa, 
    cambiarMesaService, 
    entregarPedidosService 
} from '../../shared/services/mesaService.js';

// VARIABLES GLOBALES
let contenedorGrid;
let modalAgregar;
let formAgregarMesa;
let modalTitulo;

// Nuevas variables para la gestión de pedidos y estados de sesión
let modalDetalle;
let modalCambioMesa;
let mesaSeleccionadaActual = null; // Guardará el objeto completo de la mesa abierta
let listaCompletaMesas = []; // Caché local para filtrar destinos del select

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

            // =========================================================================
            // PLAN DE PRUEBA: IDs de pedidos ficticios para simular el lote de la base de datos
            // Reemplaza estos números por IDs reales de tu tabla [Pedidos] que estén en estado 'Listo'
            // =========================================================================
            const idsPedidosAEntregar = [1001, 1002]; 

            // Invocamos al servicio corregido pasando el Array
            const respuesta = await entregarPedidosService(idsPedidosAEntregar);
            
            alert(`✅ ${respuesta.message}`); // Muestra el mensaje de éxito de tu capa de negocio
            modalDetalle.style.display = 'none';
            await cargarMapaMesas(contenedorGrid);

        } catch (error) {
            // Ahora este catch atrapará correctamente si la API te dice "Denegado..." debido a tus estados en BD
            alert(`⚠️ Error en entrega: ${error.message}`);
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

function abrirDetalleMesa(mesa) {
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
    
    if (estado === 'DISPONIBLE') {
        if(btnAbrirCambio) btnAbrirCambio.style.display = 'none';
        if(btnConfirmarEntrega) btnConfirmarEntrega.style.display = 'none';
        document.getElementById('lista-pedidos-ready').innerHTML = '<li><i>Sin pedidos activos</i></li>';
        document.getElementById('lista-pedidos-kitchen').innerHTML = '<li><i>Sin pedidos activos</i></li>';
        document.getElementById('cant-ready').innerText = '0';
        document.getElementById('cant-kitchen').innerText = '0';
    } else {
        if(btnAbrirCambio) btnAbrirCambio.style.display = 'inline-block';
        if(btnConfirmarEntrega) btnConfirmarEntrega.style.display = 'inline-block';
        
        inyectarPedidosSimulados();
    }

    modalDetalle.style.display = 'flex';
}

function inyectarPedidosSimulados() {
    document.getElementById('cant-ready').innerText = '2';
    document.getElementById('lista-pedidos-ready').innerHTML = `
        <li>🍗 1x Pollo Asado al Carbón</li>
        <li>🍹 2x Tiste en Jícara</li>
    `;
    
    document.getElementById('cant-kitchen').innerText = '1';
    document.getElementById('lista-pedidos-kitchen').innerHTML = `
        <li>🍲 1x Sopa de Albóndigas (Marchando...)</li>
    `;
}