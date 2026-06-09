// pages/platillos/platillos.js

import { 
    obtenerPlatillos, 
    insertarPlatillo, 
    actualizarPlatillo,
    eliminarPlatillo
} from '../../shared/services/platilloService.js';

import { obtenerCategorias } from '../../shared/services/categoriaService.js';

// Elementos DOM
let tablaCuerpo;
let modalPlatillo;
let formPlatillo;
let inputId;
let inputNombre;
let inputPrecio;
let inputDescripcion;
let selectCategoria;
let btnAgregar;
let inputBuscar;
let btnCancelar;

let listaPlatillosLocal = [];
let listaCategoriasLocal = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloPlatillos();
});

async function inicializarModuloPlatillos() {
    // Vincular elementos DOM
    tablaCuerpo = document.getElementById('cuerpo-tabla-platillos');
    modalPlatillo = document.getElementById('modal-platillo');
    formPlatillo = document.getElementById('form-platillo');
    inputId = document.getElementById('platillo-id');
    inputNombre = document.getElementById('nombre-platillo');
    inputPrecio = document.getElementById('precio-platillo');
    inputDescripcion = document.getElementById('descripcion-platillo');
    selectCategoria = document.getElementById('categoria-platillo');
    btnAgregar = document.getElementById('btn-agregar-platillo');
    inputBuscar = document.getElementById('input-buscar-platillo');
    btnCancelar = document.getElementById('btn-cancelar');

    // Eventos
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            formPlatillo.reset();
            inputId.value = '';
            modalPlatillo.style.display = 'flex';
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modalPlatillo.style.display = 'none';
        });
    }

    if (formPlatillo) {
        formPlatillo.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarPlatillo();
        });
    }

    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase();
            filtrarPlatillos(texto);
        });
    }

    // Cerrar modal al hacer clic fuera
    if (modalPlatillo) {
        modalPlatillo.addEventListener('click', (e) => {
            if (e.target === modalPlatillo) {
                modalPlatillo.style.display = 'none';
            }
        });
    }

    // Cargar datos
    await cargarCategorias();
    await cargarPlatillos();
}

async function cargarCategorias() {
    try {
        listaCategoriasLocal = await obtenerCategorias();
        
        selectCategoria.innerHTML = '<option value="">-- Seleccione una categoría --</option>';
        listaCategoriasLocal.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.categoriaID;
            option.textContent = cat.nombre;
            selectCategoria.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

async function cargarPlatillos() {
    if (!tablaCuerpo) return;
    
    tablaCuerpo.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando platillos...</td></tr>';
    
    try {
        const result = await obtenerPlatillos();
        listaPlatillosLocal = result;
        renderizarTabla(listaPlatillosLocal);
    } catch (error) {
        console.error('Error cargando platillos:', error);
        tablaCuerpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#dc3545;">⚠️ ${error.message}</td></tr>`;
    }
}

function renderizarTabla(platillos) {
    if (!tablaCuerpo) return;
    
    tablaCuerpo.innerHTML = '';
    
    if (platillos.length === 0) {
        tablaCuerpo.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay platillos registrados</td></tr>';
        return;
    }
    
    platillos.forEach((platillo, index) => {
        const fila = document.createElement('tr');
        
        const categoria = listaCategoriasLocal.find(c => c.categoriaID === platillo.categoriaID);
        const nombreCategoria = categoria ? categoria.nombre : 'Sin categoría';
        
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${platillo.nombre}</strong></td>
            <td>${platillo.descripcion || '-'}</td>
            <td><strong>C$${Number(platillo.precio).toFixed(2)}</strong></td>
            <td>${nombreCategoria}</td>
            <td>
                <span class="estado-badge ${platillo.disponible ? 'estado-activo' : 'estado-inactivo'}">
                    ${platillo.disponible ? 'Disponible' : 'Agotado'}
                </span>
            </td>
            <td>
                <button class="btn-edit" data-id="${platillo.platilloID}">✏️ Editar</button>
                <button class="btn-delete" data-id="${platillo.platilloID}">🗑️ Eliminar</button>
             </td>
        `;
        
        tablaCuerpo.appendChild(fila);
    });
    
    // Eventos de botones
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const platillo = listaPlatillosLocal.find(p => p.platilloID === id);
            if (platillo) editarPlatillo(platillo);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id);
            const platillo = listaPlatillosLocal.find(p => p.platilloID === id);
            if (platillo && confirm(`¿Eliminar "${platillo.nombre}"?`)) {
                await manejarEliminarPlatillo(platillo.platilloID);
                await cargarPlatillos();
            }
        });
    });
}

function filtrarPlatillos(texto) {
    const filtrados = listaPlatillosLocal.filter(p => 
        p.nombre.toLowerCase().includes(texto) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(texto))
    );
    renderizarTabla(filtrados);
}

function editarPlatillo(platillo) {
    inputId.value = platillo.platilloID;
    inputNombre.value = platillo.nombre;
    inputPrecio.value = platillo.precio;
    inputDescripcion.value = platillo.descripcion || '';
    selectCategoria.value = platillo.categoriaID;
    modalPlatillo.style.display = 'flex';
}

async function guardarPlatillo() {
    const id = inputId.value;
    const payload = {
        nombre: inputNombre.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        precio: parseFloat(inputPrecio.value),
        categoriaID: parseInt(selectCategoria.value)
    };
    
    if (!payload.nombre) {
        alert('El nombre del platillo es requerido');
        return;
    }
    
    if (isNaN(payload.precio) || payload.precio <= 0) {
        alert('El precio debe ser mayor a 0');
        return;
    }
    
    if (!payload.categoriaID) {
        alert('Debe seleccionar una categoría');
        return;
    }
    
    try {
        if (id) {
            await actualizarPlatillo(id, payload);
            alert('Platillo actualizado correctamente');
        } else {
            await insertarPlatillo(payload);
            alert('Platillo guardado correctamente');
        }
        
        modalPlatillo.style.display = 'none';
        await cargarPlatillos();
        
    } catch (error) {
        console.error('Error guardando platillo:', error);
        alert(`Error: ${error.message}`);
    }
}

async function manejarEliminarPlatillo(id) {
    try {
        await eliminarPlatillo(id, false);
        alert('Platillo eliminado correctamente');
    } catch (error) {
        console.error('Error eliminando platillo:', error);
        alert(`Error: ${error.message}`);
    }
}