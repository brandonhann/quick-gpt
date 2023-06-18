chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.command === "queryGPT") {
            // When search is triggered, set status to 'loading'
            chrome.storage.local.set({ status: 'loading' }, function () {
                queryGPT(request.text);
            });
        }
    }
);

function setStorageItem(item) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(item, resolve);
    });
}

async function queryGPT(text) {

    // Replace with your API key
    const api_key = "yourapikey";

    // Retrieve max_tokens value from storage
    let max_tokens;
    chrome.storage.local.get(['max_tokens'], function (result) {
        max_tokens = result.max_tokens || 60;
    });

    const response = await fetch('https://api.openai.com/v1/engines/text-davinci-002/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify({
            prompt: text,
            max_tokens: max_tokens,
        }),
    });
    const data = await response.json();
    console.log(data.choices[0]);
    const chatGPTResponse = data.choices[0].text;

    // Store the response and update status, then send the message to background page
    await setStorageItem({ chatGPTResponse, status: 'completed' });
    chrome.runtime.sendMessage({ command: "setStatus" });
}
