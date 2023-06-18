let loading = document.getElementById('loading');
let result = document.getElementById('result');

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({ command: "setStatus" });
});

document.addEventListener('DOMContentLoaded', function () {
    // Get max_tokens from storage and set it in the input field
    chrome.storage.local.get(['max_tokens'], function (result) {
        document.getElementById('max_tokens').value = result.max_tokens || 60;
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


document.getElementById('clear').addEventListener('click', function () {
    result.innerHTML = "Highlight text and click 'QuickGPT Search' to get results";
    chrome.storage.local.set({ status: 'idle', chatGPTResponse: '' });
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
