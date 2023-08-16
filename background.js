chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "quickGPT",
        title: "QuickGPT Search",
        contexts: ["selection"],
    });

    // Set an initial status when the extension is installed
    chrome.storage.local.set({ status: 'idle', chatGPTResponse: '' });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "quickGPT") {
        // Update the status when a search is started
        chrome.storage.local.set({ status: 'loading' }, function () {
            chrome.tabs.sendMessage(tab.id, { command: "queryGPT", text: info.selectionText });
        });
    }
});

// Listen for a request from content or popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "setStatus") {
        // When status is set, send a message to the popup script
        chrome.storage.local.get(['status', 'chatGPTResponse'], function (data) {
            console.log('Got status:', data.status);
            chrome.runtime.sendMessage({ command: "updateGPTResponse", data });
        });
    } else if (request.command === "prefixChanged" || request.command === "suffixChanged") {
        // Update the status when the prefix or suffix is changed
        chrome.storage.local.set({ status: 'idle' });
    }
});