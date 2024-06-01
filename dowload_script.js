// Función para esperar un tiempo determinado
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para esperar hasta que el contenido se haya cargado
async function waitForContentLoad() {
    const contentSelector = '#BeForm\\:BarTable_data';
    let contentLoaded = false;

    while (!contentLoaded) {
        await sleep(500); // Espera medio segundo entre verificaciones
        const contentElement = document.querySelector(contentSelector);
        if (contentElement && contentElement.children.length > 0) {
            contentLoaded = true;
        }
    }
}

// Función para extraer datos de la tabla
function extractTableData() {
    const tableRows = document.querySelectorAll('#BeForm\\:BarTable_data tr');
    const data = [];

    tableRows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            rowData.push(cell.innerText.trim());
        });
        data.push(rowData);
    });

    return data;
}

// Función para convertir datos a CSV
function dataToCSV(dataByYear) {
    let csvContent = 'Año;AMBOS 0-0;AMBOS 1-1;AMBOS 2-3;AMBOS 4-5;AMBOS 6-7;AMBOS 8-9;AMBOS 10-11;AMBOS 12-13;AMBOS 14-18;HOMBRES 0-0;HOMBRES 1-1;HOMBRES 2-3;HOMBRES 4-5;HOMBRES 6-7;HOMBRES 8-9;HOMBRES 10-11;HOMBRES 12-13;HOMBRES 14-18;MUJERES 0-0;MUJERES 1-1;MUJERES 2-3;MUJERES 4-5;MUJERES 6-7;MUJERES 8-9;MUJERES 10-11;MUJERES 12-13;MUJERES 14-18\n';

    for (const year in dataByYear) {
        const yearData = dataByYear[year];
        const rowData = yearData.map(row => row.join(';')).join('\n');
        csvContent += `${year}\n${rowData}\n`;
    }

    return csvContent;
}

// Función para descargar datos como CSV
function downloadCSV(dataByYear, filename) {
    const csvContent = dataToCSV(dataByYear);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Función principal para cambiar de año, extraer datos y descargar CSV
async function collectDataForYears() {
    const dataByYear = {};

    for (let i = 0; i < document.querySelector('#BeForm\\:YearSelector_input').options.length; i++) {
        // Re-seleccionar yearSelector en cada iteración
        const yearSelector = document.querySelector('#BeForm\\:YearSelector_input');
        yearSelector.selectedIndex = i;
        const event = new Event('change', { bubbles: true });
        yearSelector.dispatchEvent(event);

        console.log(`Cambiado a ${yearSelector.options[i].text}`); // Añadir un log para ver el cambio

        // Espera un breve momento para asegurarse de que el cambio se procese
        await sleep(500);

        // Espera hasta que el contenido se haya cargado
        await waitForContentLoad();

        // Extrae los datos de la tabla
        const tableData = extractTableData();
        dataByYear[yearSelector.options[i].value] = tableData;

        console.log(`Datos extraídos para el año ${yearSelector.options[i].text}`); // Añadir un log para ver los datos extraídos
    }

    // Descargar el CSV con los datos de todos los años
    downloadCSV(dataByYear, 'data_by_year.csv');
}

// Ejecutar la función
collectDataForYears();

