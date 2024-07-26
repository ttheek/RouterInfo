/**
 * cconfiguration settings.
 */
const config = {
    username: null,
    password: null,
    theme: null,
    baseURL: "http://192.168.8.1/goform",
    get getURL() {
        return `${this.baseURL}/goform_get_cmd_process`;
    },
    get setURL() {
        return `${this.baseURL}/goform_set_cmd_process`;
    },

    /**
     * Initializes the configuration by loading data from Chrome storage.
     * @returns {Promise<void>} A promise that resolves when the data is loaded.
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['theme', 'credentials'], (result) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }

                if (result.theme) {
                    this.theme = result.theme;
                }

                if (result.credentials) {
                    const credentials = atob(result.credentials).split(':');
                    this.username = btoa(credentials[0]);
                    this.password = btoa(credentials[1]);
                }

                resolve();
            });
        });
    }
};

export default config;
