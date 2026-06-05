const iframe = document.createElement("iframe");
iframe.src = chrome.runtime.getURL("ui/popup.html?display=iframe");

iframe.style.position = "fixed";
iframe.style.top = "20px";
iframe.style.right = "20px";
iframe.style.width = "360px";
iframe.style.height = "549px";
iframe.style.zIndex = "2147483647";
iframe.style.border = "none";
iframe.style.display = "none";

document.body.appendChild(iframe);

window.addEventListener("message", (event) => {
	if (event.data && event.data.action === "closeKamilIframe") {
		iframe.style.display = "none";
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "triggerPopup") {
		const scenario = message.scenario;

		if (scenario.status === "critical" || scenario.status === "warning") {
			iframe.style.display = "block";
		} else {
			iframe.style.display = "none";
		}
	}
});
