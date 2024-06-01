document.getElementById('start').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'collectDataForYears' }, (response) => {
            console.log('Data collection started');
        });
    });
});
