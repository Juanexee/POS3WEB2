// pages/carrito/carrito.js

import VentaService from '../../shared/services/VentaService.js';
import SesionService from '../../shared/services/SesionService.js';

const ventaService = new VentaService();
const sesionService = new SesionService();

let carritoActual = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
    
    const btnOrdenar = document.getElementById('btn-ordenar');
    if (btnOrdenar) {
        btnOrdenar.addEventListener('click', procesarPedido);
    }
});

function cargarCarrito() {
    const cartList = document.getElementById('cart-list');
    const summaryBlock = document.getElementById('cart-summary-block');
    if (!cartList) return;

    carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carritoActual.length === 0) {
        cartList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #888;">
                <p style="font-size: 1.2rem; margin-bottom: 20px;">Tu carrito está vacío 🛒</p>
                <a href="menu.html" class="btn-yellow" style="display: inline-block; max-width: 250px; text-decoration: none;">Ver el Menú</a>
            </div>
        `;
        if (summaryBlock) summaryBlock.style.display = 'none';
        return;
    }

    if (summaryBlock) summaryBlock.style.display = 'block';
    cartList.innerHTML = '';
    
    let subtotal = 0;

    carritoActual.forEach((item, index) => {
        const itemSubtotal = item.precioFinal * item.cantidad;
        subtotal += itemSubtotal;

        let personalizacionHtml = '';
        if (item.personalizacion) {
            const { opciones = [], nota = '' } = item.personalizacion;
            opciones.forEach(opt => {
                if (opt.seleccion) {
                    const seleccion = Array.isArray(opt.seleccion) ? opt.seleccion.join(', ') : opt.seleccion;
                    personalizacionHtml += `<strong>${opt.grupo}:</strong> ${seleccion}<br>`;
                }
            });
            if (nota) personalizacionHtml += `<strong>Nota:</strong> "${nota}"<br>`;
        }

        const cantidadFormateada = item.cantidad < 10 ? '0' + item.cantidad : item.cantidad;

        const article = document.createElement('article');
        article.className = 'cart-item';
        article.innerHTML = `
            <div class="item-img">
                <img src="${item.imagenBase64}" alt="${item.nombre}">
            </div>
            <div class="item-info">
                <h2>${item.nombre}</h2>
                <div class="cart-item-details">${personalizacionHtml}</div>
                <p class="price">C$ ${item.precioFinal}</p>
            </div>
            <div class="item-controls">
                <button class="qty-btn btn-menos" data-index="${index}">-</button>
                <span class="qty-val">${cantidadFormateada}</span>
                <button class="qty-btn btn-mas" data-index="${index}">+</button>
            </div>
        `;
        cartList.appendChild(article);
    });

    document.getElementById('cart-subtotal').innerText = `C$ ${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `C$ ${subtotal.toFixed(2)}`;

    document.querySelectorAll('.btn-menos').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = Number(e.target.getAttribute('data-index'));
            modificarCantidad(idx, -1);
        });
    });

    document.querySelectorAll('.btn-mas').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = Number(e.target.getAttribute('data-index'));
            modificarCantidad(idx, 1);
        });
    });
}

function modificarCantidad(index, cambio) {
    if (!carritoActual[index]) return;

    if (cambio === -1 && carritoActual[index].cantidad === 1) {
        if (confirm(`¿Deseas eliminar "${carritoActual[index].nombre}" de tu carrito?`)) {
            carritoActual.splice(index, 1);
        }
    } else {
        carritoActual[index].cantidad += cambio;
        if (carritoActual[index].cantidad > 99) carritoActual[index].cantidad = 99;
        if (carritoActual[index].cantidad < 1) carritoActual[index].cantidad = 1;
    }

    localStorage.setItem('carrito', JSON.stringify(carritoActual));
    cargarCarrito();
}

async function procesarPedido() {
    if (carritoActual.length === 0) return;

    let sesionID = localStorage.getItem('sesionActiva');
    let mesaID = localStorage.getItem('mesaActual');

    if (!sesionID || !mesaID) {
        const mesaIngresada = prompt('Por favor, ingresa el número de tu mesa:');
        if (!mesaIngresada) {
            alert('Debes ingresar un número de mesa para continuar.');
            return;
        }
        
        try {
            const resultado = await sesionService.iniciarSesion(parseInt(mesaIngresada));
            if (!resultado.success) {
                alert('Error al iniciar sesión: ' + resultado.message);
                return;
            }
            sesionID = resultado.data.sesionID;
            mesaID = resultado.data.mesaID;
        } catch (error) {
            alert('Error al conectar con el servidor: ' + error.message);
            return;
        }
    }

    const totalElement = document.getElementById('cart-total');
    if (!confirm(`¿Confirmar orden por un total de ${totalElement.innerText}?`)) {
        return;
    }

    const detalles = carritoActual.map(item => ({
        platilloID: item.platilloID,
        cantidad: item.cantidad,
        precio_unitario: item.precioFinal,
        personalizacion: item.personalizacion ? JSON.stringify(item.personalizacion) : null
    }));

    const total = carritoActual.reduce((sum, item) => sum + (item.precioFinal * item.cantidad), 0);

    const ventaData = {
        mesaID: parseInt(mesaID),
        sesionID: parseInt(sesionID),
        usuarioID: null,
        clienteID: null,
        total: total,
        tipoPedido: 'QR',
        detalleVenta: detalles
    };

    try {
        const result = await ventaService.registrarVenta(ventaData);
        
        if (result.success) {
            alert('✅ ¡Pedido enviado a cocina correctamente!');
            localStorage.removeItem('carrito');
            window.location.href = 'menu.html';
        } else {
            alert(`❌ Error al enviar pedido: ${result.message || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('Error al procesar pedido:', error);
        alert('Error de conexión. Por favor, intenta de nuevo.');
    }
}