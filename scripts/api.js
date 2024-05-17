// api.js
export async function getCmdProcess(params) {
    const baseUrl = 'http://192.168.8.1/goform/goform_get_cmd_process?isTest=false&cmd=';
    const url = `${baseUrl}${encodeURIComponent(params)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

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
        console.error('Error fetching data:', error);
        return null;
    }
}


export async function sendLoginRequest(username, password) {
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


