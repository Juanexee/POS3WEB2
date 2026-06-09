// shared/models/Usuario.js

export class Usuario {
    // Propiedades privadas
    #usuarioID;
    #nombreUsuario;
    #nombre;
    #rolID;
    #rolNombre;
    #activo;

    constructor(data = {}) {
        this.#usuarioID = data.usuarioID || data.UsuarioID || 0;
        this.#nombreUsuario = data.nombreUsuario || data.NombreUsuario || '';
        this.#nombre = data.nombre || data.Nombre || '';
        this.#rolID = data.rolID || data.RolID || 0;
        this.#rolNombre = data.nombreRol || data.NombreRol || '';
        this.#activo = data.activo !== undefined ? data.activo : true;
    }

    // Getters
    get usuarioID() { return this.#usuarioID; }
    get nombreUsuario() { return this.#nombreUsuario; }
    get nombre() { return this.#nombre; }
    get rolID() { return this.#rolID; }
    get rolNombre() { return this.#rolNombre; }
    get activo() { return this.#activo; }

    // Métodos útiles
    esAdministrador() {
        return this.#rolNombre.toLowerCase() === 'administrador';
    }

    esCajero() {
        return this.#rolNombre.toLowerCase() === 'cajero';
    }

    esMesero() {
        return this.#rolNombre.toLowerCase() === 'mesero';
    }

    // Método para validar el usuario
    validar() {
        const errores = [];
        if (!this.#nombreUsuario) errores.push('Nombre de usuario es requerido');
        if (!this.#nombre) errores.push('Nombre completo es requerido');
        return { valido: errores.length === 0, errores };
    }

    // Convertir a JSON para enviar a la API
    toJSON() {
        return {
            usuarioID: this.#usuarioID,
            nombreUsuario: this.#nombreUsuario,
            nombre: this.#nombre,
            rolID: this.#rolID,
            activo: this.#activo
        };
    }
}