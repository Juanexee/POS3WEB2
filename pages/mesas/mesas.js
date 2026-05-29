import { obtenerMesas, insertarMesa, actualizarMesa, eliminarMesa } from '../../shared/services/mesaService.js';

// VARIABLES GLOBALES
let contenedorGrid;
let modalAgregar;
let formAgregarMesa;
let modalTitulo;

// EN LUGAR DE ESPERAR EL DOMContentLoaded, EJECUTAMOS DIRECTAMENTE
inicializarModuloMesas();

async function inicializarModuloMesas() {
    contenedorGrid = document.getElementById('contenedor-plano-mesas');
    modalAgregar = document.getElementById('modal-agregar-mesa');
    formAgregarMesa = document.getElementById('form-agregar-mesa');
    modalTitulo = document.getElementById('modal-titulo-mesa');
    
    const btnAbrirAgregar = document.getElementById('btn-abrir-agregar');
    
    // Buscamos TODOS los botones que tengan esta clase o ID para cerrar el modal de agregar
    const btnCancelarAgregar = document.getElementById('btn-cancelar-agregar');

    if (!contenedorGrid) return;

    // Abrir para NUEVA MESA (Limpio)
    if (btnAbrirAgregar) {
        btnAbrirAgregar.addEventListener('click', (e) => {
            e.preventDefault(); // Evitamos cualquier comportamiento extraño
            modalTitulo.innerText = "Registrar Nueva Mesa";
            document.getElementById('nuevo-id-mesa').value = ""; // ID vacío = INSERT
            formAgregarMesa.reset();
            modalAgregar.style.display = 'flex'; // Cambiado a flex para centrar el modal
        });
    }

    if (btnCancelarAgregar) {
        btnCancelarAgregar.addEventListener('click', (e) => {
            e.preventDefault();
            modalAgregar.style.display = 'none';
            formAgregarMesa.reset();
        });
    }

    // El resto de tus manejadores de Submit y CargarMapa se quedan igual...
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
                cargarMapaMesas(contenedorGrid); 
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
        const listaMesas = await obtenerMesas();

        if (listaMesas.length === 0) {
            contenedorGrid.innerHTML = '<p style="padding: 20px;">No hay mesas registradas.</p>';
            return;
        }

        contenedorGrid.innerHTML = '';

        listaMesas.forEach(mesa => {
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
            cargarMapaMesas(contenedorGrid); 
        } catch (error) {
            alert(error.message);
        }
    }
}

function abrirDetalleMesa(mesa) {
    const modalDetalle = document.getElementById('modal-detalle-mesa');
    if (!modalDetalle) return;
    document.getElementById('detalle-titulo-mesa').innerText = `🪑 Mesa ${mesa.numeroMesa}`;
    const badgeEstado = document.getElementById('detalle-badge-estado');
    badgeEstado.innerText = mesa.estado.toUpperCase();
    badgeEstado.className = `tag-estado ${mesa.estado.toLowerCase() === 'disponible' ? 'disponible' : 'ocupada'}`;
    modalDetalle.style.display = 'flex';
}