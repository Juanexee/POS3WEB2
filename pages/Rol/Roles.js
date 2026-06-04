// pages/roles/Roles.js
import { 
    obtenerRoles, 
    crearRol, 
    actualizarRol, 
    desactivarRol 
} from '../../shared/services/rolService.js';

// VARIABLES GLOBALES
let listaCompletaRoles = [];
let currentPage = 1;
let itemsPerPage = 8;
let filtroTexto = '';

// Elementos DOM
let tablaBody;
let modalRol;
let formRol;
let modalTitulo;
let btnCancelar;
let btnAbrirAgregar;
let inputBuscar;
let btnPrev, btnNext, infoPagina;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloRoles();
});

async function inicializarModuloRoles() {
    // Obtener referencias a elementos DOM
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

    // Configurar eventos
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

    // Cargar datos
    await cargarRoles();
}

async function cargarRoles() {
    try {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando roles...</td></tr>';
        listaCompletaRoles = await obtenerRoles();
        renderizarTabla();
    } catch (error) {
        console.error('Error al cargar roles:', error);
        tablaBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #dc3545;">⚠️ ${error.message}</td></tr>`;
    }
}

function renderizarTabla() {
    if (!tablaBody) return;
    
    // Filtrar datos
    let datosFiltrados = [...listaCompletaRoles];
    
    if (filtroTexto) {
        datosFiltrados = datosFiltrados.filter(rol => 
            (rol.nombreRol && rol.nombreRol.toLowerCase().includes(filtroTexto)) ||
            (rol.descripcionRol && rol.descripcionRol.toLowerCase().includes(filtroTexto))
        );
    }
    
    // Paginación
    const totalItems = datosFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const datosPagina = datosFiltrados.slice(startIndex, endIndex);
    
    // Actualizar información de paginación
    if (infoPagina) {
        infoPagina.textContent = `Página ${currentPage} de ${totalPaginas || 1}`;
    }
    
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage === totalPaginas || totalPaginas === 0;
    
    // Renderizar tabla
    if (datosPagina.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay roles registrados</td></tr>';
        return;
    }
    
    tablaBody.innerHTML = '';
    
    datosPagina.forEach((rol) => {
        const fila = document.createElement('tr');
        
        const estadoTexto = rol.activo ? 'Activo' : 'Inactivo';
        const estadoClass = rol.activo ? 'estado-activo' : 'estado-inactivo';
        const descripcion = rol.descripcionRol || 'Sin descripción';
        
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
    
    // Agregar event listeners a los botones
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
    
    // Ocultar campo de estado (solo para edición)
    const campoEstado = document.getElementById('campo-estado-rol');
    if (campoEstado) campoEstado.style.display = 'none';
    
    modalRol.style.display = 'flex';
}

function abrirModalEditar(rol) {
    modalTitulo.textContent = `✏️ Editar Rol: ${rol.nombreRol}`;
    document.getElementById('rol-id').value = rol.rolID;
    document.getElementById('rol-nombre').value = rol.nombreRol || '';
    document.getElementById('rol-descripcion').value = rol.descripcionRol || '';
    
    // Mostrar campo de estado para edición
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
    
    // Validaciones
    if (!nombre) {
        mostrarNotificacion('El nombre del rol es requerido', 'error');
        return;
    }
    
    try {
        if (id) {
            // Modo edición
            const estadoSelect = document.getElementById('rol-estado');
            const activo = estadoSelect ? estadoSelect.value === 'true' : true;
            
            const datosActualizar = {
                rolID: parseInt(id),
                nombreRol: nombre,
                descripcionRol: descripcion || "",
                activo: activo
            };
            
            await actualizarRol(datosActualizar);
            mostrarNotificacion('Rol actualizado exitosamente', 'success');
        } else {
            // Modo creación
            const datosCrear = {
                nombreRol: nombre,
                descripcionRol: descripcion || "",
                activo: true
            };
            
            await crearRol(datosCrear);
            mostrarNotificacion('Rol registrado exitosamente', 'success');
        }
        
        cerrarModal();
        await cargarRoles();
        
    } catch (error) {
        console.error('Error al guardar rol:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

async function confirmarDesactivar(rol) {
    const confirmar = confirm(`¿Estás seguro de desactivar el rol "${rol.nombreRol}"?\n\nLos usuarios con este rol podrían verse afectados.`);
    
    if (confirmar) {
        try {
            await desactivarRol(rol.rolID);
            mostrarNotificacion('Rol desactivado exitosamente', 'success');
            await cargarRoles();
        } catch (error) {
            console.error('Error al desactivar rol:', error);
            mostrarNotificacion(error.message, 'error');
        }
    }
}

// Función para mostrar notificaciones
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

// Función para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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