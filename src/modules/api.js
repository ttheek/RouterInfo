import config from './config.js';

const api = {
/**
 * gets data from router.
 * 
 * @param   {String} params  Parameters to send.
 * @param   {Boolean} multi_data  if true multi_data.
 * @example get("web_signal")
 * 
 * @returns  {JSON|null} data or null.
 */
async get(params, multi_data=false) {
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
},

/**
 * Sends data and commands to the router using POST method.
 *
 * @param   {Object} params  Parameters to send as key-value pairs.
 * @example set({
        goformId: "LOGIN",
        username: username,
        password: password
    }) //(goformId is required)
 * @returns {Promise<JSON|null>} data or null.
 */
async set(params) {
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
            if (params.goformId == 'REBOOT_DEVICE'){
                const response = 'ok';
                return response;
            }else{
            console.error('Server error: Empty response received');
            }
        } else {
            console.error('Error fetching data:', error);
        }
        return null;
    }
},

/**
 * Login to router.
 *
 * @returns {JSON|null} data or null.
 */
async login() {
    await config.initialize();
    const params = {
        goformId: "LOGIN",
        username: config.username,
        password: config.password
    };
    
    try {
        const data = await this.set(params);
        return data;
    } catch (error) {
        return null;
    }
}
}

export default api;
