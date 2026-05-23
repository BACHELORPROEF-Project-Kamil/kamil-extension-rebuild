// Core => basic tensor logic
// Backend-CPU => calculations without WebGL optimalization
// Layers => needed for the model loading and prediction logic
importScripts("config/tf-config.js", "tf-core.min.js", "tf-backend-cpu.min.js", "tf-layers.min.js", "utils/url-tokenizer.js");

console.log("Background script running and modules imported");

let model = null;
let useLocalAI = false; // False until computer has proven to be powerful enough to run the model locally

async function initExtension() {
	const performanceThreshold = 100; // Time in ms

	try {
		console.log("Initializing AI configuration");

		// Explicitly set the backend to cpu rendering to avoid any WebGL related issues
		await tf.setBackend("cpu");

		console.log("AI model loaded successfully");

		const modelUrl = chrome.runtime.getURL("model/model.json");
		model = await tf.loadLayersModel(modelUrl);

		console.log("Starting performance benchmarking");
		const startTime = performance.now();

		if (model) {
			const dummyInput = tf.zeros([1, 31]);
			const prediction = model.predict(dummyInput);
			dummyInput.dispose();
			prediction.dispose();
		}

		const endTime = performance.now();
		const duration = endTime - startTime;
		console.log(`Performance benchmark completed in ${duration.toFixed(2)}ms`);

		if (duration < performanceThreshold) {
			useLocalAI = true; // Computer has proven itself capable of running the model locally
			console.log("Local AI model loaded and ready for use");
		} else {
			console.warn("Performance benchmark exceeded threshold, falling back on server-sided AI");
		}
	} catch (err) {
		console.error("Error while initializing AI model: ", err);
	}
}

initExtension();

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
