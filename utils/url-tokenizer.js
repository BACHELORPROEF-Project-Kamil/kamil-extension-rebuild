const { all } = require("@tensorflow/tfjs");

console.log("URL Tokenizer module loaded.");

// This function checks if the hostname (url) is an IP address or not.
function checkIPAdress(hostname) {
	const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
	return ipPattern.test(hostname) ? 1 : -1;
}

// This function checks the length of the URL and categorizes it.
function checkURLLength(url) {
	if (url.length < 54) {
		return -1; // Likely safe
	} else if (url.length >= 54 && url.length <= 75) {
		return 0; // Could be suspicious
	} else {
		return 1; // Could be phishing
	}
}

// This function checks if the hostname belongs to a known URL shortening service.
function checkShorteningService(hostname) {
	const shorteners = ["bit.ly", "goo.gl", "tinyurl.com", "ow.ly", "t.co", "is.gd", "buff.ly", "adf.ly", "bit.do", "cutt.ly"];
	return shorteners.includes(hostname) ? 1 : -1;
}

// This function checks if the URL contains an "@" symbol.
function checkAtSymbol(url) {
	return url.includes("@") ? 1 : -1;
}

// This function checks if the URL contains common redirecting patterns.
function checkRedirecting(hostname) {
	const redirectingPatterns = ["/@", "//", "/redirect?", "/redir?", "/redirect/", "/redir/"];
	return redirectingPatterns.includes(hostname) ? 1 : -1;
}

// This function checks if the hostname contains suspicious pre-suffixe.
function checkPreSuffix(hostname) {
	const preSuffixPattern = /[-.]/;
	return preSuffixPattern.test(hostname) ? 1 : -1;
}

// This function counts the number of subdomains in the hostname.
function checkSubdomainCount(hostname) {
	const subdomainCount = hostname.split(".").length - 1;
	if (subdomainCount === 0) {
		return -1; // Likely safe
	} else if (subdomainCount === 1) {
		return 0; // Could be suspicious
	} else {
		return 1; // Could be phishing
	}
}

// This function checks if the URL uses HTTPS.
function checkHTTPS(url) {
	return url.startsWith("https://") ? 1 : -1;
}

// This function checks the registration length of the domain (how long ago it was registered).
function checkDomainRegistrationLength(hostname) {
	// Placeholder as this is difficult to implement in Belgium bacause of the strict privacy laws.
	return 0;
}

// This function checks if the favicon of the page matches the hostname.
function checkFavicon(hostname) {
	const faviconNode = document.querySelector("link[rel~='icon']");

	if (!faviconNode) {
		return 0; // Could be suspicious
	}

	const faviconUrl = new URL(faviconNode.href);

	if (faviconUrl.hostname === hostname) {
		return -1; // Likely safe
	} else {
		return 1; // Could be phishing
	}
}

// This function checks if the URL is using a non-standard port.
function checkNonStandardPort(urlObject) {
	const port = urlObject.port;

	if (port === "" || port === "80" || port === "443") {
		return -1; // Likely safe
	} else {
		return 1; // Could be suspicious
	}
}

// This function checks if the hostname contains "https".
function checkHTTPSDomainURL(hostname) {
	const lowerCaseHostname = hostname.toLowerCase();

	if (lowerCaseHostname.includes("https")) {
		return 1; // Could be phishing
	} else {
		return -1; // Likely safe
	}
}

// This function checks the percentage of external resources.
function checkRequestURL(hostname) {
	try {
		const images = document.getElementsByTagName("img");
		const videos = document.getElementsByTagName("video");
		const audios = document.getElementsByTagName("audio");
		const scripts = document.getElementsByTagName("script");
		const links = document.getElementsByTagName("link");

		const allResources = [...images, ...videos, ...audios, ...scripts, ...links];

		if (allResources.length === 0) {
			return -1; // Likely safe
		}

		let externalResourceCount = 0;

		allResources.forEach((resource) => {
			const src = resource.src || resource.href;

			if (src) {
				try {
					const resourceUrl = new URL(src);
					if (resourceUrl.hostname !== hostname && resourceUrl.hostname !== "") {
						externalResourceCount++;
					}
				} catch (err) {
					// Skip invalid URLs
				}
			}
		});

		const externalResourcePercentage = (externalResourceCount / allResources.length) * 100;

		if (externalResourcePercentage < 25) {
			return -1; // Likely safe
		} else if (externalResourcePercentage >= 25 && externalResourcePercentage <= 75) {
			return 0; // Could be suspicious
		} else {
			return 1; // Could be phishing
		}
	} catch (err) {
		console.log("Error while checking request URL: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks the percentage of unsafe anchors.
function checkAnchorURL(hostname) {
	try {
		const anchors = document.getElementsByTagName("a");

		if (anchors.length === 0) {
			return -1; // Likely safe
		}

		let unsafeAnchorCount = 0;

		for (let i = 0; i < anchors.length; i++) {
			const href = anchors[i].getAttribute("href");

			if (!href || href === "#" || href.toLowerCase().startsWith("javascript:void(0)")) {
				unsafeAnchorCount++;
				continue;
			}

			try {
				const anchorUrl = new URL(href, document.baseURI);

				if (anchorUrl.hostname !== hostname && anchorUrl.hostname !== "") {
					unsafeAnchorCount++;
				}
			} catch (err) {
				unsafeAnchorCount++;
			}
		}

		const unsafeAnchorPercentage = (unsafeAnchorCount / anchors.length) * 100;

		if (unsafeAnchorPercentage < 25) {
			return -1; // Likely safe
		} else if (unsafeAnchorPercentage >= 25 && unsafeAnchorPercentage <= 75) {
			return 0; // Could be suspicious
		} else {
			return 1; // Could be phishing
		}
	} catch (err) {
		console.log("Error while checking anchor URL: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks the percentage of external links in scripts, stylesheets and meta tags.
function checkLinksInScript(hostname) {
	try {
		const scripts = document.getElementsByTagName("script");
		const links = document.getElementsByTagName("link");
		const metas = document.getElementsByTagName("meta");

		const allElements = [...scripts, ...links, ...metas];

		if (allElements.length === 0) {
			return -1; // Likely safe
		}

		let externalLinkCount = 0;

		allElements.forEach((element) => {
			let urlAttribute = element.src || element.href;

			if (element.tagName.toLowerCase() === "meta" && element.getAttribute("content")) {
				const content = element.getAttribute("content");
				if (content.toLowerCase().includes("url=")) {
					urlAttribute = content.split("url=")[1];
				}
			}

			if (urlAttribute) {
				try {
					const absoluteUrl = new URL(urlAttribute, document.baseURI);

					if (absoluteUrl.hostname !== hostname && absoluteUrl.hostname !== "") {
						externalLinkCount++;
					}
				} catch (err) {
					// Skip invalid URLs
				}
			}
		});

		const externalLinkPercentage = (externalLinkCount / allElements.length) * 100;

		if (externalLinkPercentage < 25) {
			return -1; // Likely safe
		} else if (externalLinkPercentage >= 25 && externalLinkPercentage <= 75) {
			return 0; // Could be suspicious
		} else {
			return 1; // Could be phishing
		}
	} catch (err) {
		console.log("Error while checking links in script: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the page contains forms that submit to external servers or have no action.
function checkServerFormHandler(hostname) {
	try {
		const forms = document.getElementsByTagName("form");

		if (forms.length === 0) {
			return -1; // Likely safe
		}

		for (let i = 0; i < forms.length; i++) {
			const action = forms[i].getAttribute("action");

			if (!action || action === "#" || action.toLowerCase() === "about:blank") {
				return 1; // Could be phishing
				continue;
			}

			try {
				const actionUrl = new URL(action, document.baseURI);

				if (actionUrl.hostname !== hostname && actionUrl.hostname !== "") {
					return 0; // Could be suspicious
				}
			} catch (err) {
				return 0; // Could be suspicious
			}
		}
	} catch (err) {
		console.log("Error while checking server form handler: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the page contains email forms that could be used to steal information.
function checkInfoEmail() {
	try {
		const forms = document.getElementsByTagName("form");

		for (let i = 0; i < forms.length; i++) {
			const action = forms[i].getAttribute("action");
			if (action && action.toLowerCase().startsWith("mailto:")) {
				return 1; // Could be phishing
			}
		}

		const anchors = document.getElementsByTagName("a");

		for (let i = 0; i < anchors.length; i++) {
			const href = anchors[i].getAttribute("href");
			if (href && href.toLowerCase().startsWith("mailto:")) {
				return 1; // Could be phishing
			}
		}

		return -1; // Likely safe
	} catch (err) {
		console.log("Error while checking info email: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the URL is abnormal by looking for suspicious patterns in the hostname and page title.
function checkAbnormalURL(hostname, urlString) {
	try {
		const protocolMatches = urlString.match(/^(https?):\/\//i);
		if (protocolMatches && protocolMatches.length > 1) {
			return 1; // Could be phishing
		}

		const pageTitle = document.title ? document.title.toLowerCase() : "";
		const commonTargets = [
			"paypal",
			"kbc",
			"ing",
			"belfius",
			"bnpparibas",
			"hello bank",
			"n26",
			"revolut",
			"keytrade bank",
			"argenta",
			"microsoft",
			"google",
			"facebook",
			"twitter",
			"linkedin",
			"amazon",
			"apple",
			"itsme",
		];

		for (let target of commonTargets) {
			if (pageTitle.includes(target) && !hostname.toLowerCase().includes(target)) {
				return 1; // Could be phishing
			}
		}
		return -1; // Likely safe
	} catch (err) {
		console.log("Error while checking abnormal URL: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks the number of redirects that occurred during page load.
function checkWebsiteForwarding() {
	try {
		const navigationEntries = performance.getEntriesByType("navigation");

		if (navigationEntries.length > 0) {
			const redirectCount = navigationEntries[0].redirectCount;

			if (redirectCount <= 1) {
				return -1; // Likely safe
			} else if (redirectCount > 1 && redirectCount < 4) {
				return 0; // Could be suspicious
			} else {
				return 1; // Could be phishing
			}
		}
		return 0; // Could be suspicious
	} catch (err) {
		console.log("Error while checking website forwarding: ", err);
		return 0; // Could be suspicious
	}
}

function checkStatusBarCustomization() {
	try {
		const anchors = document.getElementsByTagName("a");

		for (let i = 0; i < anchors.length; i++) {
			const onMouseOver = anchors[i].getAttribute("onmouseover");
			const onMouseMove = anchors[i].getAttribute("onmousemove");

			if (
				onMouseOver &&
				(onMouseOver.toLowerCase().includes("window.status") || onMouseOver.toLowerCase().includes("status="))
			) {
				return 1; // Could be phishing
			}
			if (
				onMouseMove &&
				(onMouseMove.toLowerCase().includes("window.status") || onMouseMove.toLowerCase().includes("status="))
			) {
				return 1; // Could be phishing
			}
		}

		return -1; // Likely safe
	} catch (err) {
		console.log("Error while checking status bar customization: ", err);
		return 0; // Could be suspicious
	}
}

function extractFeaturesFromUrl(urlString) {
	let features = new Array(31).fill(0);

	try {
		const urlObject = new URL(urlString);
		const hostname = urlObject.hostname;

		// Index 0: UsingIP
		features[0] = checkIPAdress(hostname);

		// Index 1: LongURL
		features[1] = checkURLLength(urlString);

		// Index 2: ShortURL
		features[2] = checkShorteningService(hostname);

		// Index 3: Symbol@
		features[3] = checkAtSymbol(urlString);

		// Index 4: Redirecting//
		features[4] = checkRedirecting(hostname);

		// Index 5: PrefixSuffix-
		features[5] = checkPreSuffix(hostname);

		// Index 6: Subdomains
		features[6] = checkSubdomainCount(hostname);

		// Index 7: HTTPS
		features[7] = checkHTTPS(urlString);

		// Index 8: DomainRegistrationLength
		features[8] = checkDomainRegistrationLength(hostname);

		// Index 9: Favicon
		features[9] = checkFavicon(hostname);

		// Index 10: NonStandardPort
		features[10] = checkNonStandardPort(urlObject);

		// Index 11: HTTPSDomainURL
		features[11] = checkHTTPSDomainURL(hostname);

		// Index 12: RequestURL
		features[12] = checkRequestURL(hostname);

		// Index 13: AnchorURL
		features[13] = checkAnchorURL(hostname);

		// Index 14: LinksInScript
		features[14] = checkLinksInScript(hostname);

		// Index 15: ServerFormHandler
		features[15] = checkServerFormHandler(hostname);

		// Index 16: InfoEmail
		features[16] = checkInfoEmail();

		// Index 17: AbnormalURL
		features[17] = checkAbnormalURL(hostname, urlString);

		// Index 18: WebsiteForwarding
		features[18] = checkWebsiteForwarding();

        // Index 19: StatusBarCustomization
        features[19] = checkStatusBarCustomization();
	} catch (err) {
		console.log("Error while tokenizing URL: ", err);
	}

	return features;
}
