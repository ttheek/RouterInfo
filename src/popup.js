import api from './modules/api.js';
import * as util from './modules/utils.js';
import format from './modules/utils.js';

const getElem = (id) => document.getElementById(id);
const setElem = function(id,value){ const element = getElem(id);element.innerHTML = value;}
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
let isLoggedIn = false

function checkLoginStatus() {    
    chrome.storage.local.get(['isLoggedIn', 'lastLoggedIn'], function(result) {
        const is_LoggedIn = result.isLoggedIn;
        const lastLoggedIn = result.lastLoggedIn;

        if (is_LoggedIn) {
            const currentTime = new Date().getTime();
            const timeDifference = currentTime - lastLoggedIn;               
            
            const tenMinutes = 10 * 60 * 1000;
            
            if (timeDifference > tenMinutes) {
                isLoggedIn = false;
                console.log('Session expired. Please log in again.');
            } else {
                isLoggedIn = true;
                console.log('User is logged in and session is active.');
            }
        } else {
            api.get('loginfo')
            .then(data => {
                if (!data) {
                    console.log('Failed to fetch data.');
                    isLoggedIn = false;
                    return;
                }
                if (data.loginfo == 'ok'){
                isLoggedIn = true;
                const currentTime = new Date().getTime();
                chrome.storage.local.set({ isLoggedIn: true, lastLoggedIn: currentTime }, function() {
                    isLoggedIn = true;
                });
                }
                else if (data.loginfo == ''){
                isLoggedIn = false;
                console.log('Session expired.');
                }
            })
            .catch(error => {
                console.error('Error fetching loginfo:', error);
                isLoggedIn = false;
            });
        }
    });
}

checkLoginStatus()

function webSignal() {
    api.get('web_signal,sta_count', true)
        .then(data => {
            if (!data) {
                return;
            }
            let {web_signal,sta_count} = data; 
            signal.classList = web_signal ? `signal${web_signal}` : `signal_none`;
            wifi.classList = sta_count ? `wifi_status${sta_count}` : 'wifi_status0'  
        });
}
function dataLimit(){
    api.get(`data_volume_limit_switch,data_volume_limit_size,
                        monthly_rx_bytes,monthly_tx_bytes`, true)
        .then(data => {
            if (!data) {
                return;
            }let {data_volume_limit_switch,data_volume_limit_size,
                monthly_rx_bytes,monthly_tx_bytes} = data; 
        });
}

function connected_devices() {
    api.get('station_list')
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
                Connection Time: ${format.time(device.connect_time)}<br><br>
            `).join('');

            connectedDevices.innerHTML += deviceHTML;
        });
}


function updateSystemStatus() {
    api.get('system_status')
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
        const total_traffic = (format.extrNum(format.traffic(uplink_traffic)) + 
        format.extrNum(format.traffic(downlink_traffic))).toFixed(2);
        
        setElem("sim_status",sim_status);
        setElem("wan_ip",wan_ip);
        setElem("lte_band",lte_band);
        setElem("online_time",format.time(online_time)) ;   
        setElem("up_traffic",format.traffic(uplink_traffic));
        setElem("down_traffic",format.traffic(downlink_traffic));
        setElem("total_traffic",`${total_traffic} GB`); 
        setElem("uplink_rate",format.rate(uplink_rate));
        setElem("downlink_rate",format.rate(downlink_rate));
    });
}

function login() {
    if (isLoggedIn != true){
    displayOverlay("Logging in...");
    api.login()
    .then(data => {
        if (data) {                       
            const currentTime = new Date().getTime();
            chrome.storage.local.set({ 'isLoggedIn': true, 'lastLoggedIn': currentTime }, function() {
                isLoggedIn = true;
                displayOverlay();
                updateMemoryStatus();                 
            });
            
        } else {
            console.log('Failed to send login request.');
        }
    });
};
}

/**
 * Displays or hides an overlay with a message.
 * 
 * @param {string} [message=""] - The message to display in the overlay. If an empty string is passed, the overlay will be hidden.
 */
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

    api.set({goformId:'REBOOT_DEVICE'})
        .then(data => {
            chrome.storage.local.set({ isLoggedIn: false }, function() {
                console.log('User logged out.');
            });
            overlayTXT.innerText = data ? "Waiting..." : "Failed to fetch data.";
        });
}

function updateMemoryStatus() {
    if (isLoggedIn != true) {
        if (infoContainer) {
            const loginButton = getElem("buttonButton");
            loginButton.addEventListener("click", login);
            loginInfo.appendChild(loginButton);
            console.log(`isLoggedIn : ${isLoggedIn}`);
        }
        return;
    }
    api.get('tz_dynamic_info')
        .then(memoryData => {
            if (!memoryData) {
                console.log('Failed to fetch data.');
                return;
            }
            loginInfo.innerHTML = '';

            if (infoContainer) {
                const { mem_total, mem_free, mem_cached, mem_active, tz_cpu_usage } = memoryData;
                const memT = format.extrNum(mem_total);
                const memF = format.extrNum(mem_free);
                const memoryUsedPercentage = Math.round(((memT - memF) / memT) * 100,3);
                const cpuUsageProgress = util.progressBar(format.extrNum(tz_cpu_usage),'cpu');
                const memoryUsageProgress = util.progressBar(memoryUsedPercentage, 'mem');

                setElem("mem_total", format.formatMemory(mem_total));
                setElem("mem_free", format.formatMemory(mem_free));
                setElem("mem_cached", format.formatMemory(mem_cached));
                setElem("mem_active", format.formatMemory(mem_active));

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
            var copyright = getElem("copy");
            if (copyright) {
                copyright.innerHTML = `${versionData.name} v${versionData.version}<br>
                                        <a href="https://github.com/ttheek/" target="_blank">T.Theekshana</a> &copy; 2024`
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