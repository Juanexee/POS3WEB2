// shared/models/Mesa.js

export class Mesa {
    #mesaID;
    #numeroMesa;
    #capacidad;
    #ubicacion;
    #estado;
    #activo;

    constructor(data = {}) {
        this.#mesaID = data.mesaID || data.MesaID || 0;
        this.#numeroMesa = data.numero_mesa || data.numeroMesa || data.NumeroMesa || 0;
        this.#capacidad = data.capacidad || data.Capacidad || 4;
        this.#ubicacion = data.ubicacion || data.Ubicacion || '';
        this.#estado = data.estado || data.Estado || 'Disponible';
        this.#activo = data.activo !== undefined ? data.activo : true;
    }

    // Getters
    get mesaID() { return this.#mesaID; }
    get numeroMesa() { return this.#numeroMesa; }
    get capacidad() { return this.#capacidad; }
    get ubicacion() { return this.#ubicacion; }
    get estado() { return this.#estado; }
    get activo() { return this.#activo; }
    
    // Propiedades calculadas
    get estaDisponible() { return this.#estado === 'Disponible' || this.#estado === 'LIBRE'; }
    get estaOcupada() { return this.#estado === 'Ocupada' || this.#estado === 'OCUPADA'; }

    // Validación
    validar() {
        const errores = [];
        if (!this.#numeroMesa || this.#numeroMesa <= 0) {
            errores.push('El número de mesa es requerido y debe ser positivo');
        }
        if (!this.#capacidad || this.#capacidad <= 0) {
            errores.push('La capacidad debe ser mayor a 0');
        }
        return { valido: errores.length === 0, errores };
    }

    toJSON() {
        return {
            mesaID: this.#mesaID,
            numero_mesa: this.#numeroMesa,
            capacidad: this.#capacidad,
            ubicacion: this.#ubicacion,
            estado: this.#estado,
            activo: this.#activo
        };
    }
}