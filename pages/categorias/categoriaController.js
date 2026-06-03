// categoriaController.js
import { 
    obtenerCategorias,
    insertarCategoria, 
    actualizarCategoria,
    eliminarCategoria 
} from '../../shared/services/categoriaService.js';

let tablaCuerpo, modalCategoria, formCategoria, inputId, inputNombre, btnAbrirAgregar, inputBuscar;
let listaCompletaCategorias = []; 

document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloCategorias();
});

function inicializarModuloCategorias() {
    tablaCuerpo = document.querySelector('#tabla-categorias tbody') || document.querySelector('table tbody');
    modalCategoria = document.getElementById('modal-categoria');
    formCategoria = document.getElementById('form-categoria');
    inputId = document.getElementById('categoria-id');
    inputNombre = document.getElementById('nombre-categoria');
    btnAbrirAgregar = document.getElementById('btn-agregar-platillo'); 
    inputBuscar = document.querySelector('.input-busqueda input') || document.getElementById('input-buscar-categoria');

    // Abrir modal para insertar (+)
    if (btnAbrirAgregar) {
        btnAbrirAgregar.addEventListener('click', (e) => {
            e.preventDefault();
            if (formCategoria) formCategoria.reset();
            if (inputId) inputId.value = ""; // Vacío indica que es una nueva inserción
            const tituloModal = modalCategoria.querySelector('.modal-header h3');
            if (tituloModal) tituloModal.textContent = "Agregar Categoría";
            modalCategoria.style.display = 'flex';
        });
    }

    // Botón Salir del modal
    const btnSalir = document.querySelector('.btn-salir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            modalCategoria.style.display = 'none';
        });
    }

    // Manejo del Submit del Formulario (Guardar / Modificar)
    if (formCategoria) {
        formCategoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = inputId.value;
            const payload = {
                nombre: inputNombre.value.trim()
            };

            try {
                if (id) {
                    // Si hay un ID, se ejecuta la actualización
                    await actualizarCategoria(id, payload);
                    alert('Categoría actualizada con éxito.');
                } else {
                    // Si no hay ID, se registra una nueva
                    await insertarCategoria(payload);
                    alert('Categoría guardada con éxito.');
                }
                modalCategoria.style.display = 'none';
                cargarDatosEnTabla(); // Recargar la lista
            } catch (error) {
                alert(`⚠️ Error al procesar la operación: ${error.message}`);
            }
        });
    }

    // Evento de búsqueda en tiempo real
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            filtrarYMostrarTablas(e.target.value.toLowerCase().trim());
        });
    }

    // Cargar los datos iniciales
    cargarDatosEnTabla();
}

async function cargarDatosEnTabla() {
    try {
        if (tablaCuerpo) {
            tablaCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center;">Cargando categorías...</td></tr>';
        }
        listaCompletaCategorias = await obtenerCategorias();
        renderizarFilas(listaCompletaCategorias);
    } catch (error) {
        console.error(error);
        if (tablaCuerpo) {
            tablaCuerpo.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#dc3545;">⚠️ ${error.message}</td></tr>`;
        }
    }
}

function renderizarFilas(categorias) {
    if (!tablaCuerpo) return;
    tablaCuerpo.innerHTML = '';

    if (categorias.length === 0) {
        tablaCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center;">No se encontraron categorías.</td></tr>';
        return;
    }

    categorias.forEach((cat, index) => {
        const currentID = cat.categoriaID || cat.id || cat.CategoriaID;
        const currentNombre = cat.nombre || cat.Nombre;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${currentNombre}</td>
            <td style="text-align: right; padding-right: 30px;">
                <button class="btn-edit" title="Editar" style="margin-right: 8px; cursor: pointer;">✏️</button>
                <button class="btn-delete" title="Eliminar" style="cursor: pointer;">🗑️</button>
            </td>
        `;

        // Evento Editar: Rellena el mismo modal con los datos existentes
        fila.querySelector('.btn-edit').addEventListener('click', () => {
            if (formCategoria) formCategoria.reset();
            inputId.value = currentID;
            inputNombre.value = currentNombre;
            
            const tituloModal = modalCategoria.querySelector('.modal-header h3');
            if (tituloModal) tituloModal.textContent = "Editar Categoría";
            
            modalCategoria.style.display = 'flex';
        });

        // Evento Eliminar directo al Backend
        fila.querySelector('.btn-delete').addEventListener('click', async () => {
            if (confirm(`¿Estás seguro que deseas eliminar o dar de baja la categoría "${currentNombre}"?`)) {
                try {
                    await eliminarCategoria(currentID);
                    alert('Operación procesada correctamente.');
                    cargarDatosEnTabla();
                } catch (error) {
                    alert(`⚠️ No se pudo eliminar: ${error.message}`);
                }
            }
        });

        tablaCuerpo.appendChild(fila);
    });
}

function filtrarYMostrarTablas(texto) {
    const filtradas = listaCompletaCategorias.filter(cat => {
        const nombre = (cat.nombre || cat.Nombre || '').toLowerCase();
        return nombre.includes(texto);
    });
    renderizarFilas(filtradas);
}