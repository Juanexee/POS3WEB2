// pages/personalizar/personalizar.js

import PlatilloService from './shared/services/platilloService.js';

const platilloService = new PlatilloService();

let platilloActual = null;
let precioBase = 0;
let precioTotalActual = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    const result = await platilloService.obtenerPorId(id);
    
    if (!result.success || !result.data) {
        document.getElementById('platillo-nombre').innerText = "Error al cargar el platillo";
        return;
    }
    
    platilloActual = result.data;
    precioBase = platilloActual.precio;
    precioTotalActual = precioBase;

    document.getElementById('platillo-nombre').innerText = platilloActual.nombre;
    document.getElementById('platillo-imagen').src = platilloActual.imagenBase64 || './shared/images/placeholder.png';
    document.getElementById('platillo-precio').innerText = `C$ ${precioBase}`;

    const opcionesContenedor = document.getElementById('opciones-contenedor');
    opcionesContenedor.innerHTML = '';
    
    const opcionesConfig = obtenerOpcionesPorPlatillo(platilloActual);
    crearElementosOpciones(opcionesConfig, opcionesContenedor);

    opcionesContenedor.addEventListener('change', actualizarPrecio);
    actualizarPrecio();

    const btnConfirmar = document.getElementById('btn-confirmar-personalizacion');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', agregarAlCarrito);
    }
});

function obtenerOpcionesPorPlatillo(platillo) {
    const nombre = platillo.nombre.toLowerCase();
    const catID = platillo.categoriaID;

    // 1. Detección por nombre de platillo específico
    if (nombre.includes('nacatamal')) {
        return {
            placeholderNota: 'Ej: Sin cebolla, con más chile...',
            grupos: [
                {
                    titulo: 'Preparación',
                    tipo: 'radio',
                    nombreInput: 'nacatamal-prep',
                    opciones: [
                        { texto: 'Normal', extraCost: 0, checked: true },
                        { texto: 'Sin Chile', extraCost: 0 }
                    ]
                },
                {
                    titulo: 'Acompañamiento',
                    tipo: 'checkbox',
                    opciones: [
                        { texto: 'Con Pan', extraCost: 5 },
                        { texto: 'Con Café', extraCost: 15 }
                    ]
                }
            ]
        };
    }

    if (nombre.includes('hamburguesa')) {
        return {
            placeholderNota: 'Ej: Sin cebolla, sin mayonesa...',
            grupos: [
                {
                    titulo: 'Escoge el tamaño',
                    tipo: 'radio',
                    nombreInput: 'burger-size',
                    opciones: [
                        { texto: 'Sencilla', extraCost: 0, checked: true },
                        { texto: 'Doble Carne', extraCost: 40 },
                        { texto: 'Combo Grande', extraCost: 50 }
                    ]
                },
                {
                    titulo: 'Extras',
                    tipo: 'checkbox',
                    opciones: [
                        { texto: 'Queso extra', extraCost: 15 },
                        { texto: 'Tocino', extraCost: 20 },
                        { texto: 'Papas Extras', extraCost: 25 }
                    ]
                }
            ]
        };
    }

    if (nombre.includes('ribeye') || nombre.includes('carne')) {
        return {
            placeholderNota: 'Ej: Término de carne específico...',
            grupos: [
                {
                    titulo: 'Término de la carne',
                    tipo: 'radio',
                    nombreInput: 'cooking-point',
                    opciones: [
                        { texto: 'Bien Asada', extraCost: 0, checked: true },
                        { texto: 'Término Medio', extraCost: 0 },
                        { texto: 'Tres Cuartos', extraCost: 0 }
                    ]
                },
                {
                    titulo: 'Acompañamiento',
                    tipo: 'radio',
                    nombreInput: 'side-dish',
                    opciones: [
                        { texto: 'Gallopinto y Maduro', extraCost: 0, checked: true },
                        { texto: 'Tajadas Con Queso', extraCost: 0 },
                        { texto: 'Papas Fritas', extraCost: 0 }
                    ]
                }
            ]
        };
    }

    // 2. Detección por Categoría
    if (catID === 3 || catID === 5) { // Bebidas (3) o Vinos (5)
        return {
            placeholderNota: 'Ej: Con limón, con sal, al tiempo...',
            grupos: [
                {
                    titulo: 'Temperatura',
                    tipo: 'radio',
                    nombreInput: 'drink-temp',
                    opciones: [
                        { texto: 'Fría', extraCost: 0, checked: true },
                        { texto: 'Al Tiempo', extraCost: 0 },
                        { texto: 'Con Hielo', extraCost: 0 }
                    ]
                },
                {
                    titulo: 'Opciones de preparación',
                    tipo: 'checkbox',
                    opciones: [
                        { texto: 'Sin Azúcar', extraCost: 0 },
                        { texto: 'Extra Hielo', extraCost: 0 },
                        { texto: 'Con Limón y Sal', extraCost: 0 }
                    ]
                }
            ]
        };
    }

    if (catID === 2) { // Entradas
        return {
            placeholderNota: 'Ej: Sin salsa, extra picante...',
            grupos: [
                {
                    titulo: 'Picante',
                    tipo: 'radio',
                    nombreInput: 'chili-level',
                    opciones: [
                        { texto: 'Normal', extraCost: 0, checked: true },
                        { texto: 'Sin Picante', extraCost: 0 },
                        { texto: 'Picante Extra', extraCost: 0 }
                    ]
                },
                {
                    titulo: 'Extras',
                    tipo: 'checkbox',
                    opciones: [
                        { texto: 'Queso extra', extraCost: 15 },
                        { texto: 'Salsa especial', extraCost: 10 }
                    ]
                }
            ]
        };
    }

    if (catID === 4) { // Postres
        return {
            placeholderNota: 'Ej: Sin sirope, con doble cuchara...',
            grupos: [
                {
                    titulo: 'Adicionales',
                    tipo: 'checkbox',
                    opciones: [
                        { texto: 'Con Helado de Vainilla', extraCost: 20 },
                        { texto: 'Chispas de Chocolate', extraCost: 10 },
                        { texto: 'Cereza Extra', extraCost: 5 }
                    ]
                }
            ]
        };
    }

    // Default fallback (Platillos Principales genéricos)
    return {
        placeholderNota: 'Ej: Sin condimentos, término especial...',
        grupos: [
            {
                titulo: 'Especificaciones',
                tipo: 'radio',
                nombreInput: 'general-prep',
                opciones: [
                    { texto: 'Normal', extraCost: 0, checked: true },
                    { texto: 'Porción Extra', extraCost: 30 }
                ]
            }
        ]
    };
}

function crearElementosOpciones(datosOpciones, contenedor) {
    datosOpciones.grupos.forEach(grupo => {
        const seccion = document.createElement('section');
        seccion.className = 'option-group';
        
        const titulo = document.createElement('h3');
        titulo.innerText = grupo.titulo;
        seccion.appendChild(titulo);

        const lista = document.createElement('div');
        lista.className = 'options-list';

        grupo.opciones.forEach(opt => {
            const label = document.createElement('label');
            label.className = 'option-item';

            const input = document.createElement('input');
            input.type = grupo.tipo;
            input.name = grupo.tipo === 'radio' ? grupo.nombreInput : '';
            input.value = opt.texto;
            if (opt.checked) input.checked = true;
            input.setAttribute('data-extra-cost', opt.extraCost);

            const span = document.createElement('span');
            const textoPrecio = opt.extraCost > 0 ? ` (+C$${opt.extraCost})` : '';
            span.innerText = `${opt.texto}${textoPrecio}`;

            label.appendChild(span);
            label.appendChild(input);
            lista.appendChild(label);
        });

        seccion.appendChild(lista);
        contenedor.appendChild(seccion);
    });

    const seccionNota = document.createElement('div');
    seccionNota.className = 'option-group';
    const tituloNota = document.createElement('h3');
    tituloNota.innerText = 'Notas adicionales';
    seccionNota.appendChild(tituloNota);
    
    const textarea = document.createElement('textarea');
    textarea.className = 'custom-note';
    textarea.id = 'nota-adicional';
    textarea.placeholder = datosOpciones.placeholderNota;
    seccionNota.appendChild(textarea);
    
    contenedor.appendChild(seccionNota);
}

function actualizarPrecio() {
    let extra = 0;
    const marcados = document.querySelectorAll('#opciones-contenedor input:checked');
    
    marcados.forEach(input => {
        extra += Number(input.getAttribute('data-extra-cost') || 0);
    });

    precioTotalActual = precioBase + extra;
    document.getElementById('platillo-precio').innerText = `C$ ${precioTotalActual}`;

    const btnConfirmar = document.getElementById('btn-confirmar-personalizacion');
    if (btnConfirmar) {
        btnConfirmar.innerText = `Confirmar (C$${precioTotalActual})`;
    }
}

function agregarAlCarrito() {
    if (!platilloActual) return;

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const opcionesSeleccionadas = [];
    
    const grupos = document.querySelectorAll('.option-group');
    grupos.forEach(grupo => {
        const tituloElem = grupo.querySelector('h3');
        if (!tituloElem || tituloElem.innerText === 'Notas adicionales') return;
        
        const marcados = grupo.querySelectorAll('input:checked');
        if (marcados.length > 0) {
            if (marcados.length === 1 && marcados[0].type === 'radio') {
                opcionesSeleccionadas.push({
                    grupo: tituloElem.innerText,
                    seleccion: marcados[0].value
                });
            } else {
                const valores = Array.from(marcados).map(input => input.value);
                opcionesSeleccionadas.push({
                    grupo: tituloElem.innerText,
                    seleccion: valores
                });
            }
        }
    });

    const nota = document.getElementById('nota-adicional')?.value.trim() || '';

    carrito.push({
        cartItemId: `custom_${platilloActual.platilloID}_${Date.now()}`,
        platilloID: platilloActual.platilloID,
        nombre: platilloActual.nombre,
        imagenBase64: platilloActual.imagenBase64,
        precioBase: precioBase,
        precioFinal: precioTotalActual,
        cantidad: 1,
        categoriaID: platilloActual.categoriaID,
        personalizacion: {
            opciones: opcionesSeleccionadas,
            nota: nota
        }
    });

    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.location.href = 'carrito.html';
}