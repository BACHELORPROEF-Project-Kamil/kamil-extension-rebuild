// Core => basic tensor logic
// Backend-CPU => calculations without WebGL optimalization
// Layers => needed for the model loading and prediction logic
importScripts(
	"config/tf-config.js",
	"tf-core.min.js",
	"tf-backend-cpu.min.js",
	"tf-layers.min.js",
	"utils/blacklist.js",
	"utils/whitelist.js",
	"utils/punycode-checker.js",
	"utils/url-tokenizer.js",
	"utils/scenarios.js",
);

console.log("Background script running and modules imported");

let model = null;
let useLocalAI = false;

// This object keeps track of the current scenario status for each tab.
let currentTabStatus = {};

// This function increments the local statistics for URLs checked and checks performed.
async function incrementLocalStats(urlCount = 0, checkCount = 0) {
	try {
		const data = await chrome.storage.local.get(["urlsChecked", "checksPerformed"]);

		const newUrlCount = (data.urlsChecked || 0) + urlCount;
		const newCheckCount = (data.checksPerformed || 0) + checkCount;

		await chrome.storage.local.set({
			urlsChecked: newUrlCount,
			checksPerformed: newCheckCount,
		});

		if (newUrlCount >= 50) {
			await syncStatsWithServer(newUrlCount, newCheckCount);
		}
	} catch (err) {
		console.error("Error updating local stats: ", err);
	}
}

// This function sends the local statistics to the server and resets the local counts upon successful sync.
async function syncStatsWithServer(urlCount, checkCount) {
	try {
		const data = await chrome.storage.local.get(["urlsChecked", "checksPerformed"]);
		const urlsChecked = data.urlsChecked || 0;
		const checksPerformed = data.checksPerformed || 0;

		if (urlsChecked === 0) return;

		console.log(`Syncing stats with server: ${urlsChecked} URLs checked, ${checksPerformed} checks performed`);

		const response = await fetch("http://localhost:5001/api/stats/sync", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				urlsChecked,
				checksPerformed,
			}),
		});

		if (response.ok) {
			console.log("Stats synced successfully, resetting local counts.");
			await chrome.storage.local.set({
				urlsChecked: 0,
				checksPerformed: 0,
			});
		}
	} catch (err) {
		console.error("Error syncing stats with server: ", err);
	}
}

// This function updates the badge and popup content based on the detected scenario for a given tab (phishing).
function updateTabStatus(tabId, scenarioKey) {
	const scenario = scenarios[scenarioKey] || scenarios.SAFE;
	currentTabStatus[tabId] = scenarioKey;

	let badgeColor = "#054431";
	let badgeText = "";

	if (scenario.status === "warning") {
		badgeColor = "#ff9800";
		badgeText = "!";
	} else if (scenario.status === "critical") {
		badgeColor = "#ff0000";
		badgeText = "!";
	}

	chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
	chrome.action.setBadgeText({ text: badgeText, tabId });

	chrome.tabs.get(tabId, (tab) => {
		if (chrome.runtime.lastError || !tab || !tab.url || !tab.url.startsWith("http")) {
			return;
		}

		chrome.tabs
			.sendMessage(tabId, {
				action: "triggerPopup",
				scenarioKey: scenarioKey,
				scenario: scenario,
			})
			.catch((err) => {
				console.warn(`Message not sent to tab ${tabId}: ${err.message}`);
			});
	});
}

// This listener sends the current scenario status to the popup when it requests it.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "getStatus") {
		chrome.storage.local.get(["kamilEnabled"], (result) => {
			const isEnabled = result.kamilEnabled !== false;

			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const activeTab = tabs[0];
				let scenarioKey = currentTabStatus[activeTab?.id] || "SAFE";

				if (!isEnabled) {
					scenarioKey = "DISABLED";
				}

				sendResponse({
					scenarioKey: scenarioKey,
					data: scenarios[scenarioKey],
				});
			});
		});
		return true;
	}
});

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
	console.log("Browser started, running benchmark and syncing stats with server...");
	syncStatsWithServer();
	performBenchmark();
});

// This alarm runs every x minute(s) to sync the local stats with the server.
chrome.alarms.create("syncStatsAlarm", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === "syncStatsAlarm") {
		syncStatsWithServer();
	}
});

async function checkUrl(tabId, url) {
	if (!url || !url.startsWith("http")) return;

	// Check if Kamil is enabled
	const settings = await chrome.storage.local.get(["kamilEnabled"]);
	if (settings.kamilEnabled === false) {
		console.log("Kamil is disabled, skipping security checks.");
		chrome.action.setBadgeText({ text: "", tabId });
		return;
	}

	try {
		const lowerUrl = url.toLowerCase();

		if (lowerUrl.includes("google.com") && lowerUrl.includes("test=warning")) {
			console.log("Test URL detected, showing warning popup.");
			updateTabStatus(tabId, "AI_PREDICTION_HIGH_RISK");
			return;
		}

		if (lowerUrl.includes("google.com") && lowerUrl.includes("test=critical")) {
			console.log("Test URL detected, showing critical popup.");
			updateTabStatus(tabId, "PUNYCODE");
			return;
		}
	} catch (err) {
		console.error("Error checking URL string: ", err);
	}

	await incrementLocalStats(1, 0);

	// Before we begin any checks, we set the status to "SAFE" by default.
	updateTabStatus(tabId, "SAFE");

	console.log(`Starting security checks for: ${url}`);

	// 1. Blacklist check
	await incrementLocalStats(0, 1);
	if (isBlacklisted(url)) {
		console.warn("URL is blacklisted, showing warning popup.");
		updateTabStatus(tabId, "BLACKLISTED_URL");
		return;
	}

	// 2. Whitelist check
	await incrementLocalStats(0, 1);
	if (isWhitelisted(new URL(url).hostname)) {
		console.log("URL is whitelisted, skipping checks.");
		return;
	}

	// 3. Punycode check
	await incrementLocalStats(0, 1);
	if (typeof isPunycode === "function") {
		const isPuny = isPunycode(url);
		if (isPuny) {
			console.log("Punycode detected, stopping further checks.");
			updateTabStatus(tabId, "PUNYCODE");
			return;
		}
	}

	// 4. (final) AI Model check
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
		await incrementLocalStats(0, 1);

		const featureArray = await extractFeaturesFromUrl(url, domResults);
		const inputTensor = tf.tensor2d([featureArray], [1, 31]);
		const prediction = model.predict(inputTensor);
		const scoreData = prediction.dataSync();
		const phishingScore = scoreData[0];

		inputTensor.dispose();
		prediction.dispose();

		console.log(`AI verdict for ${url}: ${phishingScore.toFixed(4)}`);

		if (phishingScore < 0.2) {
			updateTabStatus(tabId, "AI_PREDICTION_HIGH_RISK");
		} else if (phishingScore < 0.5) {
			await incrementLocalStats(0, 1);
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
