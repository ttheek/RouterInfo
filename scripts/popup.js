import { sendLoginRequest,setCmdProcess,getCmdProcess } from './lib/api.js';
import { extractNumericValue,formatMemoryValue,formatTrafficValue,formatRateValue } from './lib/utils.js';
import { formatTimeValue,createCPUProgressBar,createMemoryProgressBar } from './lib/utils.js';

const username = "T3BlcmF0b3I="; // Base64 encoded username
const password = "b1ZBSFpYZUg="; // Base64 encoded password
const body = document.body;
const infoContainer = document.getElementById("info-container");
const overlay = document.getElementById("overlay");
const overlayTXT = document.getElementById("overlay-txt");
const infoContainer2 = document.getElementById("info-container2");
const status = document.getElementById("status");
const internet = document.getElementById("internet");
const internet2 = document.getElementById("internet2");
const signal = document.getElementById("signal")
const infoData = document.getElementById("info-data");
const dataRate = document.getElementById("data-rate");

function webSignal() {
    getCmdProcess('web_signal')
        .then(data => {
            if (!data) {
                return;
            }
            const {web_signal} = data; 
            signal.classList = web_signal ? `signal${web_signal}` : `signal_none`;  
        });
}

function updateSystemStatus() {
    getCmdProcess('system_status')
    .then(data => {
        if (!data) {
            return;
        }
        const { service_status, network_type, lte_band,
            plmn, sim_status, wan_ip, limit_switch,online_time,
            uplink_traffic, downlink_traffic, uplink_rate, downlink_rate} = data;            
        
        if (service_status === "network_type_no_service") {
            var connection = "No Internet";
            internet.className = "no-internet";
            var network_type2 = ``;
            var plmn2 = ``;

        } else {
            if (internet.className == "no-internet"){
                internet.className = "internet";
            }
            connection = '';
            network_type2 = network_type;
            plmn2 = plmn;                
        }
        webSignal()
        internet2.classList = plmn2;
        internet.innerHTML = `${connection} ${network_type2}`
        infoContainer2.innerHTML = `
            <h2>System</h2>
            SIM Status: ${sim_status}<br>
            WAN IP: ${wan_ip}<br>
            LTE Band: ${lte_band}<br>                                                                      
            Limit Switch: ${limit_switch}<br>
            Online Time: ${formatTimeValue(online_time)}<br>`;

        
        var up_traffic = formatTrafficValue(uplink_traffic)
        var down_traffic = formatTrafficValue(downlink_traffic)
        var total_traffic = (extractNumericValue(up_traffic) + extractNumericValue(down_traffic)).toFixed(2)
        infoData.innerHTML = `
            <h2>Data Usage</h2>
            &UpArrowBar; Uplink Traffic: ${up_traffic}<br>
            &DownArrowBar; Downlink Traffic: ${down_traffic}<br>
            &#8693; Total Taffic: ${total_traffic} GB`;
        dataRate.innerHTML = `
            <h2>Data Rate &#8693;</h2>
            Uplink Rate: ${formatRateValue(uplink_rate)}<br>
            Downlink Rate: ${formatRateValue(downlink_rate)}<br>`;    
    });
}

function login() {
    overlay.style.display = "block";
    overlayTXT.innerText = "Logging in...";
    sendLoginRequest(username, password)
    .then(data => {
        if (data) {
            updateMemoryStatus();
            overlay.style.display = "none";
        } else {
            console.log('Failed to send login request.');
        }
    });
}

function restartRouter() {
    overlay.style.display = "block";
    overlayTXT.innerText = "Restarting...";

    [init1, init2].forEach(clearInterval);

    setCmdProcess('REBOOT_DEVICE')
        .then(data => {
            overlayTXT.innerText = data ? "Waiting..." : "Failed to fetch data.";
            if (!data) console.log('Failed to fetch data.');
        });
}

function updateMemoryStatus() {
    getCmdProcess('loginfo')
        .then(data => {
            if (!data) {
                console.log('Failed to fetch data.');
                return;
            }

            if (data.loginfo !== "ok") {
                if (infoContainer) {
                    infoContainer.innerHTML = `<h2>Memory Information</h2>Please login to view this data.`;
                    const loginButton = document.createElement("button");
                    loginButton.innerText = "Login";
                    loginButton.className = "login";
                    loginButton.addEventListener("click", login);
                    infoContainer.appendChild(loginButton);
                }
                return;
            }
            getCmdProcess('tz_dynamic_info')
                .then(memoryData => {
                    if (!memoryData) {
                        console.log('Failed to fetch data.');
                        return;
                    }

                    if (infoContainer) {
                        const { mem_total, mem_free, mem_cached, mem_active, tz_cpu_usage } = memoryData;
                        const memT = extractNumericValue(mem_total);
                        const memF = extractNumericValue(mem_free);
                        const usedPercentage = ((memT - memF) / memT) * 100;
                        const cpuUsageProgress = createCPUProgressBar(extractNumericValue(tz_cpu_usage));
                        const memoryUsageProgress = createMemoryProgressBar(mem_total, mem_free)

                        infoContainer.innerHTML = `
                            <h2>Memory Information</h2>
                            Total Memory: ${formatMemoryValue(mem_total)}<br>
                            Free Memory: ${formatMemoryValue(mem_free)}<br>
                            Cached Memory: ${formatMemoryValue(mem_cached)}<br>
                            Active Memory: ${formatMemoryValue(mem_active)}<br>
                            <br>CPU Usage: ${tz_cpu_usage}<br>`;

                        infoContainer.appendChild(cpuUsageProgress);
                            
                        infoContainer.innerHTML += `<br>Memory Usage: ${usedPercentage.toFixed(2)}%`;
                        infoContainer.appendChild(memoryUsageProgress);
                        
                        const restartButton = document.createElement("button");
                        restartButton.className = "restart"
                        restartButton.innerText = "Restart";
                        restartButton.addEventListener("click", restartRouter);
                        infoContainer.appendChild(restartButton);
                    }
                });
        });
}        

function updateVersion() {
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

updateSystemStatus();
updateMemoryStatus();
updateVersion();

const init1= setInterval(() => {
    if (document.documentElement) {
        updateMemoryStatus();
    }
}, 5000);
 
const init2 = setInterval(() => {
    if (document.documentElement) {
        updateSystemStatus();
    }
}, 1000);

