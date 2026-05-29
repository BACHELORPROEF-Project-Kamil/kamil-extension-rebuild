// Core => basic tensor logic
// Backend-CPU => calculations without WebGL optimalization
// Layers => needed for the model loading and prediction logic
importScripts(
	"config/tf-config.js",
	"tf-core.min.js",
	"tf-backend-cpu.min.js",
	"tf-layers.min.js",
	"utils/url-tokenizer.js",
);

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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
		console.log(`Tab updated: ${tab.url}`);

		if (useLocalAI && model) {
			console.log("Processing URL with local AI");

			try {
				let domResults = null;

				try {
					// Inject tokenizer into the tab to perform on-page checks
					await chrome.scripting.executeScript({
						target: { tabId: tabId },
						files: ["utils/url-tokenizer.js"],
					});

					// Execute the extraction logic in the tab context
					const scriptResult = await chrome.scripting.executeScript({
						target: { tabId: tabId },
						func: (urlString) => {
							const urlObject = new URL(urlString);
							const hostname = urlObject.hostname;

							// Gather all features that require DOM access
							return {
								10: checkFavicon(hostname),
								13: checkRequestURL(hostname),
								14: checkAnchorURL(hostname),
								15: checkLinksInScript(hostname),
								16: checkServerFormHandler(hostname),
								17: checkInfoEmail(),
								18: checkAbnormalURL(hostname, urlString),
								19: checkWebsiteForwarding(),
								20: checkStatusBarCustomization(),
								21: checkDisabledRightClick(),
								22: checkUsingPopUpWindow(),
								23: checkIFrameRedirection(),
							};
						},
						args: [tab.url],
					});

					if (scriptResult && scriptResult[0] && scriptResult[0].result) {
						domResults = scriptResult[0].result;
					}
				} catch (scriptErr) {
					console.warn("Could not extract DOM features. Falling back to URL-only features.", scriptErr.message);
				}

				const featureArray = await extractFeaturesFromUrl(tab.url, domResults);
				const inputTensor = tf.tensor2d([featureArray], [1, 31]);
				const prediction = model.predict(inputTensor);
				const scoreData = prediction.dataSync();
				const phishingScore = scoreData[0];

				inputTensor.dispose();
				prediction.dispose();

				console.log(`AI verdict for ${tab.url}: ${phishingScore.toFixed(4)}`);

				if (phishingScore < 0.2) {
					console.warn(`LOCAL AI ALERT: PHISHING DETECTED`);
					// ADD CODE TO SHOW POPUP WITH CORRECT VERSION OF KAMIL

					return;
				}

				if (phishingScore < 0.5) {
					console.warn(`LOCAL AI IS SUSPICIOUS, MAKING SERVER-SIDED CHECK FOR SECOND OPINION`);
				}
			} catch (err) {
				console.error("Error during local AI processing: ", err);
			}
		} else {
			console.log("Local AI not available, sending URL to server for further analysis");
			// ADD CODE TO SEND URL TO SERVER AND HANDLE RESPONSE
		}
	}
});
