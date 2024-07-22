import * as config from './config.js';
/**
 * gets data from router.
 * 
 * @param   {String} params  Parameters to send.
 * @param   {Boolean} multi_data  if true multi_data.
 * @example getCmdProcess("web_signal")
 * 
 * @returns  {JSON|null} data or null.
 */
export async function getCmdProcess(params, multi_data=false) {
    const multi = multi_data ? `multi_data=1&` : ``;
    const baseUrl = `${config.getURL}?${multi}isTest=false&cmd=`;
    const url = `${baseUrl}${encodeURIComponent(params)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // console.error('Error fetching data:', error);
        return null;
    }
}

/**
 * Sends data and commands to the router using POST method.
 *
 * @param   {Object} params  Parameters to send as key-value pairs.
 * @example setCmdProcess({
        goformId: "LOGIN",
        username: username,
        password: password
    }) //(goformId is required)
 * @returns {Promise<JSON|null>} data or null.
 */
export async function setCmdProcess(params) {
    const baseUrl = config.setURL;

    if (!params.goformId) {
        throw new Error('goformId is required');
    }

    const urlEncodedParams = new URLSearchParams({
        isTest: 'false',
        ...params
    }).toString();

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncodedParams
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            console.error('Network error: Failed to fetch');
        } else if (error.message.includes('net::ERR_EMPTY_RESPONSE')) {
            if (params.goformId == "REBOOT_DEVICE"){
                return "ok"
            }else{
            console.error('Server error: Empty response received');
            }
        } else {
            console.error('Error fetching data:', error);
        }
        return null;
    }
}

/**
 * Login to router.
 *
 * @returns {JSON|null} data or null.
 */
export async function login() {
    const params = {
        goformId: "LOGIN",
        username: config.username,
        password: config.password
    };
    
    try {
        const data = await setCmdProcess(params);
        return data;
    } catch (error) {
        return null;
    }
}
