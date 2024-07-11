const username = btoa("Operator"); // Base64 encoded username Operator
const password = btoa("oVAHZXeH"); // Base64 encoded password oVAHZXeH
const baseURL = "http://192.168.8.1/goform"
const getURL = `${baseURL}/goform_get_cmd_process`
const setURL = `${baseURL}/goform_set_cmd_process`
export {username,password,getURL,setURL}