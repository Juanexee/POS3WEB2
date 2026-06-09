// pages/Rol/Roles.js
import { 
    obtenerRoles, 
    crearRol, 
    actualizarRol, 
    desactivarRol 
} from '../../shared/services/rolService.js';

let listaCompletaRoles = [];
let currentPage = 1;
let itemsPerPage = 8;
let filtroTexto = '';

let tablaBody;
let modalRol;
let formRol;
let modalTitulo;
let btnCancelar;
let btnAbrirAgregar;
let inputBuscar;
let btnPrev, btnNext, infoPagina;

document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloRoles();
});

async function inicializarModuloRoles() {
    tablaBody = document.getElementById('tabla-roles-body');
    modalRol = document.getElementById('modal-rol');
    formRol = document.getElementById('form-rol');
    modalTitulo = document.getElementById('modal-titulo-rol');
    btnCancelar = document.getElementById('btn-cancelar');
    btnAbrirAgregar = document.getElementById('btn-abrir-agregar');
    inputBuscar = document.getElementById('input-buscar-rol');
    btnPrev = document.getElementById('btn-prev');
    btnNext = document.getElementById('btn-next');
    infoPagina = document.getElementById('info-pagina');

    if (btnAbrirAgregar) {
        btnAbrirAgregar.addEventListener('click', () => abrirModalAgregar());
    }
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => cerrarModal());
    }
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            filtroTexto = e.target.value.toLowerCase();
            currentPage = 1;
            renderizarTabla();
        });
    }
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderizarTabla();
            }
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentPage < totalPages()) {
                currentPage++;
                renderizarTabla();
            }
        });
    }
    if (formRol) {
        formRol.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarRol();
        });
    }

    await cargarRoles();
}

async function cargarRoles() {
    try {
        if (tablaBody) {
            tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando roles...</td></tr>';
        }
        listaCompletaRoles = await obtenerRoles();
        renderizarTabla();
    } catch (error) {
        console.error('Error cargando roles:', error);
        if (tablaBody) {
            tablaBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #dc3545;">⚠️ ${error.message}</td></tr>`;
        }
    }
}

function renderizarTabla() {
    if (!tablaBody) return;
    
    let datosFiltrados = [...listaCompletaRoles];
    if (filtroTexto) {
        datosFiltrados = datosFiltrados.filter(rol => 
            (rol.nombreRol && rol.nombreRol.toLowerCase().includes(filtroTexto)) ||
            (rol.descripcionRol && rol.descripcionRol.toLowerCase().includes(filtroTexto))
        );
    }
    
    const totalItems = datosFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const datosPagina = datosFiltrados.slice(startIndex, endIndex);
    
    if (infoPagina) {
        infoPagina.textContent = `Página ${currentPage} de ${totalPaginas || 1}`;
    }
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage === totalPaginas || totalPaginas === 0;
    
    if (datosPagina.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay roles registrados</td></tr>';
        return;
    }
    
    tablaBody.innerHTML = '';
    
    datosPagina.forEach((rol) => {
        const estadoTexto = rol.activo ? 'Activo' : 'Inactivo';
        const estadoClass = rol.activo ? 'estado-activo' : 'estado-inactivo';
        const descripcion = rol.descripcionRol || 'Sin descripción';
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${rol.rolID}</td>
            <td><strong>${escapeHtml(rol.nombreRol)}</strong></td>
            <td class="descripcion-cell">${escapeHtml(descripcion)}</td>
            <td><span class="estado-badge ${estadoClass}">${estadoTexto}</span></td>
            <td>
                <button class="btn-editar" data-id="${rol.rolID}">✏️ Editar</button>
                ${rol.activo ? `<button class="btn-desactivar" data-id="${rol.rolID}">🔒 Desactivar</button>` : ''}
            </td>
        `;
        
        tablaBody.appendChild(fila);
    });
    
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const rol = listaCompletaRoles.find(r => r.rolID === id);
            if (rol) abrirModalEditar(rol);
        });
    });
    
    document.querySelectorAll('.btn-desactivar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const rol = listaCompletaRoles.find(r => r.rolID === id);
            if (rol) confirmarDesactivar(rol);
        });
    });
}

function totalPages() {
    let datosFiltrados = [...listaCompletaRoles];
    if (filtroTexto) {
        datosFiltrados = datosFiltrados.filter(rol => 
            (rol.nombreRol && rol.nombreRol.toLowerCase().includes(filtroTexto)) ||
            (rol.descripcionRol && rol.descripcionRol.toLowerCase().includes(filtroTexto))
        );
    }
    return Math.ceil(datosFiltrados.length / itemsPerPage);
}

function abrirModalAgregar() {
    modalTitulo.textContent = '🔐 Registrar Nuevo Rol';
    document.getElementById('rol-id').value = '';
    formRol.reset();
    const campoEstado = document.getElementById('campo-estado-rol');
    if (campoEstado) campoEstado.style.display = 'none';
    modalRol.style.display = 'flex';
}

function abrirModalEditar(rol) {
    modalTitulo.textContent = `✏️ Editar Rol: ${rol.nombreRol}`;
    document.getElementById('rol-id').value = rol.rolID;
    document.getElementById('rol-nombre').value = rol.nombreRol || '';
    document.getElementById('rol-descripcion').value = rol.descripcionRol || '';
    const campoEstado = document.getElementById('campo-estado-rol');
    if (campoEstado) {
        campoEstado.style.display = 'block';
        const selectEstado = document.getElementById('rol-estado');
        if (selectEstado) selectEstado.value = rol.activo ? 'true' : 'false';
    }
    modalRol.style.display = 'flex';
}

function cerrarModal() {
    modalRol.style.display = 'none';
    formRol.reset();
}

async function guardarRol() {
    const id = document.getElementById('rol-id').value;
    const nombre = document.getElementById('rol-nombre').value.trim();
    const descripcion = document.getElementById('rol-descripcion').value.trim();
    
    if (!nombre) {
        alert('El nombre del rol es requerido');
        return;
    }
    
    try {
        if (id) {
            const estadoSelect = document.getElementById('rol-estado');
            const activo = estadoSelect ? estadoSelect.value === 'true' : true;
            await actualizarRol({
                rolID: parseInt(id),
                nombreRol: nombre,
                descripcionRol: descripcion,
                activo: activo
            });
            alert('Rol actualizado exitosamente');
        } else {
            await crearRol({
                nombreRol: nombre,
                descripcionRol: descripcion,
                activo: true
            });
            alert('Rol registrado exitosamente');
        }
        cerrarModal();
        await cargarRoles();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function confirmarDesactivar(rol) {
    if (confirm(`¿Desactivar el rol "${rol.nombreRol}"?`)) {
        try {
            await desactivarRol(rol.rolID);
            alert('Rol desactivado exitosamente');
            await cargarRoles();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}