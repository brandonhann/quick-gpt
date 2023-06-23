document.addEventListener('DOMContentLoaded', function () {
    let loading = document.getElementById('loading');
    let result = document.getElementById('result');

    chrome.runtime.sendMessage({ command: "setStatus" });

    chrome.storage.local.get(['max_tokens', 'prefix', 'suffix'], function (result) {
        document.getElementById('max_tokens').value = result.max_tokens || 60;
        document.getElementById('prefix').value = result.prefix || '';
        document.getElementById('suffix').value = result.suffix || '';
    });

    document.getElementById('prefix').addEventListener('change', function () {
        console.log('Setting prefix:', this.value);
        chrome.storage.local.set({ prefix: this.value });
        let value = this.value;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { command: "prefixChanged", prefix: value });
        });
    });

    document.getElementById('suffix').addEventListener('change', function () {
        console.log('Setting suffix:', this.value);
        chrome.storage.local.set({ suffix: this.value });
        let value = this.value;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { command: "suffixChanged", suffix: value });
        });
    });

    document.getElementById('clear').addEventListener('click', function () {
        result.innerHTML = "Highlight text and click 'QuickGPT Search' to get results";
        chrome.storage.local.set({ status: 'idle', chatGPTResponse: '', prefix: '', suffix: '' });

        // Clear the prefix and suffix input fields and notify the content script about it
        document.getElementById('prefix').value = '';
        document.getElementById('suffix').value = '';

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { command: "prefixChanged", prefix: '' });
            chrome.tabs.sendMessage(tabs[0].id, { command: "suffixChanged", suffix: '' });
        });
    });

    document.getElementById('max_tokens').addEventListener('change', function () {
        chrome.storage.local.set({ max_tokens: this.value });
    });

    document.getElementById('copy-btn').addEventListener('click', function () {
        // Get the result div's text content
        let textToCopy = document.getElementById('result').textContent.trim();

        // Use the Clipboard API to write the text to the clipboard
        navigator.clipboard.writeText(textToCopy).then(function () {
            // Show some indication that the text was copied
            console.log('Copied to clipboard!');
        }, function (err) {
            // Handle errors
            console.error('Could not copy text: ', err);
        });
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.command === "updateGPTResponse") {
            console.log('Updating popup:', request.data);
            const { status, chatGPTResponse } = request.data;
            if (status === 'loading') {
                loading.classList.remove('hidden');
                result.classList.add('hidden');
            } else if (status === 'completed') {
                result.innerHTML = chatGPTResponse || 'No data';
                loading.classList.add('hidden');
                result.classList.remove('hidden');
            } else {
                loading.classList.add('hidden');
                result.innerHTML = "Highlight text and click 'QuickGPT Search' to get results";
            }
        }
    });
});
