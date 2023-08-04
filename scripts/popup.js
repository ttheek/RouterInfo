function extractNumericValue(valueWithUnits) {
    if (typeof valueWithUnits !== 'string') {
        return 0;
    }

    const numericValue = parseFloat(valueWithUnits.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
}

function formatMemoryValue(memoryWithUnits) {
    const memoryInKB = extractNumericValue(memoryWithUnits);
    const memoryInMB = memoryInKB / 1024;
    return memoryInMB.toFixed(2) + " MB";
}

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

function createCPUProgressBar(cpu) {
    const cpuUsage = extractNumericValue(cpu);
    const cpuUsedPercentage = (cpu / 100) * 100
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = `${cpuUsedPercentage}%`;

    const progressText = document.createElement("div");
    progressText.className = "progress-text";
    progressText.innerText = `${cpuUsedPercentage}%`;

    progressBar.appendChild(progressFill);
    progressBar.appendChild(progressText);

    return progressBar;
}

function createMemoryProgressBar(memT, memF) {
    const memTotal = extractNumericValue(memT);
    const memFree = extractNumericValue(memF);
    const usedPercentage = ((memTotal - memFree) / memTotal) * 100;

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = `${usedPercentage}%`;

    const progressText = document.createElement("div");
    progressText.className = "progress-text";
    progressText.innerText = `${usedPercentage.toFixed(2)}%`;

    progressBar.appendChild(progressFill);
    progressBar.appendChild(progressText);

    return progressBar;
}

function formatRateValue(rateInKbps) {
    const rateInMB = rateInKbps / 1024;
    return rateInMB.toFixed(2) + " KB/s";
}

function webSignal() {
    fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=web_signal")
        .then(response => response.json())
        .then(data => {
            // Access the data from the response and update the signal bars
            const signalStrength = data.web_signal;
            const signalBar1 = document.getElementById("signal-bar-1");
            if (signalBar1) {
                signalBar1.classList.remove("active");
                if (signalStrength >= 1) {
                    signalBar1.classList.add("active");
                }
            }

            // Update signal bar 2
            const signalBar2 = document.getElementById("signal-bar-2");
            if (signalBar2) {
                signalBar2.classList.remove("active");
                if (signalStrength >= 2) {
                    signalBar2.classList.add("active");
                }
            }

            // Update signal bar 3
            const signalBar3 = document.getElementById("signal-bar-3");
            if (signalBar3) {
                signalBar3.classList.remove("active");
                if (signalStrength >= 3) {
                    signalBar3.classList.add("active");
                }
            }
        })
        .catch(error => {
            console.error("Error fetching web signal:", error);
        });
}



function updateSystemStatus() {
    // Make an AJAX request to retrieve system status information
    fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=system_status")
        .then(response => response.json())
        .then(data => {
            // Update the popup menu with the received information
            var infoContainer2 = document.getElementById("info-container2");
            var status = document.getElementById("status");
            const internet = document.getElementById("internet");
            if (infoContainer2) {
                if (data.service_status === "network_type_no_service") {
                    const signal = document.getElementById("signal-container");
                    signal.classList.display = "none";
                    connection = "No Internet";
                    internet.className = "no-internet";
                    network_type = ``;
                    lte_band = ``;
                    plmn = ``;

                } else {
                    connection = ''
                    network_type = data.network_type
                    lte_band = `LTE Band: ${data.lte_band}<br>`
                    plmn = data.plmn
                    webSignal()
                }
                internet.innerHTML = `${connection}${plmn} ${network_type}`
                infoContainer2.innerHTML = `<h2>System</h2>
                                    SIM Status: ${data.sim_status}<br>
                                    WAN IP: ${data.wan_ip}<br>
                                    ${lte_band}                                                                      
                                    Limit Switch: ${data.limit_switch}<br>
                                    Online Time: ${formatTimeValue(data.online_time)}<br>`;


                // Update infoData and dataRate elements
                var infoData = document.getElementById("info-data");
                var dataRate = document.getElementById("data-rate");
                if (infoData) {
                    up_traffic = formatTrafficValue(data.uplink_traffic)
                    down_traffic = formatTrafficValue(data.downlink_traffic)
                    total_traffic = extractNumericValue(up_traffic) + extractNumericValue(down_traffic)
                    infoData.innerHTML = `<h2>Data Usage</h2>
                                    &UpArrowBar; Uplink Traffic: ${up_traffic}<br>
                                    &DownArrowBar; Downlink Traffic: ${down_traffic}<br>
                                    &#8693; Total Taffic: ${total_traffic} GB`;
                }
                if (dataRate) {
                    dataRate.innerHTML = `<h2>Data Rate &#8693;</h2>
                                      Uplink Rate: ${formatRateValue(data.uplink_rate)}<br>
                                      Downlink Rate: ${formatRateValue(data.downlink_rate)}<br>`;
                }
            }
        })
        .catch(error => {
            console.error("Error fetching system status:", error);
        });
}

function login() {
    const url = "http://192.168.8.1/goform/goform_set_cmd_process";
    const params = new URLSearchParams();
    params.append("isTest", "false");
    params.append("goformId", "LOGIN");
    params.append("username", "T3BlcmF0b3I=");
    params.append("password", "b1ZBSFpYZUg=");

    fetch(url, {
            method: "POST",
            body: params
        })
        .then(response => response.json())
        .then(data => {
            updateMemoryStatus();
            console.log(data);
        })
        .catch(error => {
            console.error("Error during login:", error);
        });
}

function checkRouterReconnected() {
    fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=loginfo")
        .then(response => response.json())
        .then(data => {
            if (data.loginfo === "") {
                // Router has reconnected, hide the overlay
                const overlay = document.getElementById("overlay");
                overlay.style.display = "none";
                // Resume updating system status
                updateSystemStatus();
            } else {
                // Router is still restarting, fetch again after a delay
                setTimeout(checkRouterReconnected, 1000); // Fetch every 1 second
            }
        })
        .catch(error => {
            console.error("Error fetching loginfo:", error);
            // Retry after a delay
            setTimeout(checkRouterReconnected, 1000); // Retry every 1 second
        });
}

function restartRouter() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    // Make an AJAX request to restart the router
    fetch("http://192.168.8.1/goform/goform_set_cmd_process?isTest=false&goformId=REBOOT_DEVICE")
        .then(() => {
            // Router restart initiated, start checking for reconnection
            checkRouterReconnected();
        })
        .catch(error => {
            console.error("Router restart error:", error);
        });
}


function updateMemoryStatus() {
    fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=loginfo")
        .then(response => response.json())
        .then(data => {
            if (data.loginfo === "ok") {
                // Make another AJAX request to retrieve memory information
                fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=tz_dynamic_info")
                    .then(response => response.json())
                    .then(memoryData => {
                        // Update the popup menu with the received memory information
                        var infoContainer = document.getElementById("info-container");
                        if (infoContainer) {
                            infoContainer.innerHTML = `<h2>Memory Information</h2>
                                            Total Memory: ${formatMemoryValue(memoryData.mem_total)}<br>
                                            Free Memory: ${formatMemoryValue(memoryData.mem_free)}<br>
                                            Cached Memory: ${formatMemoryValue(memoryData.mem_cached)}<br>
                                            Active Memory: ${formatMemoryValue(memoryData.mem_active)}<br>
                                            <br>CPU Usage: ${memoryData.tz_cpu_usage}<br>`;
                            const cpuUsage = extractNumericValue(memoryData.tz_cpu_usage);
                            const cpuUsageProgress = createCPUProgressBar(cpuUsage);
                            infoContainer.appendChild(cpuUsageProgress);
                            memT = extractNumericValue(memoryData.mem_total);
                            memF = extractNumericValue(memoryData.mem_free);
                            usedPercentage = ((memT - memF) / memT) * 100;
                            infoContainer.innerHTML += `<br>Memory Usage: ${usedPercentage.toFixed(2)}%`;
                            const memoryUsageProgress = createMemoryProgressBar(memoryData.mem_total, memoryData.mem_free);
                            infoContainer.appendChild(memoryUsageProgress);
                            const restartButton = document.createElement("button");
                            restartButton.className = "restart"
                            restartButton.innerText = "Restart";
                            restartButton.addEventListener("click", restartRouter);
                            infoContainer.appendChild(restartButton);

                        }
                    })
                    .catch(error => {
                        console.error("Error fetching memory data:", error);
                    });
            } else {
                const loginStatus = document.getElementById("login-status");
                if (loginStatus) {
                    loginStatus.innerHTML = "<h2>Memory Information</h2>Please login to view this data.";
                    const loginButton = document.createElement("button");
                    loginButton.innerText = "Login";
                    loginButton.className = "login";
                    loginButton.addEventListener("click", login);
                    loginStatus.appendChild(loginButton);
                }
            }
        })
        .catch(error => {
            console.error("Error fetching login status:", error);
        });
}

function updateVersion() {
    //copyright.innerHTML = `T.Theekshana  2023`
    fetch("./manifest.json")
        .then(response => response.json())
        .then(versionData => {
            var copyright = document.getElementById("copy");
            if (copyright) {
                copyright.innerHTML = `${versionData.name} v${versionData.version}<br>
                                        T.Theekshana &copy; 2023`
            }
        })
        .catch(error => {
            console.error("Error fetching version info:", error);
        });
}


const modeToggleButton = document.getElementById("mode-toggle-button");
const body = document.body;
modeToggleButton.addEventListener("click", toggleMode);

function toggleMode() {
    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode");
}

document.getElementById("settingsButton").addEventListener("click", () => {
    chrome.tabs.create({ url: "options.html" });
});

updateSystemStatus();
updateMemoryStatus();
updateVersion();

setInterval(() => {
    if (document.documentElement) {
        updateMemoryStatus();
    }
}, 5000);
// Update the system status every second when the popup is open
setInterval(() => {
    if (document.documentElement) {
        updateSystemStatus();
    }
}, 1000);