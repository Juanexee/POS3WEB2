// shared/models/Categoria.js
export const BASE_URL = "https://backend.rancholamimi.com:7081";

export class Categoria {
    #categoriaID;
    #nombre;
    #activo;

    constructor(data = {}) {
        this.#categoriaID = data.categoriaID || data.CategoriaID || 0;
        this.#nombre = data.nombre || data.Nombre || '';
        this.#activo = data.activo !== undefined ? data.activo : true;
    }

    // Getters
    get categoriaID() { return this.#categoriaID; }
    get nombre() { return this.#nombre; }
    get activo() { return this.#activo; }

    // Setters con validación
    set nombre(valor) {
        if (!valor || valor.trim() === '') {
            throw new Error('El nombre de la categoría no puede estar vacío');
        }
        this.#nombre = valor.trim();
    }

    // Validación
    validar() {
        const errores = [];
        if (!this.#nombre || this.#nombre.trim() === '') {
            errores.push('El nombre de la categoría es requerido');
        }
        return { valido: errores.length === 0, errores };
    }

    toJSON() {
        return {
            categoriaID: this.#categoriaID,
            nombre: this.#nombre,
            activo: this.#activo
        };
    }
}