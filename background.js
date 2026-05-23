console.log("Background script running");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
		console.log("Tab updated:", tab.url);

		// Make a post request to backend to check if the URL is safe
		fetch("http://localhost:5001/api/check-url", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url: tab.url }),
		})
            // Async function to handle the response and check for errors
			.then(async (res) => {
				if (!res.ok) {
					const contentType = res.headers.get("content-type");
					if (contentType && contentType.includes("application/json")) {
						const errorData = await res.json();
						throw new Error(`Server error: (${res.status}): ${JSON.stringify(errorData)}`);
					} else {
						const errorText = await res.text();
						throw new Error(`Server Error: (${res.status}): ${errorText.substring(0, 100)}...`);
					}
				}

				return res.json();
			})
			.then((data) => {
				if (data.status === "unsafe") {
					// Alert the user about the unsafe URL
					// SOON TO BE REPLACE WITH A REAL EXTENSION POPUP ALERT
					console.log("Unsafe URL detected: " + data.reason);
					// Redirect to educational page
					chrome.tabs.update(tabId, { url: data.redirectUrl });
				}
			})
			.catch((err) => {
				console.error("Error checking URL: ", err);
			});
	}
});
