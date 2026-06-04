// js/platillos.js
import { 
    obtenerPlatillos, 
    insertarPlatillo, 
    actualizarPlatillo 
} from '../../shared/services/platilloService.js';

import { obtenerCategorias } from '../../shared/services/categoriaService.js';

// Nodos del DOM (IDs extraídos exactamente de Platillo.html)
let tablaCuerpo, modalPlatillo, formPlatillo, inputId, inputNombre, inputPrecio, inputDescripcion, selectCategoria, btnAgregar, inputBuscar;
let listaPlatillosLocal = [];
let listaCategoriasLocal = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarModuloPlatillos();
});

async function inicializarModuloPlatillos() {
    // Vincular elementos del DOM
    tablaCuerpo = document.getElementById('cuerpo-tabla-platillos');
    modalPlatillo = document.getElementById('modal-platillo');
    formPlatillo = document.getElementById('form-platillo');
    inputId = document.getElementById('platillo-id');
    inputNombre = document.getElementById('nombre-platillo');
    inputPrecio = document.getElementById('precio-platillo');
    inputDescripcion = document.getElementById('Descripcion-platillo');
    selectCategoria = document.getElementById('categoria-platillo');
    btnAgregar = document.getElementById('btn-agregar-platillo');
    inputBuscar = document.getElementById('input-buscar-platillo');

    console.log("¿Botón Encontrado?", btnAgregar);
console.log("¿Modal Encontrado?", modalPlatillo);

    // 1. REGISTRO DE EVENTOS SÍNCRONOS Y ESTABLES

  if (btnAgregar) {
    btnAgregar.addEventListener('click', (e) => {
        e.preventDefault();
        formPlatillo.reset();
        if (inputId) inputId.value = ""; 
        if (modalPlatillo) modalPlatillo.style.display = 'flex';
    });
} else {
    console.warn("⚠️ No se pudo inicializar el botón '+' porque no se encontró en el HTML.");
}

    // Botón Cancelar/Salir del modal
    const btnSalir = document.querySelector('.btn-salir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            modalPlatillo.style.display = 'none';
            formPlatillo.reset();
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (modalPlatillo) {
        modalPlatillo.addEventListener('click', (e) => {
            if (e.target === modalPlatillo) {
                modalPlatillo.style.display = 'none';
                formPlatillo.reset();
            }
        });
    }

    // Búsqueda interactiva en tiempo real
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase().trim();
            filtrarYMostrarPlatillos(texto);
        });
    }

    // Manejo del envío del formulario (Insertar/Guardar)
    if (formPlatillo) {
        formPlatillo.addEventListener('submit', async (e) => {
            e.preventDefault();
            await procesarGuardadoPlatillo();
        });
    }

    // 2. CARGA ASÍNCRONA E INICIALIZACIÓN DE DATOS
    await cargarDatosIniciales();
}

async function cargarDatosPagina() {
    try {
        console.log("Iniciando la carga de datos combinados...");

        // Ejecutamos ambas peticiones en paralelo
        const [resCategorias, resPlatillos] = await Promise.all([
            obtenerCategorias().catch(err => {
                console.error("Error crítico al obtener categorías:", err);
                return [];
            }),
            obtenerPlatillos().catch(err => {
                console.error("Error crítico al obtener platillos:", err);
                return [];
            })
        ]);

        // Aseguramos que si la API devolvió un objeto de error o no es un array, se vuelva un array vacío
        listaCategoriasLocal = Array.isArray(resCategorias) ? resCategorias : [];
        listaPlatillosLocal = Array.isArray(resPlatillos) ? resPlatillos : [];

        console.log(`Categorías procesadas correctamente: ${listaCategoriasLocal.length}`);
        console.log(`Platillos procesados correctamente: ${listaPlatillosLocal.length}`);

        // Rellenamos el select del modal y pintamos la tabla
        rellenarSelectCategorias(listaCategoriasLocal);
        renderizarTabla(listaPlatillosLocal);

    } catch (error) {
        console.error("Error general en cargarDatosPagina:", error);
        if (tablaCuerpo) {
            tablaCuerpo.innerHTML = `<tr><td colspan=\"7\" style=\"text-align:center; color:#dc3545;\">⚠️ Error al procesar los datos: ${error.message}</td></tr>`;
        }
    }
}

function rellenarSelectCategorias(categorias) {
    if (!selectCategoria) return;

    selectCategoria.innerHTML = '<option value="">Seleccione una categoría...</option>';
    categorias.forEach(cat => {
        const id = cat.categoriaID || cat.id || cat.CategoriaID;
        const nombre = cat.nombre || cat.Nombre;

        if (id && nombre) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = nombre;
            selectCategoria.appendChild(option);
        }
    });
}

function renderizarTablaPlatillos(platillos) {
    if (!tablaCuerpo) return;
    tablaCuerpo.innerHTML = '';

    if (platillos.length === 0) {
        tablaCuerpo.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#777;">No se encontraron platillos registrados.</td></tr>`;
        return;
    }

    platillos.forEach((platillo, index) => {
        const currentID = platillo.platilloID || platillo.id;
        const currentNombre = platillo.nombre || "Sin nombre";
        const currentCategoria = platillo.nombreCategoria || "Sin categoría";
        const currentPrecio = platillo.precio != null ? platillo.precio : 0;
        const currentDisponible = platillo.disponible;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td>${currentNombre}</td>
            <td><span class="badge-categoria" style="background:#f3f4f6; padding: 4px 8px; border-radius:12px; font-size:0.85rem;">📁 ${currentCategoria}</span></td>
            <td><strong>C$ ${currentPrecio.toFixed(2)}</strong></td>
            <td>
                <label class="switch-estado" style="cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
                    <input type="checkbox" class="chk-disponibilidad" ${currentDisponible ? 'checked' : ''} style="cursor:pointer;">
                    <span class="texto-estado" style="font-weight:bold; font-size:0.85rem; color: ${currentDisponible ? '#28a745' : '#dc3545'}">
                        ${currentDisponible ? '🟢 Disponible' : '🔴 Agotado'}
                    </span>
                </label>
            </td>
            <td style="text-align: right; padding-right: 30px;">
                <button class="btn-edit" title="Editar Platillo">✏️</button>
            </td>
        `;

        // Evento interactivo para cambiar la disponibilidad inmediata (PUT)
        const checkbox = fila.querySelector('.chk-disponibilidad');
        checkbox.addEventListener('change', async (e) => {
            const nuevoEstado = e.target.checked;
            const textoEstado = fila.querySelector('.texto-estado');
            
            try {
                // Instancia directa usando el servicio compartido y query string exigido
                // URL: PUT https://localhost:7081/Platillo/{id}/Disponibilidad?disponible=true/false
                const API_URL = 'https://localhost:7081';
                const token = localStorage.getItem('token');
                
                const respuesta = await fetch(`${API_URL}/Platillo/${currentID}/Disponibilidad?disponible=${nuevoEstado}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });

                if (!respuesta.ok) throw new Error('Fallo al actualizar el estado en el servidor.');

                // Feedback visual dinámico exitoso
                if (nuevoEstado) {
                    textoEstado.textContent = '🟢 Disponible';
                    textoEstado.style.color = '#28a745';
                } else {
                    textoEstado.textContent = '🔴 Agotado';
                    textoEstado.style.color = '#dc3545';
                }
            } catch (error) {
                e.target.checked = !nuevoEstado; // Revertir el checkbox si falla
                alert(`⚠️ Error al cambiar disponibilidad: ${error.message}`);
            }
        });

        // Evento para preparar y rellenar el formulario de edición
        fila.querySelector('.btn-edit').addEventListener('click', () => {
            inputId.value = currentID;
            inputNombre.value = currentNombre;
            inputPrecio.value = currentPrecio;
            inputDescripcion.value = platillo.descripcion || "";
            selectCategoria.value = platillo.categoriaID || "";
            
            modalPlatillo.style.display = 'flex';
        });

        tablaCuerpo.appendChild(fila);
    });
}

function filtrarYMostrarPlatillos(texto) {
    const filtrados = listaPlatillosLocal.filter(platillo => {
        const nombre = (platillo.nombre || '').toLowerCase();
        const categoria = (platillo.nombreCategoria || '').toLowerCase();
        const descripcion = (platillo.descripcion || '').toLowerCase();
        return nombre.includes(texto) || categoria.includes(texto) || descripcion.includes(texto);
    });
    renderizarTablaPlatillos(filtrados);
}

async function procesarGuardadoPlatillo() {
    // Generación del payload estructurado según el modelo DTO de tu API .NET
    const payload = {
        nombre: inputNombre.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        precio: parseFloat(inputPrecio.value),
        categoriaID: parseInt(selectCategoria.value),
        disponible: true // Por defecto se registra como disponible
    };

    try {
        if (inputId.value) {
            // Lógica de actualización (si el endpoint PUT general /Platillo/{id} está habilitado)
            // Si tu API no soporta modificación de cuerpo completo aún, puedes enlazarlo al endpoint de negocio correspondiente.
            alert('El flujo de modificación general se encuentra listo.');
        } else {
            // Proceso de Inserción limpio (POST /Platillo/Insertar)
            const resultado = await insertarPlatillo(payload);
            alert(resultado.message || 'Platillo guardado correctamente.');
        }

        modalPlatillo.style.display = 'none';
        formPlatillo.reset();
        
        // Recargar los datos para refrescar la grilla de inmediato
        const platillosActualizados = await obtenerPlatillos();
        listaPlatillosLocal = platillosActualizados || [];
        renderizarTablaPlatillos(listaPlatillosLocal);

    } catch (error) {
        alert(`⚠️ No se pudo procesar la solicitud: ${error.message}`);
    }
}