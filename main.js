// DOM
const form = document.getElementById('finanzas-form');
const descripcionInput = document.getElementById('descripcion');
const montoInput = document.getElementById('monto');
const resultadosDiv = document.getElementById('resultados');
const historialDiv = document.getElementById('historialDiv');
const eliminarUltimoBoton = document.getElementById('eliminar-ultimo');
const eliminarHistorialBoton = document.getElementById('eliminar-historial');

// Iniciar estructuras para almacenar transacciones por día y semana
let transaccionesPorDia = {};
let transaccionesPorSemana = {};

// Función para agrupar transacción por día
function agruparTransaccionPorDia(transaccion, dia) {
    if (!transaccionesPorDia[dia]) {
        transaccionesPorDia[dia] = [];
    }

    transaccionesPorDia[dia].push(transaccion);
}
// Función para agrupar transacción por semana
function agruparTransaccionPorSemana(transaccion, semana) {
    if (!transaccionesPorSemana[semana]) {
        transaccionesPorSemana[semana] = [];
    }

    transaccionesPorSemana[semana].push(transaccion);
}
// Cargar las transacciones desde el localStorage
let transacciones = obtenerTransaccionesGuardadas();

// Variables para la suma total de ingresos y egresos
let totalIngresos = 0;
let totalEgresos = 0;

// Evento al enviar el formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Toastify({
        text: "El gasto se agrego correctamente",
        duration: 3000
    }).showToast();

    const descripcion = descripcionInput.value;
    const monto = parseFloat(montoInput.value);
    const fechaActual = new Date();
    const diaActual = fechaActual.toLocaleDateString();
    const semanaActual = obtenerSemanaDelAnio(fechaActual);

    if (descripcion && monto) {
        const transaccion = { descripcion, monto, fecha: fechaActual };

        try {
            await enviarTransaccionAlServidor(transaccion);

            transacciones.push(transaccion);

            // Agrupar transacción por día y semana
            agruparTransaccionPorDia(transaccion, diaActual);
            agruparTransaccionPorSemana(transaccion, semanaActual);

            actualizarSumasTotales();

            actualizarResultados();
            mostrarHistorial();
        } catch (error) {
            console.error('Error al enviar transacción al servidor:', error);
        }
    }
});

// Función para enviar transacción al servidor usando Fetch
async function enviarTransaccionAlServidor(transaccion) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaccion),
        });

        if (!response.ok) {
            throw new Error(`Error al enviar la transacción al servidor: ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Error al enviar la transacción al servidor: ${error.message}`);
    }
}
// Para obtener la semana del año en milisegundos 
function obtenerSemanaDelAnio(fecha) {
    const fechaInicio = new Date(fecha.getFullYear(), 0, 1);
    const diff = fecha - fechaInicio;
    const unaSemanaEnMillis = 604800000; // 7 días en milisegundos
    return Math.ceil((diff + 1) / unaSemanaEnMillis);
}


// Función para reagrupar las transacciones por día y semana
function reagruparTransacciones() {
    transaccionesPorDia = {};
    transaccionesPorSemana = {};

    transacciones.forEach((transaccion) => {
        const dia = transaccion.fecha.toLocaleDateString();
        const semana = obtenerSemanaDelAnio(transaccion.fecha);

        agruparTransaccionPorDia(transaccion, dia);
        agruparTransaccionPorSemana(transaccion, semana);
    });
}

// Función para actualizar las sumas totales
function actualizarSumasTotales() {
    totalIngresos = 0;
    totalEgresos = 0;

    transacciones.forEach((transaccion) => {
        if (transaccion.monto > 0) {
            totalIngresos += transaccion.monto;
        } else {
            totalEgresos += Math.abs(transaccion.monto);
        }
    });
}
// Evento Eliminar último Gasto
eliminarUltimoBoton.addEventListener('click', () => {
    Toastify({
        text: "Se eliminó el ultimo gasto correctamente",
        duration: 3000
    }).showToast();
    eliminarUltimaTransaccion();
    mostrarHistorial();
});


// Función para guardar transacciones en el localStorage
function guardarTransacciones() {
    localStorage.setItem('transacciones', JSON.stringify(transacciones));
}

// Función para cargar transacciones desde el localStorage al cargar la página
function obtenerTransaccionesGuardadas() {
    const storedTransacciones = localStorage.getItem('transacciones');
    return storedTransacciones ? JSON.parse(storedTransacciones) : [];
}

// Función para actualizar los resultados en el DOM
function actualizarResultados() {
    resultadosDiv.innerHTML = '';
    
    let totalIngresosLocal = 0;
    let totalEgresosLocal = 0;
    
    transacciones.forEach((transaccion) => {
        if (transaccion.monto > 0) {
            totalIngresosLocal += transaccion.monto;
        } else {
            totalEgresosLocal += Math.abs(transaccion.monto);
        }
    });
    
    resultadosDiv.innerHTML = `
    <p>Total Ingresos: $${totalIngresosLocal.toFixed(2)}</p>
    <p>Total Egresos: $${totalEgresosLocal.toFixed(2)}</p>
    `;
}

// Función para cargar transacciones desde el servidor usando Fetch
async function cargarTransaccionesDesdeServidor() {
    try {
        const response = await fetch('Localhost 3000');
        const data = await response.json();

        // Reemplazar las transacciones locales con los datos del servidor
        transacciones = data;
        
        // Agrupar las transacciones por día y semana
        reagruparTransacciones();
        
        // Actualizar resultados e historial
        actualizarResultados();
        mostrarHistorial();
    } catch (error) {
        console.error('Error al cargar transacciones desde el servidor:', error);
    }
}

// Función mostrar el historial de transacciones
function mostrarHistorial() {
    historialDiv.innerHTML = '';
    
    // días
    for (const dia in transaccionesPorDia) {
        historialDiv.innerHTML += `<h4>${dia}</h4>`;
        transaccionesPorDia[dia].forEach((transaccion) => {
            const tipo = transaccion.monto > 0 ? 'Ingreso' : 'Egreso';
            historialDiv.innerHTML += `<p>${tipo}: ${transaccion.descripcion} ($${transaccion.monto.toFixed(2)})</p>`;
        });
    }
    
    // semanas
    for (const semana in transaccionesPorSemana) {
        historialDiv.innerHTML += `<h4>Semana ${semana}</h4>`;
        transaccionesPorSemana[semana].forEach((transaccion) => {
            const tipo = transaccion.monto > 0 ? 'Ingreso' : 'Egreso';
            historialDiv.innerHTML += `<p>${tipo}: ${transaccion.descripcion} ($${transaccion.monto.toFixed(2)})</p>`;
        });
    }
}
// Función para eliminar la última transacción ingresada
function eliminarUltimaTransaccion() {
    if (transacciones.length > 0) {
        const ultimaTransaccion = transacciones.pop();

        // Restar el monto de la última transacción de las sumas totales
        restarMontoDeSumasTotales(ultimaTransaccion);

        // Actualizar resultados y mostrar historial
        guardarTransacciones();
        actualizarResultados();
        mostrarHistorial();
        // Eliminar la última transacción del DOM
        eliminarUltimaTransaccionDelDOM();
    }
}
function eliminarUltimaTransaccionDelDOM() {
    // Obtener todos los párrafos dentro de historialDiv
    const transaccionesDOM = historialDiv.querySelectorAll('p');

    // Verificar si hay transacciones a eliminar
    if (transaccionesDOM.length > 0) {
        // Seleccionar y eliminar el último párrafo (última transacción)
        const ultimaTransaccionDOM = transaccionesDOM[transaccionesDOM.length - 1];
        ultimaTransaccionDOM.remove();
    }
}
// Función para restar el monto de la transacción eliminada de las sumas totales
function restarMontoDeSumasTotales(transaccion) {
    if (transaccion.monto > 0) {
        totalIngresos -= transaccion.monto;
    } else {
        totalEgresos -= Math.abs(transaccion.monto);
    }
}
// Evento Eliminar historial
eliminarHistorialBoton.addEventListener('click', () => {
    eliminarHistorial();
});
// Función para eliminar el historial completo
function eliminarHistorial() {
    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        html: 'Se eliminará todo el historial',
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'SI',
        cancelButtonText: 'NO',
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar el historial en el DOM
            historialDiv.innerHTML = '';

            // Limpiar el historial en las estructuras de datos
            transacciones.length = 0;
            transaccionesPorDia = {};
            transaccionesPorSemana = {};
        }
    });
    // Guardar los cambios
    guardarTransacciones();
    actualizarResultados();
}

// Función para eliminar transacción en el servidor usando Fetch
async function eliminarTransaccionEnServidor(transaccion) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaccion),
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar la transacción en el servidor: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error en eliminarTransaccionEnServidor:', error);
        throw error;
    }
}

// Función para guardar todas las transacciones en un archivo JSON
function guardarTodasLasTransaccionesEnJSON() {
    const transaccionesJSON = JSON.stringify(transacciones);
    const blob = new Blob([transaccionesJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todas_las_transacciones.json';
    a.click();
}

// Cargar las transacciones iniciales al cargar la página
actualizarResultados();
mostrarHistorial();
