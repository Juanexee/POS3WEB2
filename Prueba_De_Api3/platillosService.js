// Archivo: platillosService.js

// Función para traer todos los platillos de la API
export async function obtenerPlatillos() {
    try {
        const respuesta = await fetch('https://localhost:7081/Platillo/Leer');
        
        if (respuesta.ok === false) {
            console.log('No se pudo conectar con la API');
            return [];
        }
        
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.log("Error al cargar los platillos de la base de datos:", error);
        return [];
    }
}

// Función para buscar un solo platillo por su ID para el detalle
export async function obtenerPlatilloPorId(id) {
    const url = `https://localhost:7081/Platillo/${id}`;
    
    try {
        const respuesta = await fetch(url);
        
        if (respuesta.ok === false) {
            console.log("Error en la respuesta del servidor:", respuesta.status);
            return null;
        }
        
        const platillo = await respuesta.json();
        return platillo;
    } catch (error) {
        console.log("Hubo un error al buscar el platillo:", error);
        return null;
    }
}