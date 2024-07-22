import * as api from './modules/api.js';
import * as util from './modules/utils.js';

const getElem = util.getElement;
const setElem = util.setElement;
const infoContainer = getElem("info-container");
const usage = getElem("usage");
const overlay = getElem("overlay");
const overlayTXT = getElem("overlay-txt");
const internetElement = getElem("internet");
const internet2 = getElem("internet2");
const signal = getElem("signal");
const wifi = getElem("wifi");
const loginInfo = getElem("loginInfo")
const connectedDevices = getElem("connected-devices");
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
        
        setElem("sim_status",sim_status);
        setElem("wan_ip",wan_ip);
        setElem("lte_band",lte_band);
        setElem("online_time",util.formatTime(online_time)) ;   
        setElem("up_traffic",util.formatTraffic(uplink_traffic));
        setElem("down_traffic",util.formatTraffic(downlink_traffic));
        setElem("total_traffic",`${total_traffic} GB`); 
        setElem("uplink_rate",util.formatRate(uplink_rate));
        setElem("downlink_rate",util.formatRate(downlink_rate));
    });
}

function login() {
    if (isLoggedIn != true){
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
};
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

    api.setCmdProcess({goformId:'REBOOT_DEVICE'})
        .then(data => {
            overlayTXT.innerText = data ? "Waiting..." : "Failed to fetch data.";
        });
}

function updateMemoryStatus() {
    if (isLoggedIn == false) {
        if (infoContainer) {
            const loginButton = getElem("buttonButton");
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

                setElem("mem_total", util.formatMemory(mem_total));
                setElem("mem_free", util.formatMemory(mem_free));
                setElem("mem_cached", util.formatMemory(mem_cached));
                setElem("mem_active", util.formatMemory(mem_active));

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
                                        <a href="https://github.com/ttheek/">T.Theekshana</a> &copy; 2024`
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