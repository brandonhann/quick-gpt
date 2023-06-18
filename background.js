chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "quickGPT",
        title: "QuickGPT Search",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "quickGPT") {
        chrome.tabs.sendMessage(tab.id, { command: "queryGPT", text: info.selectionText });
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
    }
});
