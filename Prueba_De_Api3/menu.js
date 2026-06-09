// pages/menu/menu.js

import PlatilloService from '../../shared/services/platilloService.js';
import CategoriaService from '../../shared/services/categoriaService.js';
import SesionService from '../../shared/services/SesionService.js';

const platilloService = new PlatilloService();
const categoriaService = new CategoriaService();
const sesionService = new SesionService();

let todosLosPlatillos = [];
let todasLasCategorias = [];

// Inicializar sesión por QR
async function inicializarSesionPorQR() {
    const urlParams = new URLSearchParams(window.location.search);
    const numeroMesa = urlParams.get('mesa');
    
    if (numeroMesa) {
        try {
            const resultado = await sesionService.iniciarSesion(parseInt(numeroMesa));
            if (resultado.success) {
                localStorage.setItem('sesionActiva', resultado.data.sesionID);
                localStorage.setItem('mesaActual', resultado.data.mesaID);
                mostrarIndicadorMesa(numeroMesa);
                console.log(`✅ Sesión iniciada para Mesa ${numeroMesa}`);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    }
}

function mostrarIndicadorMesa(numeroMesa) {
    const indicador = document.createElement('div');
    indicador.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #ff6b00;
        color: white;
        padding: 8px 16px;
        border-radius: 30px;
        font-size: 14px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    indicador.innerHTML = `🪑 Mesa ${numeroMesa}`;
    document.body.appendChild(indicador);
}

async function init() {
    // Inicializar sesión si viene de QR
    await inicializarSesionPorQR();
    
    try {
        const [platillosRes, categoriasRes] = await Promise.all([
            platilloService.obtenerTodos(),
            categoriaService.obtenerTodas()
        ]);
        
        todosLosPlatillos = platillosRes.success ? platillosRes.data : [];
        todasLasCategorias = categoriasRes;
        
        const mapaCategorias = new Map();
        todasLasCategorias.forEach(cat => {
            mapaCategorias.set(cat.categoriaID, cat.nombre);
        });
        
        todosLosPlatillos = todosLosPlatillos.map(platillo => ({
            ...platillo,
            nombreCategoria: mapaCategorias.get(platillo.categoriaID) || 'Otros'
        }));
        
        renderizarMenu(todosLosPlatillos);
        
        const buscarInput = document.getElementById('buscar-input');
        if (buscarInput) {
            buscarInput.addEventListener('input', (e) => {
                const busqueda = e.target.value.toLowerCase().trim();
                if (busqueda === '') {
                    renderizarMenu(todosLosPlatillos);
                } else {
                    const filtrados = todosLosPlatillos.filter(p => 
                        p.nombre.toLowerCase().includes(busqueda) ||
                        (p.descripcion && p.descripcion.toLowerCase().includes(busqueda)) ||
                        p.nombreCategoria.toLowerCase().includes(busqueda)
                    );
                    renderizarMenu(filtrados);
                }
            });
        }
        
    } catch (error) {
        console.error('Error al cargar el menú:', error);
        const contenedor = document.getElementById('menu-contenedor');
        if (contenedor) {
            contenedor.innerHTML = '<p class="error">Error al cargar el menú. Por favor, intenta de nuevo.</p>';
        }
    }
}

function renderizarMenu(platillos) {
    const contenedor = document.getElementById('menu-contenedor');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';

    if (platillos.length === 0) {
        contenedor.innerHTML = '<p class="no-results">No se encontraron platillos.</p>';
        return;
    }

    const grupos = {};
    platillos.forEach(platillo => {
        const catId = platillo.categoriaID;
        if (!grupos[catId]) {
            grupos[catId] = {
                nombre: platillo.nombreCategoria,
                items: []
            };
        }
        grupos[catId].items.push(platillo);
    });

    const categoriasOrdenadas = Object.keys(grupos).sort((a, b) => a - b);

    categoriasOrdenadas.forEach(catId => {
        const grupo = grupos[catId];
        
        const tituloCategoria = document.createElement('h2');
        tituloCategoria.className = 'category-title';
        tituloCategoria.innerText = grupo.nombre;
        contenedor.appendChild(tituloCategoria);

        const grid = document.createElement('div');
        grid.className = 'grid-menu';

        grupo.items.forEach(platillo => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'food-item';
            
            const enlace = document.createElement('a');
            enlace.href = `detalle.html?id=${platillo.platilloID}`;
            enlace.className = 'product-link';
            
            const img = document.createElement('img');
            img.src = platillo.imagenBase64 || '../../shared/images/placeholder.png';
            img.alt = platillo.nombre;
            
            const detalles = document.createElement('div');
            detalles.className = 'food-details';
            
            const nombre = document.createElement('h3');
            nombre.innerText = platillo.nombre;
            
            const precio = document.createElement('p');
            precio.innerText = platillo.precioFormateado;
            
            detalles.appendChild(nombre);
            detalles.appendChild(precio);
            enlace.appendChild(img);
            enlace.appendChild(detalles);
            tarjeta.appendChild(enlace);
            grid.appendChild(tarjeta);
        });
        
        contenedor.appendChild(grid);
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);