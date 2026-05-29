// Core => basic tensor logic
// Backend-CPU => calculations without WebGL optimalization
// Layers => needed for the model loading and prediction logic
importScripts(
	"config/tf-config.js",
	"tf-core.min.js",
	"tf-backend-cpu.min.js",
	"tf-layers.min.js",
    "utils/whitelist.js",
	"utils/punycode-checker.js",
	"utils/url-tokenizer.js",
);

console.log("Background script running and modules imported");

let model = null;
let useLocalAI = false;

// This function shows a warning popup when a phishing attempt is detected.
function showPopup(url, reason) {
	console.warn(`PHISHING DETECTED! Reason: ${reason}, URL: ${url}`);
	// TODO: ADD CALLBACK TO OPEN THE POPUP WITH THE URL AND REASON
}

// This function runs a test benchmark to detemine if the local AI model can be used or not on the client's device.
async function performBenchmark() {
	const performanceThreshold = 100; // Time in ms
	console.log("Starting performance benchmarking");

	try {
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
			useLocalAI = true;
			console.log("Local AI model performance is sufficient.");
		} else {
			useLocalAI = false;
			console.warn("Performance benchmark exceeded threshold, falling back on server-sided AI");
		}
	} catch (err) {
		console.error("Error during benchmarking: ", err);
	}
}

// This function loads the AI model and runs the benchmark to determine if local AI can be used on the user's device.
async function initExtension() {
	try {
		console.log("Initializing AI configuration");
		await tf.setBackend("cpu");

		const modelUrl = chrome.runtime.getURL("model/model.json");
		model = await tf.loadLayersModel(modelUrl);
		console.log("AI model loaded successfully");

		await performBenchmark();
	} catch (err) {
		console.error("Error while initializing extension: ", err);
	}
}

initExtension();

// This listener starts when the browser starts up and initializes the benchmark.
chrome.runtime.onStartup.addListener(() => {
	console.log("Browser started, running benchmark...");
	performBenchmark();
});

async function checkUrl(tabId, url) {
	if (!url || !url.startsWith("http")) return;

	console.log(`Starting security checks for: ${url}`);

    // 1. Whitelist check
    if (isWhitelisted(new URL(url).hostname)) {
        console.log("URL is whitelisted, skipping checks.");
        return;
    }

	// 2. Punycode check
	if (typeof isPunycode === "function") {
		const isPuny = isPunycode(url);
		if (isPuny) {
			console.log("Punycode detected, stopping further checks.");
			showPopup(url, "PUNYCODE_ATTEMPT");
			return;
		}
	}

	// 3. (final) AI Model check
	// We run the AI model check as the final step because it is the most resource intensive.
	await runAIModelCheck(tabId, url);
}

// AI Model check function
async function runAIModelCheck(tabId, url) {
	if (!useLocalAI || !model) {
		console.log("Local AI not available or disabled, sending to server-side analysis...");
		// TODO: IMPLEMENT SERVER-SIDED CHECK LOGIC
		// Sidenote: I had limited time, so i chose to prioritize the local AI implementation. That way at we can see the AI model in action. I am willing to work on this project further and add the server-sided logic in a future update. For now (final work) i made the decision to just go with local AI only.
		return;
	}

	try {
		console.log("Processing URL with local AI");
		let domResults = null;

		try {
			// Inject tokenizer into the tab to perform on-page checks
			await chrome.scripting.executeScript({
				target: { tabId: tabId },
				files: ["utils/url-tokenizer.js"],
			});

			// Execute extraction logic in tab
			const scriptResult = await chrome.scripting.executeScript({
				target: { tabId: tabId },
				// Runs directly in the tab instead of the background script.
				func: (urlString) => {
					const urlObject = new URL(urlString);
					const hostname = urlObject.hostname;
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
				args: [url],
			});

			if (scriptResult && scriptResult[0] && scriptResult[0].result) {
				domResults = scriptResult[0].result;
			}
		} catch (scriptErr) {
			console.warn("Could not extract DOM features. Falling back to URL-only features.", scriptErr.message);
		}

		const featureArray = await extractFeaturesFromUrl(url, domResults);
		const inputTensor = tf.tensor2d([featureArray], [1, 31]);
		const prediction = model.predict(inputTensor);
		const scoreData = prediction.dataSync();
		const phishingScore = scoreData[0];

		inputTensor.dispose();
		prediction.dispose();

		console.log(`AI verdict for ${url}: ${phishingScore.toFixed(4)}`);

		if (phishingScore < 0.2) {
			showPopup(url, "AI_PREDICTION_HIGH_RISK");
		} else if (phishingScore < 0.5) {
			console.warn(`LOCAL AI IS SUSPICIOUS, MAKING SERVER-SIDED CHECK FOR SECOND OPINION`);
		}
	} catch (err) {
		console.error("Error during local AI processing: ", err);
	}
}

// Listen for tab updates to trigger checks when a page is finished loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url) {
		checkUrl(tabId, tab.url);
	}
});
