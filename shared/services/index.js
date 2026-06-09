// shared/services/index.js

// Servicio base
export { default as HttpService } from './HttpService.js';

// Servicios específicos
export { default as AuthService } from './authService.js';
export { default as CategoriaService } from './categoriaService.js';
export { default as MesaService } from './mesaService.js';
export { default as PersonalService } from './personalService.js';
export { default as PlatilloService } from './platilloService.js';
export { default as RolService } from './rolService.js';
export { default as SesionService } from './SesionService.js';
export { default as VentaService } from './ventaService.js';

// Exportaciones directas de funciones (para compatibilidad)
export { 
    login, 
    guardarSesion, 
    cerrarSesion, 
    estaAutenticado, 
    obtenerUsuarioActual 
} from './authService.js';

// Configuración
export { BASE_URL } from './config.js';