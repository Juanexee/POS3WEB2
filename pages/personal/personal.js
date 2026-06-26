// pages/personal/personal.js
import { 
    obtenerPersonal, 
    obtenerRoles, 
    crearUsuario, 
    actualizarUsuario, 
    eliminarUsuario 
} from '../../shared/services/personalService.js';

// VARIABLES GLOBALES
let listaCompletaPersonal = [];
let listaRoles = [];
let currentPage = 1;
let itemsPerPage = 8;
let filtroTexto = '';
let chkMostrarInactivos;

// Elementos DOM
let tablaBody;
let modalPersonal;
let formPersonal;
let modalTitulo;
let btnCancelar;
let btnAbrirAgregar;
let inputBuscar;
let btnPrev, btnNext, infoPagina;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloPersonal();
});

async function inicializarModuloPersonal() {
    // Obtener referencias a elementos DOM
    tablaBody = document.getElementById('tabla-personal-body');
    modalPersonal = document.getElementById('modal-personal');
    formPersonal = document.getElementById('form-personal');
    modalTitulo = document.getElementById('modal-titulo-personal');
    btnCancelar = document.getElementById('btn-cancelar');
    btnAbrirAgregar = document.getElementById('btn-abrir-agregar');
    inputBuscar = document.getElementById('input-buscar-personal');
    btnPrev = document.getElementById('btn-prev');
    btnNext = document.getElementById('btn-next');
    infoPagina = document.getElementById('info-pagina');
    chkMostrarInactivos = document.getElementById('chk-mostrar-inactivos');

    if (chkMostrarInactivos) {
        chkMostrarInactivos.addEventListener('change', () => {
            currentPage = 1;
            renderizarTabla();
        });
    }

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

    if (formPersonal) {
        formPersonal.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarPersonal();

        });
    }

    // Cargar datos
    await cargarRoles();
    await cargarPersonal();
}

async function cargarRoles() {
    try {
        listaRoles = await obtenerRoles();
        const selectRol = document.getElementById('per-rol');
        if (selectRol && listaRoles.length > 0) {
            selectRol.innerHTML = '<option value="">-- Seleccione un Rol --</option>';
            
            // Filtrar roles activos si tienen propiedad activo
            const rolesActivos = listaRoles.filter(r => r.activo !== false);
            
            rolesActivos.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.rolID;
                option.textContent = `${rol.nombreRol} ${rol.descripcionRol ? `- ${rol.descripcionRol}` : ''}`;
                selectRol.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
        mostrarNotificacion('Error al cargar los roles: ' + error.message, 'error');
    }
}

async function cargarPersonal() {
    try {
        tablaBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando personal...</td></tr>';
        listaCompletaPersonal = await obtenerPersonal();
        renderizarTabla();
    } catch (error) {
        console.error('Error al cargar personal:', error);
        tablaBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #dc3545;">⚠️ ${error.message}</td></tr>`;
    }
}

function renderizarTabla() {
    if (!tablaBody) return;
    
    // Filtrar datos
    let datosFiltrados = [...listaCompletaPersonal];
    
    const mostrarInactivos = chkMostrarInactivos ? chkMostrarInactivos.checked : false;
    if (!mostrarInactivos) {
        datosFiltrados = datosFiltrados.filter(persona => persona.activo === true);
    }
    
    if (filtroTexto) {
        datosFiltrados = datosFiltrados.filter(persona => 
            (persona.nombre && persona.nombre.toLowerCase().includes(filtroTexto)) ||
            (persona.nombreUsuario && persona.nombreUsuario.toLowerCase().includes(filtroTexto)) ||
            (persona.telefono && persona.telefono.includes(filtroTexto))
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
        tablaBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay personal registrado</td></tr>';
        return;
    }
    
    tablaBody.innerHTML = '';
    
    datosPagina.forEach((persona, index) => {
        const fila = document.createElement('tr');
        
        // Obtener nombre del rol
        const rolEncontrado = listaRoles.find(r => r.rolID === persona.rolID);
        const nombreRol = rolEncontrado ? rolEncontrado.nombreRol : `Rol ID: ${persona.rolID}`;
        
        // Estado activo/inactivo
        const estadoTexto = persona.activo ? 'Activo' : 'Inactivo';
        const estadoClass = persona.activo ? 'estado-activo' : 'estado-inactivo';
        
        fila.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${escapeHtml(persona.nombre || '')}</td>
            <td>${escapeHtml(persona.nombreUsuario || '')}</td>
            <td>${escapeHtml(persona.telefono || '-')}</td>
            <td>${escapeHtml(nombreRol)}</td>
            <td><span class="estado-badge ${estadoClass}">${estadoTexto}</span></td>
            <td>
                <button class="btn-editar" data-id="${persona.usuarioID}">✏️ Editar</button>
                ${persona.activo 
                    ? `<button class="btn-desactivar" data-id="${persona.usuarioID}">🔒 Desactivar</button>`
                    : `<button class="btn-activar" data-id="${persona.usuarioID}">✅ Activar</button>`
                }
            </td>
        `;
        
        tablaBody.appendChild(fila);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const persona = listaCompletaPersonal.find(p => p.usuarioID === id);
            if (persona) abrirModalEditar(persona);
        });
    });
    
    document.querySelectorAll('.btn-desactivar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const persona = listaCompletaPersonal.find(p => p.usuarioID === id);
            if (persona) confirmarCambiarEstado(persona, false);
        });
    });

    document.querySelectorAll('.btn-activar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const persona = listaCompletaPersonal.find(p => p.usuarioID === id);
            if (persona) confirmarCambiarEstado(persona, true);
        });
    });
}

function totalPages() {
    let datosFiltrados = [...listaCompletaPersonal];
    const mostrarInactivos = chkMostrarInactivos ? chkMostrarInactivos.checked : false;
    if (!mostrarInactivos) {
        datosFiltrados = datosFiltrados.filter(persona => persona.activo === true);
    }
    if (filtroTexto) {
        datosFiltrados = datosFiltrados.filter(persona => 
            (persona.nombre && persona.nombre.toLowerCase().includes(filtroTexto)) ||
            (persona.nombreUsuario && persona.nombreUsuario.toLowerCase().includes(filtroTexto)) ||
            (persona.telefono && persona.telefono.includes(filtroTexto))
        );
    }
    return Math.ceil(datosFiltrados.length / itemsPerPage);
}

function abrirModalAgregar() {
    modalTitulo.textContent = '👥 Registrar Nuevo Personal';
    document.getElementById('usuario-id').value = '';
    formPersonal.reset();
    
    // Mostrar campo de contraseña y ayuda
    const campoPassword = document.getElementById('campo-password');
    const passHelp = document.getElementById('pass-help');
    if (campoPassword) campoPassword.style.display = 'block';
    if (passHelp) passHelp.textContent = 'Mínimo 6 caracteres';
    
    // Ocultar campo de estado (solo para edición)
    const campoEstado = document.getElementById('campo-estado');
    if (campoEstado) campoEstado.style.display = 'none';
    
    modalPersonal.style.display = 'flex';
}

function abrirModalEditar(persona) {
    modalTitulo.textContent = `✏️ Editar Personal: ${persona.nombre}`;
    document.getElementById('usuario-id').value = persona.usuarioID;
    document.getElementById('per-nombre').value = persona.nombre || '';
    document.getElementById('per-usuario').value = persona.nombreUsuario || '';
    document.getElementById('per-telefono').value = persona.telefono || '';
    document.getElementById('per-rol').value = persona.rolID || '';
    
    // Mostrar campo de estado para edición
    const campoEstado = document.getElementById('campo-estado');
    if (campoEstado) {
        campoEstado.style.display = 'block';
        const selectEstado = document.getElementById('per-estado');
        if (selectEstado) selectEstado.value = persona.activo ? 'true' : 'false';
    }
    
    // Ocultar campo de contraseña o hacerlo opcional
    const campoPassword = document.getElementById('campo-password');
    const passHelp = document.getElementById('pass-help');
    if (campoPassword) campoPassword.style.display = 'block';
    if (passHelp) passHelp.textContent = 'Dejar vacío para no cambiar';
    
    modalPersonal.style.display = 'flex';
}

function cerrarModal() {
    modalPersonal.style.display = 'none';
    formPersonal.reset();
}

async function guardarPersonal() {
    const id = document.getElementById('usuario-id').value;
    const nombre = document.getElementById('per-nombre').value.trim();
    const nombreUsuario = document.getElementById('per-usuario').value.trim();
    const telefono = document.getElementById('per-telefono').value.trim();
    const rolID = parseInt(document.getElementById('per-rol').value);
    const password = document.getElementById('per-pass').value;
    
    // Validaciones
    if (!nombre) {
        mostrarNotificacion('El nombre completo es requerido', 'error');
        return;
    }
    
    if (!nombreUsuario) {
        mostrarNotificacion('El nombre de usuario es requerido', 'error');
        return;
    }
    
    if (!rolID) {
        mostrarNotificacion('Debe seleccionar un rol', 'error');
        return;
    }
    
    try {
        if (id) {
            // Modo edición
            const estadoSelect = document.getElementById('per-estado');
            const activo = estadoSelect ? estadoSelect.value === 'true' : true;

            const datosActualizar = {
                nombreUsuario: nombreUsuario,
                nombre: nombre,
                telefono: telefono,
                rolID: rolID,
                activo: activo
            };
            
            // Si se proporcionó contraseña, incluirla
            if (password && password.length >= 6) {
                datosActualizar.password = password;
            }
            
            await actualizarUsuario(id, datosActualizar);
            mostrarNotificacion('Personal actualizado exitosamente', 'success');
        } else {
            // Modo creación
            if (!password || password.length < 6) {
                mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            const datosCrear = {
                nombreUsuario: nombreUsuario,
                nombre: nombre,
                telefono: telefono || "",
                rolID: rolID,
                password: password
            };
            
            await crearUsuario(datosCrear);
            mostrarNotificacion('Personal registrado exitosamente', 'success');
        }
        
        cerrarModal();
        await cargarPersonal();
        
    } catch (error) {
        console.error('Error al guardar personal:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

async function confirmarCambiarEstado(persona, activo) {
    const accionTexto = activo ? 'activar' : 'desactivar';
    const confirmar = confirm(`¿Estás seguro de que deseas ${accionTexto} a "${persona.nombre}"?\n\nEsta acción cambiará el estado de su cuenta.`);
    
    if (confirmar) {
        try {
            if (activo) {
                const datosUsuario = {
                    nombreUsuario: persona.nombreUsuario,
                    nombre: persona.nombre,
                    telefono: persona.telefono || "",
                    rolID: persona.rolID,
                    activo: true
                };
                await actualizarUsuario(persona.usuarioID, datosUsuario);
                mostrarNotificacion('Personal activado exitosamente', 'success');
            } else {
                await eliminarUsuario(persona.usuarioID);
                mostrarNotificacion('Personal desactivado exitosamente', 'success');
            }
            await cargarPersonal();
        } catch (error) {
            console.error(`Error al ${accionTexto} personal:`, error);
            mostrarNotificacion(error.message, 'error');
        }
    }
}


// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    // Crear elemento de notificación
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

// Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Agregar estilos de animación para notificaciones
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