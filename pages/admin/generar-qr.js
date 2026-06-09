// pages/admin/generar-qr.js

import MesaService from '../../shared/services/mesaService.js';
import { mostrarNotificacion } from '../../shared/utils/notificaciones.js';

const mesaService = new MesaService();

let mesas = [];

document.addEventListener('DOMContentLoaded', async () => {
    await cargarMesas();
    
    const btnImprimirTodos = document.getElementById('btn-imprimir-todos');
    const btnRefrescar = document.getElementById('btn-refrescar');
    
    if (btnImprimirTodos) {
        btnImprimirTodos.addEventListener('click', imprimirTodos);
    }
    
    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', cargarMesas);
    }
});

async function cargarMesas() {
    const container = document.getElementById('qr-container');
    const totalMesasSpan = document.getElementById('total-mesas');
    const totalQRSpan = document.getElementById('total-qr');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando mesas...</p>
        </div>
    `;
    
    try {
        // Obtener mesas desde la API
        const mesasData = await mesaService.obtenerTodas();
        
        // Filtrar solo mesas activas
        mesas = mesasData.filter(mesa => mesa.activo !== false);
        
        // Actualizar estadísticas
        if (totalMesasSpan) totalMesasSpan.textContent = mesas.length;
        if (totalQRSpan) totalQRSpan.textContent = mesas.length;
        
        if (mesas.length === 0) {
            container.innerHTML = `
                <div class="no-mesas">
                    <i class="fas fa-chair"></i>
                    <p>No hay mesas registradas</p>
                    <small>Agrega mesas desde el módulo de Mesas</small>
                </div>
            `;
            return;
        }
        
        await generarQRCodes(mesas);
        
    } catch (error) {
        console.error('Error al cargar mesas:', error);
        container.innerHTML = `
            <div class="no-mesas">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las mesas</p>
                <small>${error.message}</small>
            </div>
        `;
        mostrarNotificacion('Error al cargar las mesas', 'error');
    }
}

async function generarQRCodes(mesasList) {
    const container = document.getElementById('qr-container');
    if (!container) return;
    
    container.innerHTML = '';
    const baseURL = window.location.origin;
    
    for (const mesa of mesasList) {
        const numeroMesa = mesa.numeroMesa || mesa.numero_mesa;
        const url = `${baseURL}/pages/menu/menu.html?mesa=${numeroMesa}`;
        
        const card = document.createElement('div');
        card.className = 'qr-card';
        
        // Crear canvas para el QR
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 180;
        canvas.style.width = '180px';
        canvas.style.height = '180px';
        
        try {
            await QRCode.toCanvas(canvas, url, { 
                width: 180, 
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (error) {
            console.error('Error generando QR para mesa', numeroMesa, error);
            continue;
        }
        
        // Construir tarjeta
        card.innerHTML = `
            <h3><i class="fas fa-chair"></i> Mesa ${numeroMesa}</h3>
            <div class="qr-img"></div>
            <div class="qr-url">${url}</div>
            <button class="btn-imprimir" data-mesa="${numeroMesa}" data-url="${url}">
                <i class="fas fa-print"></i> Imprimir QR
            </button>
        `;
        
        const qrImgDiv = card.querySelector('.qr-img');
        qrImgDiv.appendChild(canvas);
        
        const btnImprimir = card.querySelector('.btn-imprimir');
        btnImprimir.addEventListener('click', () => {
            imprimirQR(numeroMesa, canvas.toDataURL(), url);
        });
        
        container.appendChild(card);
    }
}

function imprimirQR(mesa, qrDataURL, url) {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>QR Mesa ${mesa} | El Rancho de la Mimi</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    text-align: center;
                    padding: 40px;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background: white;
                }
                .qr-container {
                    max-width: 400px;
                    margin: 0 auto;
                    text-align: center;
                }
                .logo {
                    margin-bottom: 20px;
                }
                .logo h1 {
                    color: #ff6b00;
                    font-size: 1.8rem;
                }
                .logo p {
                    color: #666;
                    font-size: 0.9rem;
                }
                h2 {
                    color: #1a1a1a;
                    margin: 20px 0;
                }
                img {
                    width: 220px;
                    height: 220px;
                    margin: 20px auto;
                    display: block;
                    border: 2px solid #ff6b00;
                    border-radius: 20px;
                    padding: 10px;
                }
                .info {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888;
                }
                .divider {
                    border-top: 1px dashed #ccc;
                    margin: 20px 0;
                }
                .footer {
                    font-size: 10px;
                    color: #aaa;
                    margin-top: 30px;
                }
                @media print {
                    body {
                        padding: 20px;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="qr-container">
                <div class="logo">
                    <h1>🍽️ EL RANCHO DE LA MIMI</h1>
                    <p>Jinotepe, Carazo, Nicaragua</p>
                </div>
                <h2>Mesa ${mesa}</h2>
                <img src="${qrDataURL}" alt="Código QR Mesa ${mesa}">
                <div class="divider"></div>
                <p class="info">
                    <strong>📱 Instrucciones:</strong><br>
                    1. Escanea este código con tu teléfono<br>
                    2. Selecciona tus platillos favoritos<br>
                    3. Confirma tu pedido<br>
                    4. ¡Disfruta tu comida!
                </p>
                <p class="info">${url}</p>
                <div class="footer">
                    Sistema de pedidos por QR - El Rancho de la Mimi
                </div>
            </div>
            <script>
                window.print();
            <\/script>
        </body>
        </html>
    `);
    ventana.document.close();
}

function imprimirTodos() {
    const ventana = window.open('', '_blank');
    let contenido = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Todos los QR - Mesas | El Rancho de la Mimi</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    padding: 20px;
                    background: white;
                }
                .page {
                    page-break-after: always;
                    text-align: center;
                    padding: 40px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .logo h1 {
                    color: #ff6b00;
                    font-size: 1.8rem;
                }
                .logo p {
                    color: #666;
                }
                h2 {
                    margin: 20px 0;
                }
                img {
                    width: 200px;
                    height: 200px;
                    margin: 20px auto;
                    display: block;
                    border: 2px solid #ff6b00;
                    border-radius: 15px;
                    padding: 8px;
                }
                .info {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 10px;
                    color: #aaa;
                }
                @media print {
                    .page {
                        page-break-after: always;
                    }
                }
            </style>
        </head>
        <body>
    `;
    
    // Recoger todos los canvas y agregarlos
    const qrCards = document.querySelectorAll('.qr-card');
    qrCards.forEach((card, index) => {
        const canvas = card.querySelector('canvas');
        const mesa = card.querySelector('h3')?.innerText.replace(/[^0-9]/g, '') || (index + 1);
        const url = card.querySelector('.qr-url')?.innerText || '';
        
        if (canvas) {
            contenido += `
                <div class="page">
                    <div class="logo">
                        <h1>🍽️ EL RANCHO DE LA MIMI</h1>
                        <p>Jinotepe, Carazo, Nicaragua</p>
                    </div>
                    <h2>Mesa ${mesa}</h2>
                    <img src="${canvas.toDataURL()}" alt="QR Mesa ${mesa}">
                    <p class="info">Escanea este código para ordenar desde tu mesa</p>
                    <p class="info">${url}</p>
                    <div class="footer">Sistema de pedidos por QR - El Rancho de la Mimi</div>
                </div>
            `;
        }
    });
    
    contenido += `
        </body>
        </html>
    `;
    
    ventana.document.write(contenido);
    ventana.document.close();
}