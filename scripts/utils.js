export function extractNumericValue(valueWithUnits) {
    if (typeof valueWithUnits !== 'string') {
        return 0;
    }

    const numericValue = parseFloat(valueWithUnits.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
}

export function formatMemoryValue(memoryWithUnits) {
    const memoryInKB = extractNumericValue(memoryWithUnits);
    const memoryInMB = memoryInKB / 1024;
    return memoryInMB.toFixed(2) + " MB";
}

export function formatTrafficValue(trafficInBytes) {
    const trafficInGB = trafficInBytes / (1024 * 1024 * 1024);
    return trafficInGB.toFixed(2) + " GB";
}

export function formatTimeValue(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds % 60)}`;
    return formattedTime;
}

export function createCPUProgressBar(cpu) {
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

function padZero(value) {
    return value.toString().padStart(2, "0");
}

export function createMemoryProgressBar(memT, memF) {
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

export function formatRateValue(rateInKbps) {
    const rateInMB = rateInKbps / 1024;
    return rateInMB.toFixed(2) + " KB/s";
}