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

// Make an AJAX request to check login status
fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=loginfo")
    .then(response => response.json())
    .then(data => {
        if (data.loginfo === "ok") {
            // Make another AJAX request to retrieve memory information
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
                    console.error("Error fetching memory data:", error);
                });
        } else {
            var infoContainer = document.getElementById("info-container");
            if (infoContainer) {
                infoContainer.innerHTML = "Please login to view this data.";
            }
        }
    })
    .catch(error => {
        console.error("Error fetching login status:", error);
    });

// popup.js

function formatTrafficValue(trafficInBytes) {
    const trafficInGB = trafficInBytes / (1024 * 1024 * 1024);
    return trafficInGB.toFixed(2) + " GB";
}

function formatTimeValue(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds % 60)}`;
    return formattedTime;
}

function padZero(value) {
    return value.toString().padStart(2, "0");
}

// Make an AJAX request to retrieve system status information
fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=system_status")
    .then(response => response.json())
    .then(data => {
        // Update the popup menu with the received information
        var infoContainer = document.getElementById("info-container2");
        var infoData = document.getElementById("info-data");
        var dataRate = document.getElementById("data-rate");
        if (infoContainer) {
            infoContainer.innerHTML = `SIM Status: ${data.sim_status}<br>
                                   Network Type: ${data.network_type}<br>
                                   Service Status: ${data.service_status}<br>
                                   ISP: ${data.plmn}<br>
                                   WAN IP: ${data.wan_ip}<br>
                                   LTE Band: ${data.lte_band}<br>                                                                      
                                   Limit Switch: ${data.limit_switch}<br>
                                   Online Time: ${formatTimeValue(data.online_time)}<br>`;
        }
        if (infoData) {
            infoData.innerHTML = `Uplink Traffic: ${formatTrafficValue(data.uplink_traffic)}<br>
                                   Downlink Traffic: ${formatTrafficValue(data.downlink_traffic)}<br>`;
        }
        if (dataRate) {
            dataRate.innerHTML = `Uplink Rate: ${data.uplink_rate} kbps<br>
                                  Downlink Rate: ${data.downlink_rate} kbps<br>`;
        }
    })
    .catch(error => {
        console.error("Error fetching system status:", error);
    });