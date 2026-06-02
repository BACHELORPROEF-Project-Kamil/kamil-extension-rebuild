document.addEventListener("DOMContentLoaded", () => {
	chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
		if (res && res.data) {
			const scenario = res.data;

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

					learnMoreLink.onclick = (e) => {
						e.preventDefault();
						chrome.tabs.create({ url: scenario.blogUrl });
					};
				} else {
					learnMoreLink.style.display = "none";
				}
			}
		}
	});
});
