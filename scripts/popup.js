import { sendLoginRequest,setCmdProcess,getCmdProcess } from './lib/api.js';
import { extractNumeric,formatMemory,formatTraffic,formatRate } from './lib/utils.js';
import { formatTime,progressBar } from './lib/utils.js';

const username = "T3BlcmF0b3I="; // Base64 encoded username Operator
const password = "b1ZBSFpYZUg="; // Base64 encoded password oVAHZXeH
const getElement = (id) => document.getElementById(id);
const infoContainer = getElement("info-container");
const overlay = getElement("overlay");
const overlayTXT = getElement("overlay-txt");
const infoContainer2 = getElement("info-container2");
const internetElement = getElement("internet");
const internet2 = getElement("internet2");
const signal = getElement("signal")
const wifi = getElement("wifi")
const infoData = getElement("info-data");
const dataRate = getElement("data-rate");
const connectedDevices = getElement("connected-devices");
let isLoggedIn = false;

function checkLoginStatus() {
    getCmdProcess('loginfo')
        .then(data => {
            if (!data) {
                console.log('Failed to fetch data.');
                isLoggedIn = false;
                return;
            }
            if (data.loginfo == "ok"){
            isLoggedIn = true;
            connected_devices()
            }
        })
        .catch(error => {
            console.error('Error fetching loginfo:', error);
            isLoggedIn = false;
        });
}

checkLoginStatus()

function webSignal() {
    getCmdProcess('web_signal,sta_count', true)
        .then(data => {
            if (!data) {
                return;
            }
            const {web_signal,sta_count} = data; 
            signal.classList = web_signal ? `signal${web_signal}` : `signal_none`;
            wifi.classList = sta_count ? `wifi_status${sta_count}` : 'wifi_status0'  
        });
}

function connected_devices() {
    getCmdProcess('station_list')
        .then(data => {
            if (!data) {
                return;
            }

            const deviceList = data.station_list;
            connectedDevices.innerHTML = '<h2>Devices</h2>';

            const deviceHTML = deviceList.map(device => `
                Hostname: <b>${device.hostname}</b><br>
                Device MAC: ${device.mac_addr}<br>
                IP Address: ${device.ip_addr}<br>
                Connection Time: ${formatTime(device.connect_time)}<br><br>
            `).join('');

            connectedDevices.innerHTML += deviceHTML;
        });
}


function updateSystemStatus() {
    getCmdProcess('system_status')
    .then(data => {
        if (!data) {
            infoContainer2.innerHTML = `
                <h2>System</h2>
                SIM Status: -<br>
                WAN IP: -<br>
                LTE Band: -<br>
                Online Time: -<br>`;
            return;
        }
        const { service_status, network_type, lte_band,
            plmn, sim_status, wan_ip, limit_switch,online_time,
            uplink_traffic, downlink_traffic, uplink_rate, downlink_rate} = data;            
        
        let connection = '';
        let network_type2 = '';
        let plmn2 = '';

        if (service_status === "network_type_no_service") {
            connection = "No Internet";
            internetElement.className = "no-internet";
        } else {
            if (internetElement.className === "no-internet") {
                internetElement.className = "internet";
            }
            network_type2 = network_type;
            plmn2 = plmn;
        }
        webSignal()
        internet2.classList = plmn2;
        internetElement.innerHTML = `${connection} ${network_type2}`

        infoContainer2.innerHTML = `
            <h2>System</h2>
            SIM Status: ${sim_status}<br>
            WAN IP: ${wan_ip}<br>
            LTE Band: ${lte_band}<br>
            Online Time: ${formatTime(online_time)}<br>`;
        
        const up_traffic = formatTraffic(uplink_traffic)
        const down_traffic = formatTraffic(downlink_traffic)
        const total_traffic = (extractNumeric(up_traffic) + extractNumeric(down_traffic)).toFixed(2)
        infoData.innerHTML = `
            <h2>Data Usage</h2>
            &UpArrowBar; Uplink Traffic: ${up_traffic}<br>
            &DownArrowBar; Downlink Traffic: ${down_traffic}<br>
            &#8693; Total Taffic: ${total_traffic} GB`;
        dataRate.innerHTML = `
            <h2>Data Rate &#8693;</h2>
            Up Rate: ${formatRate(uplink_rate)}<br>
            Down Rate: ${formatRate(downlink_rate)}<br>`;    
    });
}

function login() {
    displayOverlay("Logging in...");
    sendLoginRequest(username, password)
    .then(data => {
        if (data) {
            isLoggedIn = true;
            updateMemoryStatus();
            displayOverlay();
        } else {
            console.log('Failed to send login request.');
        }
    });
}

function displayOverlay(message="") {
    if (message != ""){
        overlay.style.display = "block";
        overlayTXT.innerText = message;
    }else{
        overlay.style.display = "none";
    }
}

function restartRouter() {
    displayOverlay("Restarting...");

    [init1, init2,loginCheckInterval].forEach(clearInterval);

    setCmdProcess('REBOOT_DEVICE')
        .then(data => {
            overlayTXT.innerText = data ? "Waiting..." : "Failed to fetch data.";
            if (!data) console.log('Failed to fetch data.');
        });
}

function updateMemoryStatus() {
    if (isLoggedIn == false) {
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
                const memT = extractNumeric(mem_total);
                const memF = extractNumeric(mem_free);
                const memoryUsedPercentage = Math.round(((memT - memF) / memT) * 100,3);
                const cpuUsageProgress = progressBar(extractNumeric(tz_cpu_usage),'cpu');
                const memoryUsageProgress = progressBar(memoryUsedPercentage, 'mem')
                if (cpuUsageProgress){

                }

                infoContainer.innerHTML = `
                    <h2>Memory Information</h2>
                    Total Memory: ${formatMemory(mem_total)}<br>
                    Free Memory: ${formatMemory(mem_free)}<br>
                    Cached Memory: ${formatMemory(mem_cached)}<br>
                    Active Memory: ${formatMemory(mem_active)}<br>
                    <br>CPU Usage: ${tz_cpu_usage}<br>`;

                infoContainer.appendChild(cpuUsageProgress);
                    
                infoContainer.innerHTML += `<br>Memory Usage: ${memoryUsedPercentage}%`;
                infoContainer.appendChild(memoryUsageProgress);
                
                const restartButton = document.createElement("button");
                restartButton.className = "restart"
                restartButton.innerText = "Restart";
                restartButton.addEventListener("click", restartRouter);
                infoContainer.appendChild(restartButton);                
            }
        });
    
}        

function updateVersion() {
    fetch("./manifest.json")
        .then(response => response.json())
        .then(versionData => {
            var copyright = document.getElementById("copy");
            if (copyright) {
                copyright.innerHTML = `${versionData.name} v${versionData.version}<br>
                                        T.Theekshana &copy; 2024`
            }
        })
        .catch(error => {
            console.error("Error fetching version info:", error);
        });
}

updateSystemStatus();
updateMemoryStatus();
updateVersion();

const loginCheckInterval= setInterval(checkLoginStatus, 10000);

const init1= setInterval(() => {
    if (document.documentElement) {
        updateMemoryStatus();
    }
}, 5000);
 
const init2 = setInterval(() => {
    if (document.documentElement) {
        updateSystemStatus();
    }
}, 2000);