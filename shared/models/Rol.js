// shared/models/Rol.js

export class Rol {
    #rolID;
    #nombreRol;
    #descripcionRol;
    #activo;

    constructor(data = {}) {
        this.#rolID = data.rolID || data.RolID || 0;
        this.#nombreRol = data.nombreRol || data.NombreRol || '';
        this.#descripcionRol = data.descripcionRol || data.DescripcionRol || '';
        this.#activo = data.activo !== undefined ? data.activo : true;
    }

    // Getters
    get rolID() { return this.#rolID; }
    get nombreRol() { return this.#nombreRol; }
    get descripcionRol() { return this.#descripcionRol; }
    get activo() { return this.#activo; }

    // Setters
    set nombreRol(valor) {
        if (!valor || valor.trim() === '') {
            throw new Error('El nombre del rol es requerido');
        }
        this.#nombreRol = valor.trim();
    }

    // Validación
    validar() {
        const errores = [];
        if (!this.#nombreRol || this.#nombreRol.trim() === '') {
            errores.push('El nombre del rol es requerido');
        }
        return { valido: errores.length === 0, errores };
    }

    toJSON() {
        return {
            rolID: this.#rolID,
            nombreRol: this.#nombreRol,
            descripcionRol: this.#descripcionRol,
            activo: this.#activo
        };
    }
}