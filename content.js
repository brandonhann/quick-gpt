chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.command === "queryGPT") {
            queryGPT(request.text);
        }
    }
);

function setStorageItem(item) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(item, resolve);
    });
}

let prefix = '';
let suffix = '';

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // existing code...
        if (request.command === "prefixChanged") {
            prefix = request.prefix;
        }
        if (request.command === "suffixChanged") {
            suffix = request.suffix;
        }
    }
);

async function queryGPT(text) {
    // Replace with your API key
    const api_key = "your-api-here";

    // Retrieve max_tokens value from storage
    let max_tokens = await new Promise((resolve) => {
        chrome.storage.local.get(['max_tokens'], function (result) {
            resolve(parseInt(result.max_tokens) || 60);
        });
    });

    console.log('Prefix:', prefix);
    console.log('Original text:', text);
    console.log('Suffix:', suffix);

    text = `${prefix ? prefix + ' ' : ''}${text}${suffix ? ' ' + suffix : ''}`;

    console.log('Final text:', text);

    // Prepare the request body and headers
    const body = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "user",
            content: text
        }],
        max_tokens: max_tokens,
    });
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`
    };

    // Log the request details
    console.log('Sending request with body:', body);
    console.log('And headers:', headers);

    // Send the request
    return new Promise((resolve, reject) => {
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: headers,
            body: body,
        })
            .then(response => {
                const jsonData = response.json();
                if (!response.ok) {
                    jsonData.then(responseData => {
                        console.error('Server response:', responseData);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    })
                }
                return jsonData;
            })
            .then(data => {
                console.log('API response:', data);

                console.log(data.choices[0]);
                const chatGPTResponse = data.choices[0].message.content;
                console.log('API response:', JSON.stringify(chatGPTResponse));


                // Store the response and update status, then send the message to background page
                setStorageItem({ chatGPTResponse, status: 'completed' })
                    .then(() => {
                        chrome.runtime.sendMessage({ command: "setStatus" });
                        resolve();
                    });
            })
            .catch(error => {
                console.error('Error making API request:', error);
                reject(error);
            });
    });
}