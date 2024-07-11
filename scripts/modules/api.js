import {username,password,getURL,setURL} from './config.js';
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
    const baseUrl = `${getURL}?${multi}isTest=false&cmd=`;
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
 * Sends data to the router.
 *
 * @deprecated since v1.6.2
 * @param   {String} params  Parameters to send.
 * @returns {JSON|null} data or null.
 */
export async function setCmdProcessOld(params) {
    const baseUrl = `${setURL}?isTest=false&goformId=`;
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
 * Sends data to the router using POST method.
 *
 * @param   {String} params  Parameters to send.
 * @returns {JSON|null} data or null.
 */
export async function setCmdProcess(params) {
    const baseUrl = setURL;

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `isTest=false&goformId=${encodeURIComponent(params)}`
        });

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
 * Login to router.
 *
 * @param   {String} username  Username.
 * @param   {String} password  Password.
 * @returns {JSON|null} data or null.
 */
export async function login() {
    const url = setURL;
    const params = new URLSearchParams();
    params.append("isTest", "false");
    params.append("goformId", "LOGIN");
    params.append("username", username);
    params.append("password", password);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending login request:', error);
        return null;
    }
}