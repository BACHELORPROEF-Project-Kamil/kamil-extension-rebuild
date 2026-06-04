function updateUI(scenario) {
	document.body.classList.remove("status-safe", "status-warning", "status-critical");
	document.body.classList.add(`status-${scenario.status}`);

	document.querySelector(".mascot-circle").classList.add(`status-${scenario.status}`);

	document.querySelector(".status-title").innerText = scenario.title;
	document.querySelector(".status-text").innerText = scenario.description;

	const mascotImg = document.querySelector(".mascot-img");
	if (scenario.status === "critical") {
		mascotImg.src = "/ui/assets/kamil_critical.webp";
		mascotImg.alt = "Kamil de kameleon kijkt verschrikt en waarschuwt je";
	} else if (scenario.status === "warning") {
		mascotImg.src = "/ui/assets/kamil_warning.webp";
		mascotImg.alt = "Kamil de kameleon kijkt bezorgd en waarschuwt je";
	} else {
		mascotImg.src = "/ui/assets/kamil_safe.webp";
		mascotImg.alt = "Kamil de kameleon steekt zijn duim op";
	}

	const learnMoreLink = document.querySelector(".link-primary");

	if (learnMoreLink) {
		if (scenario.blogUrl && scenario.blogUrl !== "#") {
			learnMoreLink.href = scenario.blogUrl;
			learnMoreLink.style.display = "inline-block";

			learnMoreLink.onclick = (event) => {
				event.preventDefault();
				chrome.tabs.create({ url: scenario.blogUrl });
			};
		} else {
			learnMoreLink.style.display = "none";
		}
	}
}

const reportBtn = document.querySelector(".link-danger");
if (reportBtn) {
	reportBtn.addEventListener("click", () => {
		reportBtn.innerText = "Reporting...";
		reportBtn.disabled = true;

		setTimeout(() => {
			reportBtn.innerText = "Rapport verzonden ✓";
		}, 1500);
	});
}

document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const isIframe = urlParams.get("display") === "iframe";

	const mainView = document.getElementById("main-view");
	const settingsView = document.getElementById("settings-view");
	const settingsBtn = document.getElementById("settings-btn");
	const backBtn = document.getElementById("back-btn");
	const kamilToggle = document.getElementById("kamil-toggle");

	if (settingsBtn) {
		settingsBtn.addEventListener("click", () => {
			mainView.style.display = "none";
			settingsView.style.display = "flex";
		});
	}

	if (backBtn) {
		backBtn.addEventListener("click", () => {
			settingsView.style.display = "none";
			mainView.style.display = "flex";
		});
	}

	if (kamilToggle) {
		chrome.storage.local.get(["kamilEnabled"], (result) => {
			const isEnabled = result.kamilEnabled !== false;
			kamilToggle.checked = isEnabled;
		});

		kamilToggle.addEventListener("change", () => {
			const isEnabled = kamilToggle.checked;
			chrome.storage.local.set({ kamilEnabled: isEnabled }, () => {
				console.log("Kamil status changed to: ", isEnabled);
				// Refresh status from background
				chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
					if (res && res.data) {
						updateUI(res.data);
					}
				});
			});
		});
	}

	const closeBtn = document.getElementById("close-btn");
	if (closeBtn) {
		if (isIframe) {
			closeBtn.style.display = "block";
		}

		closeBtn.addEventListener("click", () => {
			window.parent.postMessage({ action: "closeKamilIframe" }, "*");
		});
	}

	chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
		if (res && res.data) {
			updateUI(res.data);
		}
	});
});

chrome.runtime.onMessage.addListener((message) => {
	if (message.action === "triggerPopup" && message.scenario) {
		updateUI(message.scenario);
	}
});
