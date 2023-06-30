// popup.js

function extractNumericValue(valueWithUnits) {
    const numericValue = parseFloat(valueWithUnits);
    return isNaN(numericValue) ? 0 : numericValue;
}

function formatMemoryValue(memoryWithUnits) {
    const memoryInKB = extractNumericValue(memoryWithUnits);
    const memoryInMB = memoryInKB / 1024;
    return memoryInMB.toFixed(2) + " MB";
}

// Make an AJAX request to the router's API endpoint
fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=tz_dynamic_info")
    .then(response => response.json())
    .then(data => {
        // Update the popup menu with the received information
        var infoContainer = document.getElementById("info-container");
        if (infoContainer) {
            infoContainer.innerHTML = `Total Memory: ${formatMemoryValue(data.mem_total)}<br>
                                   Free Memory: ${formatMemoryValue(data.mem_free)}<br>
                                   Cached Memory: ${formatMemoryValue(data.mem_cached)}<br>
                                   Active Memory: ${formatMemoryValue(data.mem_active)}<br>
                                   CPU Usage: ${data.tz_cpu_usage}`;
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });