import { sendLoginRequest } from './api.js';
import { setCmdProcess } from './api.js';
import { getCmdProcess } from './api.js';
import { extractNumericValue } from './utils.js';
import { formatMemoryValue } from './utils.js';
import { formatTrafficValue } from './utils.js';
import { formatTimeValue } from './utils.js';
import { createCPUProgressBar } from './utils.js';
import { createMemoryProgressBar } from './utils.js';
import { formatRateValue } from './utils.js';

const username = "T3BlcmF0b3I="; // Base64 encoded username
const password = "b1ZBSFpYZUg="; // Base64 encoded password
const body = document.body;
const infoContainer = document.getElementById("info-container");
const overlay = document.getElementById("overlay");

function webSignal() {
    getCmdProcess('web_signal')
    .then(data => {
        if (data) {
            // console.log('Fetched data:', data);
            // Access the data from the response and update the signal bars
            const signalStrength = data.web_signal;
            const signalBar1 = document.getElementById("signal-bar-1");
            const signalBar2 = document.getElementById("signal-bar-2");
            const signalBar3 = document.getElementById("signal-bar-3");
            if (signalBar1) {
                signalBar1.classList.remove("active");
                if (signalStrength >= 1) {
                    signalBar1.classList.add("active");
                }
            }
            
            if (signalBar2) {
                signalBar2.classList.remove("active");
                if (signalStrength >= 2) {
                    signalBar2.classList.add("active");
                }
            }
            
            if (signalBar3) {
                signalBar3.classList.remove("active");
                if (signalStrength >= 3) {
                    signalBar3.classList.add("active");
                }
            }
        } else {
            console.log('Failed to fetch data.');
        }
    });
}

function updateSystemStatus() {
    getCmdProcess('system_status')
    .then(data => {
        if (data) {
            var infoContainer2 = document.getElementById("info-container2");
            var status = document.getElementById("status");
            const internet = document.getElementById("internet");
            if (infoContainer2) {
                if (data.service_status === "network_type_no_service") {
                    const signal = document.getElementById("signal-container");
                    signal.classList.display = "none";
                    var connection = "No Internet";
                    internet.className = "no-internet";
                    var network_type = ``;
                    var lte_band = ``;
                    var plmn = ``;

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
                    var up_traffic = formatTrafficValue(data.uplink_traffic)
                    var down_traffic = formatTrafficValue(data.downlink_traffic)
                    var total_traffic = (extractNumericValue(up_traffic) + extractNumericValue(down_traffic)).toFixed(2)
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
        } else {
            console.log('Failed to fetch data.');
        }
    });
}

function login() {
    overlay.style.display = "block";
    sendLoginRequest(username, password)
    .then(data => {
        if (data) {
            overlay.style.display = "none";
        } else {
            console.log('Failed to send login request.');
        }
    });
}

function restartRouter() {    
    overlay.style.display = "block";
    setCmdProcess('REBOOT_DEVICE')
        .then(data => {
            if (data) {
                // console.log('Fetched data:', data);
            } else {
                console.log('Failed to fetch data.');
            }
        });
}

function updateMemoryStatus() {
    getCmdProcess('loginfo')
    .then(data => {
        if (data) {
            if (data.loginfo === "ok") {
                getCmdProcess('tz_dynamic_info')
                    .then(memoryData => {
                        if (memoryData) {
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
                                const memT = extractNumericValue(memoryData.mem_total);
                                const memF = extractNumericValue(memoryData.mem_free);
                                const usedPercentage = ((memT - memF) / memT) * 100;
                                infoContainer.innerHTML += `<br>Memory Usage: ${usedPercentage.toFixed(2)}%`;
                                const memoryUsageProgress = createMemoryProgressBar(memoryData.mem_total, memoryData.mem_free);
                                infoContainer.appendChild(memoryUsageProgress);
                                const restartButton = document.createElement("button");
                                restartButton.className = "restart"
                                restartButton.innerText = "Restart";
                                restartButton.addEventListener("click", restartRouter);
                                infoContainer.appendChild(restartButton);
    
                            }
                        } else {
                            console.log('Failed to fetch data.');
                        }
                    });
            } else {                
                if (infoContainer) {
                    infoContainer.innerHTML = "<h2>Memory Information</h2>Please login to view this data.";
                    const loginButton = document.createElement("button");
                    loginButton.innerText = "Login";
                    loginButton.className = "login";
                    loginButton.addEventListener("click", login);
                    infoContainer.appendChild(loginButton);
                }
            }
        } else {
            console.log('Failed to fetch data.');
        }
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

// document.getElementById("settingsButton").addEventListener("click", () => {
//     chrome.tabs.create({ url: "options.html" });
// });

function main(){
    updateSystemStatus();
    updateMemoryStatus();
    updateVersion();

    setInterval(() => {
        if (document.documentElement) {
            updateMemoryStatus();
        }
    }, 5000);
     
    setInterval(() => {
        if (document.documentElement) {
            updateSystemStatus();
        }
    }, 1000);
}

main()
