console.log("Background script running");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
		console.log("Tab updated:", tab.url);

		// Make a post request to backend to check if the URL is safe
		fetch("http://localhost:5001/check-url", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url: tab.url }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.safe === "unsafe") {
					// Alert the user about the unsafe URL
					// SOON TO BE REPLACE WITH A REAL EXTENSION POPUP ALERT
					console.log("Unsafe URL detected: " + data.reason);
					// Redirect to educational page
					chrome.tabs.update(tabId, { url: data.redirectUrl });
				}
			});
	}
});
