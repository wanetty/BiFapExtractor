chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'collectDataForYears') {
        collectDataForYears();
        console.log('Data collection started');
        sendResponse({result: 'success'});
    }
});

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

// Función para extraer datos de la tabla principal
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

// Función para extraer datos de la primera tabla adicional
function extractPrevTableData() {
    const tableRows = document.querySelectorAll('#BeForm\\:PrevTable_data tr');
    const data = [];

    tableRows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            let cellText = cell.innerText.trim();
            if (/\d+-\d+/.test(cellText)) { // Agregar apóstrofe para valores como "0-0", "1-1", etc.
                cellText = `'${cellText}`;
            }
            rowData.push(cellText);
        });
        data.push(rowData);
    });

    return data;
}

// Función para extraer datos de la segunda tabla adicional
function extractPrevLeftTableData() {
    const tableRows = document.querySelectorAll('#BeForm\\:PrevLeftTable_data tr');
    const data = [];

    tableRows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            let cellText = cell.innerText.trim();
            if (/\d+-\d+/.test(cellText)) { // Agregar apóstrofe para valores como "0-0", "1-1", etc.
                cellText = `'${cellText}`;
            }
            rowData.push(cellText);
        });
        data.push(rowData);
    });

    return data;
}

// Función para convertir datos a CSV
function dataToCSV(dataByYear, prevTableData, prevLeftTableData) {
    let csvContent = 'edad;0-0 años ;1-1 años;2-3 años;4-5 años;6-7 años;8-9 años;10-11 años;12-13 años;14-18 años\n';

    for (const year in dataByYear) {
        const yearData = dataByYear[year];
        const rowData = yearData.map(row => row.join(';')).join('\n');
        csvContent += `${year}\n${rowData}\n`;
    }

    csvContent += '\nEvolución de la utilización.';
    csvContent += '\nPeriodo;2013;2014;2015;2016;2017;2018;2019;2020;2021\n';
    prevTableData.forEach(row => {
        csvContent += row.join(';') + '\n';
    });

    csvContent += '\nEvolución de la utilización en Todo BiFap estatificada - Ambos sexos.\n';
    csvContent += '\nRango;2013;2014;2015;2016;2017;2018;2019;2020;2021\n';
    prevLeftTableData.forEach(row => {
        csvContent += row.join(';') + '\n';
    });

    return csvContent;
}

// Función para descargar el archivo CSV
function downloadCSV(dataByYear) {
    // Obtener el texto del elemento span
    const spanText = document.querySelector('span.w-6').textContent;
    // Buscar la palabra que empieza con "A11"
    const regex = /A11\w+/;
    const match = spanText.match(regex);
    // Extraer el nombre del archivo o asignar un nombre predeterminado
    const fileName = match ? match[0].toLowerCase() + '.csv' : 'datos.csv';

    // Extraer datos de las tablas adicionales
    const prevTableData = extractPrevTableData();
    const prevLeftTableData = extractPrevLeftTableData();

    // Convertir los datos a CSV
    const csvContent = dataToCSV(dataByYear, prevTableData, prevLeftTableData);

    // Crear un objeto Blob para el contenido CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Crear un objeto URL para el Blob
    const url = URL.createObjectURL(blob);

    // Crear un enlace <a> para iniciar la descarga
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName); // Asignar el nombre de archivo al enlace
    link.style.visibility = 'hidden';
    document.body.appendChild(link);

    // Simular el clic en el enlace para iniciar la descarga
    link.click();

    // Limpiar el objeto URL y el enlace después de la descarga
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
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
        await sleep(1500);

        // Espera hasta que el contenido se haya cargado
        await waitForContentLoad();

        // Extrae los datos de la tabla
        const tableData = extractTableData();
        dataByYear[yearSelector.options[i].value] = tableData;

        console.log(`Datos extraídos para el año ${yearSelector.options[i].text}`); // Añadir un log para ver los datos extraídos
    }

    // Descargar el CSV con los datos de todos los años y las tablas adicionales
    downloadCSV(dataByYear);
}
