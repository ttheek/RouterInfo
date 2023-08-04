function extractNumericValue(valueWithUnits) {
    if (typeof valueWithUnits !== 'string') {
        return 0;
    }

    const numericValue = parseFloat(valueWithUnits.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
}

function formatRateValue(rateInKbps) {
    const rateInMB = rateInKbps / 1024;
    return rateInMB.toFixed(2);
}
// Global variables to store the data points
let dataPoints = [];
let chart;

async function updateChart() {
    try {
        // Make the AJAX request to retrieve system status information
        const response = await fetch("http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=system_status");
        const data = await response.json();

        // Assuming 'data' contains the provided information
        const currentTime = new Date().getTime(); // Current time in milliseconds
        const uplinkRate = formatRateValue(data.uplink_rate);
        const downlinkRate = formatRateValue(data.downlink_rate);

        // Store the new data point with current time and rates
        dataPoints.push({
            time: currentTime,
            uplinkRate: uplinkRate,
            downlinkRate: downlinkRate
        });

        // Remove data points older than 30 seconds
        const thirtySecondsAgo = currentTime - 30 * 1000; // 30 seconds ago in milliseconds
        dataPoints = dataPoints.filter(dataPoint => dataPoint.time >= thirtySecondsAgo);

        const labels = []; // Array to store time labels
        const uplinkRates = []; // Array to store uplink rates
        const downlinkRates = []; // Array to store downlink rates

        dataPoints.forEach(dataPoint => {
            // Convert the time back to a Date object
            const time = new Date(dataPoint.time);

            labels.push(time.getSeconds()); // Display only seconds
            uplinkRates.push(dataPoint.uplinkRate);
            downlinkRates.push(dataPoint.downlinkRate);
        });

        // Update the chart's data
        chart.data.labels = labels;
        chart.data.datasets[0].data = uplinkRates;
        chart.data.datasets[1].data = downlinkRates;

        // Update the chart
        chart.update();
    } catch (error) {
        console.error("Error fetching system status:", error);
    }
}

// Create the initial chart instance
const ctx = document.getElementById("chart").getContext("2d");
chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
                label: "Uplink Rate",
                data: [],
                borderColor: "blue",
                fill: false
            },
            {
                label: "Downlink Rate",
                data: [],
                borderColor: "green",
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (Seconds)"
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Rate (kbps)"
                }
            }
        }
    }
});

// Call the updateChart function to initialize the chart
updateChart();

// Set an interval to update the chart every second
setInterval(updateChart, 1000);