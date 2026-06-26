// pages/detalle/detalle.js

import PlatilloService from './shared/services/platilloService.js';

const platilloService = new PlatilloService();

document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    
    if (!id) {
        window.location.href = 'index.html';
        return;
    }
    
    const result = await platilloService.obtenerPorId(id);
    
    if (!result.success || !result.data) {
        console.error("No se encontraron datos para el platillo con ID:", id);
        document.getElementById('platillo-nombre').innerText = "Error al cargar platillo";
        return;
    }
    
    const platillo = result.data;
    
    document.getElementById('platillo-nombre').innerText = platillo.nombre;
    document.getElementById('platillo-precio').innerText = platillo.precioFormateado;
    document.getElementById('platillo-imagen').src = platillo.imagenBase64 || './shared/images/placeholder.png';
    document.getElementById('platillo-descripcion').innerText = platillo.descripcion || 'Sin descripción';
    
    const btnPersonalizar = document.getElementById('btn-personalizar-link');
    if (btnPersonalizar) {
        btnPersonalizar.href = `personalizar.html?id=${id}`;
    }
    
    const qtyContainer = document.querySelector('.qty-selector-detail');
    let cantidad = 1;
    if (qtyContainer) {
        const btnMenos = qtyContainer.querySelector('button:first-child');
        const btnMas = qtyContainer.querySelector('button:last-child');
        const qtyNum = qtyContainer.querySelector('.qty-num');
        
        btnMenos.addEventListener('click', () => {
            if (cantidad > 1) {
                cantidad--;
                qtyNum.innerText = String(cantidad).padStart(2, '0');
            }
        });
        
        btnMas.addEventListener('click', () => {
            if (cantidad < 99) {
                cantidad++;
                qtyNum.innerText = String(cantidad).padStart(2, '0');
            }
        });
    }
    
    const btnAgregar = document.getElementById('btn-agregar-carrito');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            
            const existenteIndex = carrito.findIndex(item => 
                item.platilloID === platillo.platilloID && !item.personalizacion
            );
            
            if (existenteIndex !== -1) {
                carrito[existenteIndex].cantidad += cantidad;
            } else {
                carrito.push({
                    cartItemId: `base_${platillo.platilloID}_${Date.now()}`,
                    platilloID: platillo.platilloID,
                    nombre: platillo.nombre,
                    imagenBase64: platillo.imagenBase64,
                    precioBase: platillo.precio,
                    precioFinal: platillo.precio,
                    cantidad: cantidad,
                    categoriaID: platillo.categoriaID,
                    personalizacion: null
                });
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            window.location.href = 'carrito.html';
        });
    }
});