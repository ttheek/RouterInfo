let username
let password 
let theme
const baseURL = "http://192.168.8.1/goform"
const getURL = `${baseURL}/goform_get_cmd_process`
const setURL = `${baseURL}/goform_set_cmd_process`

chrome.storage.sync.get(['theme', 'credentials'], function (result) {
    if (result.theme) {
        theme = result.theme;
    }
    if (result.credentials) {
        const credentials = atob(result.credentials).split(':');
        username = btoa(credentials[0]);
        password = btoa(credentials[1]);
    }
});

export {username,password,theme,getURL,setURL}