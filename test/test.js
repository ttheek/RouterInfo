// Import the API module
import API from '../src/modules/api.js';

document.addEventListener('DOMContentLoaded', function () {
    const data = document.getElementById('data');
    const errors = document.getElementById('errors');

    async function fetchData() {
        try {
            // Using a single parameter
            const d = await API.get('WEB_SIGNAL','DEVICE_LIST');
            data.innerHTML = ''; // Clear existing content

            // Iterate through the keys and values of the returned JSON object
            for (const [key, value] of Object.entries(d)) {
                const keyValueElement = document.createElement('div');
                keyValueElement.textContent = `${key}: ${value}`;
                data.appendChild(keyValueElement);
            }
        } catch (error) {
            errors.innerHTML = `Error fetching data: ${error}`;
        }
    }

    fetchData();
});

