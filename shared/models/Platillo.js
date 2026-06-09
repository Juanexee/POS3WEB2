// shared/models/Platillo.js

export class Platillo {
    #platilloID;
    #nombre;
    #descripcion;
    #precio;
    #categoriaID;
    #nombreCategoria;
    #disponible;
    #imagenBase64;

    constructor(data = {}) {
        this.#platilloID = data.platilloID || data.PlatilloID || 0;
        this.#nombre = data.nombre || data.Nombre || '';
        this.#descripcion = data.descripcion || data.Descripcion || '';
        this.#precio = Number(data.precio || data.Precio || 0);
        this.#categoriaID = data.categoriaID || data.CategoriaID || 0;
        this.#nombreCategoria = data.nombreCategoria || data.NombreCategoria || '';
        this.#disponible = data.disponible !== undefined ? data.disponible : true;
        this.#imagenBase64 = data.imagenBase64 || '';
    }

    // Getters
    get platilloID() { return this.#platilloID; }
    get nombre() { return this.#nombre; }
    get descripcion() { return this.#descripcion; }
    get precio() { return this.#precio; }
    get categoriaID() { return this.#categoriaID; }
    get nombreCategoria() { return this.#nombreCategoria; }
    get disponible() { return this.#disponible; }
    get imagenBase64() { return this.#imagenBase64; }

    // Método para formatear precio
    get precioFormateado() {
        return `C$ ${this.#precio.toFixed(2)}`;
    }

    // Validación
    validar() {
        const errores = [];
        if (!this.#nombre) errores.push('Nombre del platillo es requerido');
        if (this.#precio <= 0) errores.push('El precio debe ser mayor a 0');
        if (!this.#categoriaID) errores.push('La categoría es requerida');
        return { valido: errores.length === 0, errores };
    }

    // Clonar platillo (para personalizaciones)
    clonar() {
        return new Platillo({
            platilloID: this.#platilloID,
            nombre: this.#nombre,
            descripcion: this.#descripcion,
            precio: this.#precio,
            categoriaID: this.#categoriaID,
            nombreCategoria: this.#nombreCategoria,
            imagenBase64: this.#imagenBase64
        });
    }

    toJSON() {
        return {
            platilloID: this.#platilloID,
            nombre: this.#nombre,
            descripcion: this.#descripcion,
            precio: this.#precio,
            categoriaID: this.#categoriaID,
            disponible: this.#disponible
        };
    }
}