// pages/categorias/categoriaController.js

import { 
    obtenerCategorias,
    insertarCategoria, 
    actualizarCategoria,
    eliminarCategoria 
} from '../../shared/services/categoriaService.js';

// Variables globales
let tablaCuerpo;
let modalCategoria;
let formCategoria;
let inputId;
let inputNombre;
let btnAbrirAgregar;
let inputBuscar;
let listaCompletaCategorias = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloCategorias();
});

function inicializarModuloCategorias() {
    // Obtener elementos del DOM
    tablaCuerpo = document.querySelector('#tabla-categorias tbody');
    modalCategoria = document.getElementById('modal-categoria');
    formCategoria = document.getElementById('form-categoria');
    inputId = document.getElementById('categoria-id');
    inputNombre = document.getElementById('nombre-categoria');
    btnAbrirAgregar = document.getElementById('btn-agregar-platillo');
    inputBuscar = document.querySelector('.input-busqueda input') || document.getElementById('input-buscar-categoria');

    // Evento: Abrir modal para agregar
    if (btnAbrirAgregar) {
        btnAbrirAgregar.addEventListener('click', (e) => {
            e.preventDefault();
            if (formCategoria) formCategoria.reset();
            if (inputId) inputId.value = "";
            
            const tituloModal = modalCategoria.querySelector('.modal-header h3');
            if (tituloModal) tituloModal.textContent = "Agregar Categoría";
            
            modalCategoria.style.display = 'flex';
        });
    }

    // Evento: Botón Salir del modal
    const btnSalir = modalCategoria?.querySelector('.btn-salir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            modalCategoria.style.display = 'none';
        });
    }

    // Evento: Submit del formulario
    if (formCategoria) {
        formCategoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = inputId?.value;
            const payload = {
                nombre: inputNombre?.value.trim()
            };

            if (!payload.nombre) {
                alert('El nombre de la categoría es requerido');
                return;
            }

            try {
                if (id) {
                    await actualizarCategoria(id, payload);
                    alert('✅ Categoría actualizada con éxito.');
                } else {
                    await insertarCategoria(payload);
                    alert('✅ Categoría guardada con éxito.');
                }
                
                modalCategoria.style.display = 'none';
                await cargarDatosEnTabla();
                
            } catch (error) {
                console.error('Error:', error);
                alert(`⚠️ Error al procesar la operación: ${error.message}`);
            }
        });
    }

    // Evento: Cerrar modal al hacer clic fuera
    if (modalCategoria) {
        modalCategoria.addEventListener('click', (e) => {
            if (e.target === modalCategoria) {
                modalCategoria.style.display = 'none';
            }
        });
    }

    // Evento: Búsqueda en tiempo real
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase().trim();
            filtrarYMostrarTablas(texto);
        });
    }

    // Cargar datos iniciales
    cargarDatosEnTabla();
}

async function cargarDatosEnTabla() {
    if (!tablaCuerpo) return;
    
    try {
        tablaCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center;">Cargando categorías...</td></tr>';
        
        listaCompletaCategorias = await obtenerCategorias();
        renderizarFilas(listaCompletaCategorias);
        
    } catch (error) {
        console.error('Error cargando categorías:', error);
        tablaCuerpo.innerHTML = `<td><td colspan="3" style="text-align:center; color:#dc3545;">⚠️ ${error.message}</td></tr>`;
    }
}

function renderizarFilas(categorias) {
    if (!tablaCuerpo) return;
    tablaCuerpo.innerHTML = '';

    if (!categorias || categorias.length === 0) {
        tablaCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center;">No se encontraron categorías.</td></tr>';
        return;
    }

    categorias.forEach((cat, index) => {
        const currentID = cat.categoriaID;
        const currentNombre = cat.nombre;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(currentNombre)}</td>
            <td style="text-align: right; padding-right: 30px;">
                <button class="btn-editar" data-id="${currentID}" data-nombre="${currentNombre}">✏️ Editar</button>
                <button class="btn-desactivar" data-id="${currentID}" data-nombre="${currentNombre}">🔒 Desactivar</button>
            </td>
        `;

        // Evento Editar
        const btnEdit = fila.querySelector('.btn-editar');
        btnEdit.addEventListener('click', () => {
            if (formCategoria) formCategoria.reset();
            if (inputId) inputId.value = currentID;
            if (inputNombre) inputNombre.value = currentNombre;
            
            const tituloModal = modalCategoria?.querySelector('.modal-header h3');
            if (tituloModal) tituloModal.textContent = "Editar Categoría";
            
            if (modalCategoria) modalCategoria.style.display = 'flex';
        });

        // Evento Eliminar
        const btnDelete = fila.querySelector('.btn-desactivar');
        btnDelete.addEventListener('click', async () => {
            if (confirm(`¿Estás seguro que deseas eliminar la categoría "${currentNombre}"?`)) {
                try {
                    await eliminarCategoria(currentID);
                    alert('✅ Categoría eliminada/desactivada correctamente.');
                    await cargarDatosEnTabla();
                } catch (error) {
                    console.error('Error:', error);
                    alert(`⚠️ No se pudo eliminar: ${error.message}`);
                }
            }
        });

        tablaCuerpo.appendChild(fila);
    });
}

function filtrarYMostrarTablas(texto) {
    if (!texto) {
        renderizarFilas(listaCompletaCategorias);
        return;
    }
    
    const filtradas = listaCompletaCategorias.filter(cat => 
        cat.nombre && cat.nombre.toLowerCase().includes(texto)
    );
    renderizarFilas(filtradas);
}

// Función para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}