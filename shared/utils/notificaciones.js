// shared/utils/notificaciones.js

/**
 * Muestra una notificación temporal en la pantalla
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - 'success', 'error', 'warning', 'info'
 * @param {number} duracion - Tiempo en milisegundos (default 3000)
 */
export function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    const notificacion = document.createElement('div');
    
    let icono = 'ℹ️';
    let color = '#17a2b8';
    
    switch (tipo) {
        case 'success':
            icono = '✅';
            color = '#28a745';
            break;
        case 'error':
            icono = '❌';
            color = '#dc3545';
            break;
        case 'warning':
            icono = '⚠️';
            color = '#ffc107';
            break;
        default:
            icono = 'ℹ️';
            color = '#17a2b8';
    }
    
    notificacion.innerHTML = `${icono} ${mensaje}`;
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: ${color};
        color: ${tipo === 'warning' ? '#333' : 'white'};
        border-radius: 8px;
        z-index: 1100;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
        animation: slideInNotification 0.3s ease;
        font-size: 14px;
    `;
    
    // Agregar estilos de animación si no existen
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInNotification {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutNotification {
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
    }
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutNotification 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, duracion);
}