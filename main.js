// DOM
const form = document.getElementById('finanzas-form');
const descripcionInput = document.getElementById('descripcion');
const montoInput = document.getElementById('monto');
const resultadosDiv = document.getElementById('resultados');
const historialDiv = document.getElementById('historial');
const eliminarUltimoBoton = document.getElementById('eliminar-ultimo');

// iniciar estructuras de datos para almacenar por día y semana
const transaccionesPorDia = {};
const transaccionesPorSemana = {};
const transacciones = []; ciones

// Evento al enviar el formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descripcion = descripcionInput.value;
    const monto = parseFloat(montoInput.value);
    const fechaActual = new Date();
    const diaActual = fechaActual.toLocaleDateString(); // Obtener la fecha actual como un string (formato: MM/DD/YYYY)
    const semanaActual = obtenerSemanaDelAnio(fechaActual);

    // Agregar transacción al arreglo
    if (descripcion && monto) {
        const transaccion = { descripcion, monto, fecha: fechaActual };
        transacciones.push(transaccion);


        agruparTransaccionPorDia(transaccion, diaActual);
        agruparTransaccionPorSemana(transaccion, semanaActual);


        guardarTransacciones();
        guardarTransaccionesEnJSON();


        actualizarResultados();
        mostrarHistorial();
    }
});

// Función para agrupar una transacción por día
function agruparTransaccionPorDia(transaccion, dia) {
    if (!transaccionesPorDia[dia]) {
        transaccionesPorDia[dia] = [];
    }
    transaccionesPorDia[dia].push(transaccion);
}

// Función para agrupar una transacción por semana
function agruparTransaccionPorSemana(transaccion, semana) {
    if (!transaccionesPorSemana[semana]) {
        transaccionesPorSemana[semana] = [];
    }
    transaccionesPorSemana[semana].push(transaccion);
}

// Función para obtener el número de semana del año
function obtenerSemanaDelAnio(fecha) {
    const fechaInicio = new Date(fecha.getFullYear(), 0, 1);
    const diferencia = fecha - fechaInicio;
    const unaSemanaEnMillisegundos = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diferencia / unaSemanaEnMillisegundos);
}

// Función para guardar transacciones en localStorage
function guardarTransacciones() {
    localStorage.setItem('transacciones', JSON.stringify(transacciones));
}

// Función para cargar transacciones desde localStorage al cargar la página
function obtenerTransaccionesGuardadas() {
    const storedTransacciones = localStorage.getItem('transacciones');
    return storedTransacciones ? JSON.parse(storedTransacciones) : [];
}

// Función para guardar transacciones en un archivo JSON
function guardarTransaccionesEnJSON() {
    const transaccionesJSON = JSON.stringify(transacciones);
    const blob = new Blob([transaccionesJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial.json';
    a.click();
}

// Función para actualizar los resultados en el DOM
function actualizarResultados() {
    resultadosDiv.innerHTML = '';

    let totalIngresos = 0;
    let totalEgresos = 0;

    transacciones.forEach((transaccion) => {
        if (transaccion.monto > 0) {
            totalIngresos += transaccion.monto;
        } else {
            totalEgresos += Math.abs(transaccion.monto);
        }
    });

    resultadosDiv.innerHTML = `
        <p>Total Ingresos: $${totalIngresos.toFixed(2)}</p>
        <p>Total Egresos: $${totalEgresos.toFixed(2)}</p>
    `;
}

// Función para mostrar el historial de transacciones
function mostrarHistorial() {
    historialDiv.innerHTML = '';

    //  días
    for (const dia in transaccionesPorDia) {
        historialDiv.innerHTML += `<h2>${dia}</h2>`;
        transaccionesPorDia[dia].forEach((transaccion) => {
            const tipo = transaccion.monto > 0 ? 'Ingreso' : 'Egreso';
            historialDiv.innerHTML += `<p>${tipo}: ${transaccion.descripcion} ($${transaccion.monto.toFixed(2)})</p>`;
        });
    }

    // semanas
    for (const semana in transaccionesPorSemana) {
        historialDiv.innerHTML += `<h2>Semana ${semana}</h2>`;
        transaccionesPorSemana[semana].forEach((transaccion) => {
            const tipo = transaccion.monto > 0 ? 'Ingreso' : 'Egreso';
            historialDiv.innerHTML += `<p>${tipo}: ${transaccion.descripcion} ($${transaccion.monto.toFixed(2)})</p>`;
        });
    }
}

// Evento "Eliminar ultimo Gasto"
eliminarUltimoBoton.addEventListener('click', () => {
    if (transacciones.length > 0) {
        const transaccionEliminada = transacciones.pop();
        const diaDeTransaccion = transaccionEliminada.fecha.toLocaleDateString();
        const semanaDeTransaccion = obtenerSemanaDelAnio(transaccionEliminada.fecha);


        if (transaccionesPorDia[diaDeTransaccion]) {
            transaccionesPorDia[diaDeTransaccion].pop();
        }
        if (transaccionesPorSemana[semanaDeTransaccion]) {
            transaccionesPorSemana[semanaDeTransaccion].pop();
        }

        guardarTransacciones();
        guardarTransaccionesEnJSON();
        actualizarResultados();
        mostrarHistorial();
    }
});



actualizarResultados();
mostrarHistorial();
