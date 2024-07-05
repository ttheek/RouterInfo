import {username,password} from './config.js';
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
    var multi = multi_data ? `multi_data=1&` : ``;
    const baseUrl = `http://192.168.8.1/goform/goform_get_cmd_process?${multi}isTest=false&cmd=`;
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
 * @param   {String} params  Parameters to send.
 * @returns {JSON|null} data or null.
 */
export async function setCmdProcess(params) {
    const baseUrl = 'http://192.168.8.1/goform/goform_set_cmd_process?isTest=false&goformId=';
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
 * Login to router.
 *
 * @param   {String} username  Username.
 * @param   {String} password  Password.
 * @returns {JSON|null} data or null.
 */
export async function login() {
    const url = "http://192.168.8.1/goform/goform_set_cmd_process";
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