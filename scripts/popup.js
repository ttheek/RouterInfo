import * as api from './modules/api.js';
import * as util from './modules/utils.js';

const getElement = (id) => document.getElementById(id);
const setElement = function(id,value){ const element = getElement(id);element.innerHTML = value;                        }
const infoContainer = getElement("info-container");
const usage = getElement("usage");
const overlay = getElement("overlay");
const overlayTXT = getElement("overlay-txt");
const internetElement = getElement("internet");
const internet2 = getElement("internet2");
const signal = getElement("signal");
const wifi = getElement("wifi");
const loginInfo = getElement("loginInfo")
const connectedDevices = getElement("connected-devices");
let isLoggedIn = false;

function checkLoginStatus() {
    api.getCmdProcess('loginfo')
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
    api.getCmdProcess('web_signal,sta_count', true)
        .then(data => {
            if (!data) {
                return;
            }
            let {web_signal,sta_count} = data; 
            signal.classList = web_signal ? `signal${web_signal}` : `signal_none`;
            wifi.classList = sta_count ? `wifi_status${sta_count}` : 'wifi_status0'  
        });
}

function connected_devices() {
    api.getCmdProcess('station_list')
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
                Connection Time: ${util.formatTime(device.connect_time)}<br><br>
            `).join('');

            connectedDevices.innerHTML += deviceHTML;
        });
}


function updateSystemStatus() {
    api.getCmdProcess('system_status')
    .then(data => {
        if (!data) {
            return;
        }
        let { service_status, network_type, lte_band,
            plmn, sim_status, wan_ip, online_time,
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
        internetElement.innerHTML = `${connection} ${network_type2}`;
        const total_traffic = (util.extrNum(util.formatTraffic(uplink_traffic)) + 
            util.extrNum(util.formatTraffic(downlink_traffic))).toFixed(2);
        
        setElement("sim_status",sim_status);
        setElement("wan_ip",wan_ip);
        setElement("lte_band",lte_band);
        setElement("online_time",util.formatTime(online_time)) ;   
        setElement("up_traffic",util.formatTraffic(uplink_traffic));
        setElement("down_traffic",util.formatTraffic(downlink_traffic));
        setElement("total_traffic",`${total_traffic} GB`); 
        setElement("uplink_rate",util.formatRate(uplink_rate));
        setElement("downlink_rate",util.formatRate(downlink_rate));
    });
}

function login() {
    displayOverlay("Logging in...");
    api.login()
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

    api.setCmdProcess('REBOOT_DEVICE')
        .then(data => {
            overlayTXT.innerText = data ? "Waiting..." : "Failed to fetch data.";
            if (!data) console.log('Failed to fetch data.');
        });
}

function updateMemoryStatus() {
    if (isLoggedIn == false) {
        if (infoContainer) {
            const loginButton = getElement("buttonButton");
            loginButton.addEventListener("click", login);
            loginInfo.appendChild(loginButton);
        }
        return;
    }
    api.getCmdProcess('tz_dynamic_info')
        .then(memoryData => {
            if (!memoryData) {
                console.log('Failed to fetch data.');
                return;
            }
            loginInfo.innerHTML = '';

            if (infoContainer) {
                const { mem_total, mem_free, mem_cached, mem_active, tz_cpu_usage } = memoryData;
                const memT = util.extrNum(mem_total);
                const memF = util.extrNum(mem_free);
                const memoryUsedPercentage = Math.round(((memT - memF) / memT) * 100,3);
                const cpuUsageProgress = util.progressBar(util.extrNum(tz_cpu_usage),'cpu');
                const memoryUsageProgress = util.progressBar(memoryUsedPercentage, 'mem');

                setElement("mem_total", util.formatMemory(mem_total));
                setElement("mem_free", util.formatMemory(mem_free));
                setElement("mem_cached", util.formatMemory(mem_cached));
                setElement("mem_active", util.formatMemory(mem_active));

                usage.innerHTML = `<br>CPU Usage: ${tz_cpu_usage}%`;
                usage.appendChild(cpuUsageProgress);
                usage.innerHTML += `<br>Memory Usage: ${memoryUsedPercentage}%`;
                usage.appendChild(memoryUsageProgress);
                
                const restartButton = document.createElement("button");
                restartButton.className = "restart"
                restartButton.innerText = "Restart";
                restartButton.addEventListener("click", restartRouter);
                usage.appendChild(restartButton);                
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