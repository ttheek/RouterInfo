/**
 * @module utilis
 * 
*/

/**
 * formatting utility functions.
 */
const format = {

    /**
     * Extracts a numeric value from a given input, which can be a number or a string with a percentage.
     *
     * @param {number|string} value - The input value to extract the numeric value from.
     * @returns {number} The extracted numeric value.
     */
    extrNum(valueWithUnits) {
        if (typeof valueWithUnits === "number") {
            return valueWithUnits;
        }
        if (typeof valueWithUnits !== 'string') {
            return 0;
        }

        const numericValue = parseFloat(valueWithUnits.replace(/[^\d.-]/g, ''));
        return isNaN(numericValue) ? 0 : numericValue;
    },

    /**
     * Formats a given memory value with units to a string in MB with two decimal places.
     *
     * @param {string} memoryWithUnits - The memory value with units (e.g., "2048KB").
     * @returns {string} The formatted memory value in megabytes (MB).
     */
    formatMemory(memoryWithUnits) {
        return (this.extrNum(memoryWithUnits) / 1024).toFixed(2) + " MB";
    },
        /**
     * format bytes to GB.
     * 
     * @param   {Number} trafficInBytes  String to extract.
     * @example trafficValue(1073741824)
     * //returns "1 GB"
     * 
     * @returns  {String} formatted String in GB.
     */
    traffic(trafficInBytes) {
        return (trafficInBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    },

    /**
     * Formats a given time in seconds into a string with the format HH:MM:SS.
     *
     * @param {number} seconds - The time in seconds to be formatted.
     * @returns {string} The formatted time string in HH:MM:SS format.
     */
    time(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const formattedTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds % 60)}`;
        return formattedTime;
    },

    /**
     * Pads a number with a leading zero if it is less than 10.
     *
     * @param {number} num - The number to pad.
     * @returns {string} The padded number as a string.
     */
    padZero(value) {
        return value.toString().padStart(2, "0");
    },

    /**
     * Formats a given rate value in Kbps to a string in KB/s with two decimal places.
     *
     * @param {number} rateInKbps - The rate value in kilobits per second (Kbps).
     * @returns {string} The formatted rate value in kilobytes per second (KB/s).
     */
    rate(rateInKbps) {
        return (rateInKbps / 1024).toFixed(2) + " KB/s"
    }
};
/**
 * Creates a progress bar element with the given usage percentage.
 *
 * @param {number} usedPercentage - The usage percentage for the progress bar.
 * @returns {HTMLDivElement} The created progress bar element.
 */
export function progressBar(usedPercentage, type='') {
    let progressBarElement = document.querySelector(`.progress-bar.${type}`);
    let progressFill, progressText;

    if (!progressBarElement) {
        // console.log('%c new div','color:green;');
        progressBarElement = document.createElement("div");
        progressBarElement.className = `progress-bar ${type}`;

        progressFill = document.createElement("div");
        progressFill.className = "progress-fill";
        
        progressText = document.createElement("div");
        progressText.className = "progress-text";

        progressBarElement.append(progressFill, progressText);        
        document.body.append(progressBarElement);
    } else {
        progressFill = progressBarElement.querySelector('.progress-fill');
        progressText = progressBarElement.querySelector('.progress-text');
    }

    progressText.innerText = `${usedPercentage}%`;
    progressFill.style.width = `${usedPercentage}%`;

    return progressBarElement;
}


// export const getElement = (id) => document.getElementById(id);

export default format;