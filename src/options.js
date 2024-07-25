document.addEventListener('DOMContentLoaded', function () {
    const getElm = (id) => document.getElementById(id);
    const themeSelect = getElm('theme');
    const usernameInput = getElm('username');
    const passwordInput = getElm('password');
    const saveBtn = getElm('saveBtn');
    const snackbar = getElm('snackbar');

    // Load saved settings when the options page is loaded
    chrome.storage.sync.get(['theme', 'credentials'], function (result) {
        if (result.theme) {
            themeSelect.value = result.theme;
        }
        if (result.credentials) {
            const credentials = atob(result.credentials).split(':');
            usernameInput.value = credentials[0];
            passwordInput.value = credentials[1];
        }
    });

    
    saveBtn.addEventListener('click', function () {
        const theme = themeSelect.value;
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        const credentials = btoa(`${username}:${password}`);
        
        chrome.storage.sync.set({ theme, credentials }, function () {
            showSnackbar('Options saved.');
        });
    });

    function showSnackbar(message) {
        snackbar.textContent = message;
        snackbar.className = 'snackbar show';
        setTimeout(() => {
            snackbar.className = snackbar.className.replace('show', '');
        }, 3000);
    }
});
