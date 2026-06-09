// shared/models/PedidoAgrupado.js

export class PedidoAgrupado {
    #nombrePlatillo;
    #cantidadTotal;
    #fechaPrimerPedido;
    #idsRelacionados;
    #tiempoEspera;

    constructor(data = {}) {
        this.#nombrePlatillo = data.nombrePlatillo || '';
        this.#cantidadTotal = data.cantidadTotal || 0;
        this.#fechaPrimerPedido = data.fechaPrimerPedido ? new Date(data.fechaPrimerPedido) : new Date();
        this.#idsRelacionados = data.idsRelacionados || '';
        this.#tiempoEspera = data.tiempoEspera || this.#calcularTiempoEspera();
    }

    get nombrePlatillo() { return this.#nombrePlatillo; }
    get cantidadTotal() { return this.#cantidadTotal; }
    get fechaPrimerPedido() { return this.#fechaPrimerPedido; }
    get idsRelacionados() { return this.#idsRelacionados; }
    get tiempoEspera() { return this.#tiempoEspera; }

    #calcularTiempoEspera() {
        const ahora = new Date();
        const diffMin = Math.floor((ahora - this.#fechaPrimerPedido) / 60000);
        
        if (diffMin < 1) return `${Math.floor((ahora - this.#fechaPrimerPedido) / 1000)} seg`;
        if (diffMin < 60) return `${diffMin} min`;
        return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
    }

    get nivelAlerta() {
        const ahora = new Date();
        const diffMin = Math.floor((ahora - this.#fechaPrimerPedido) / 60000);
        if (diffMin > 20) return 'alerta-roja';
        if (diffMin > 10) return 'alerta-amarilla';
        return 'alerta-verde';
    }

    toJSON() {
        return {
            nombrePlatillo: this.#nombrePlatillo,
            cantidadTotal: this.#cantidadTotal,
            fechaPrimerPedido: this.#fechaPrimerPedido,
            idsRelacionados: this.#idsRelacionados,
            tiempoEspera: this.#tiempoEspera
        };
    }
}