console.log("URL Tokenizer module loaded.");

// This function checks if the hostname (url) is an IP address or not.
function checkIPAdress(hostname) {
	const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
	return ipPattern.test(hostname) ? -1 : 1; // IP is phishing (-1), domain is safe (1)
}

// This function checks the length of the URL and categorizes it.
function checkURLLength(url) {
	if (url.length < 54) {
		return 1; // Likely safe
	} else if (url.length >= 54 && url.length <= 75) {
		return 0; // Could be suspicious
	} else {
		return -1; // Could be phishing
	}
}

// This function checks if the hostname belongs to a known URL shortening service.
function checkShorteningService(hostname) {
	const shorteners = ["bit.ly", "goo.gl", "tinyurl.com", "ow.ly", "t.co", "is.gd", "buff.ly", "adf.ly", "bit.do", "cutt.ly"];
	return shorteners.includes(hostname) ? -1 : 1;
}

// This function checks if the URL contains an "@" symbol.
function checkAtSymbol(url) {
	return url.includes("@") ? -1 : 1;
}

// This function checks if the URL contains common redirecting patterns.
function checkRedirecting(hostname) {
	const redirectingPatterns = ["/@", "//", "/redirect?", "/redir?", "/redirect/", "/redir/"];
	return redirectingPatterns.includes(hostname) ? -1 : 1;
}

// This function checks if the hostname contains suspicious pre-suffixe.
function checkPreSuffix(hostname) {
	const preSuffixPattern = /[-.]/;
	return preSuffixPattern.test(hostname) ? -1 : 1;
}

// This function counts the number of subdomains in the hostname.
function checkSubdomainCount(hostname) {
	const subdomainCount = hostname.split(".").length - 1;
	if (subdomainCount === 0) {
		return 1; // Likely safe
	} else if (subdomainCount === 1) {
		return 0; // Could be suspicious
	} else {
		return -1; // Could be phishing
	}
}

// This function checks if the URL uses HTTPS.
function checkHTTPS(url) {
	return url.startsWith("https://") ? 1 : -1;
}

// This function checks if the favicon of the page matches the hostname.
function checkFavicon(hostname) {
	if (typeof document === "undefined") return 0;
	const faviconNode = document.querySelector("link[rel~='icon']");

	if (!faviconNode || !faviconNode.href) {
		return 0; // Could be suspicious
	}

	const faviconUrl = new URL(faviconNode.href, document.baseURI);

	if (faviconUrl.hostname === hostname || faviconUrl.hostname === "") {
		return 1; // Likely safe
	} else {
		return -1; // Could be phishing
	}
}

// This function checks if the URL is using a non-standard port.
function checkNonStandardPort(urlObject) {
	const port = urlObject.port;

	if (port === "" || port === "80" || port === "443") {
		return 1; // Likely safe
	} else {
		return -1; // Could be suspicious
	}
}

// This function checks if the hostname contains "https".
function checkHTTPSDomainURL(hostname) {
	const lowerCaseHostname = hostname.toLowerCase();

	if (lowerCaseHostname.includes("https")) {
		return -1; // Could be phishing
	} else {
		return 1; // Likely safe
	}
}

// This function checks the percentage of external resources.
function checkRequestURL(hostname) {
	if (typeof document === "undefined") return 0;
	try {
		const images = document.getElementsByTagName("img");
		const videos = document.getElementsByTagName("video");
		const audios = document.getElementsByTagName("audio");
		const scripts = document.getElementsByTagName("script");
		const links = document.getElementsByTagName("link");

		const allResources = [...images, ...videos, ...audios, ...scripts, ...links];

		if (allResources.length === 0) {
			return 1; // Likely safe
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
			return 1; // Likely safe
		} else if (externalResourcePercentage >= 25 && externalResourcePercentage <= 75) {
			return 0; // Could be suspicious
		} else {
			return -1; // Could be phishing
		}
	} catch (err) {
		console.log("Error while checking request URL: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks the percentage of unsafe anchors.
function checkAnchorURL(hostname) {
	if (typeof document === "undefined") return 0;
	try {
		const anchors = document.getElementsByTagName("a");

		if (anchors.length === 0) {
			return 1; // Likely safe
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
			return 1; // Likely safe
		} else if (unsafeAnchorPercentage >= 25 && unsafeAnchorPercentage <= 75) {
			return 0; // Could be suspicious
		} else {
			return -1; // Could be phishing
		}
	} catch (err) {
		console.log("Error while checking anchor URL: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks the percentage of external links in scripts, stylesheets and meta tags.
function checkLinksInScript(hostname) {
	if (typeof document === "undefined") return 0;
	try {
		const scripts = document.getElementsByTagName("script");
		const links = document.getElementsByTagName("link");
		const metas = document.getElementsByTagName("meta");

		const allElements = [...scripts, ...links, ...metas];

		if (allElements.length === 0) {
			return 1; // Likely safe
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
			return 1; // Likely safe
		} else if (externalLinkPercentage >= 25 && externalLinkPercentage <= 75) {
			return 0; // Could be suspicious
		} else {
			return -1; // Could be phishing
		}
	} catch (err) {
		console.log("Error while checking links in script: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the page contains forms that submit to external servers or have no action.
function checkServerFormHandler(hostname) {
	if (typeof document === "undefined") return 0;
	try {
		const forms = document.getElementsByTagName("form");

		if (forms.length === 0) {
			return 1; // Likely safe
		}

		for (let i = 0; i < forms.length; i++) {
			const action = forms[i].getAttribute("action");

			if (!action || action === "#" || action.toLowerCase() === "about:blank") {
				return -1; // Could be phishing
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
        return 1; // Safe
	} catch (err) {
		console.log("Error while checking server form handler: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the page contains email forms that could be used to steal information.
function checkInfoEmail() {
	if (typeof document === "undefined") return 0;
	try {
		const forms = document.getElementsByTagName("form");

		for (let i = 0; i < forms.length; i++) {
			const action = forms[i].getAttribute("action");
			if (action && action.toLowerCase().startsWith("mailto:")) {
				return -1; // Could be phishing
			}
		}

		const anchors = document.getElementsByTagName("a");

		for (let i = 0; i < anchors.length; i++) {
			const href = anchors[i].getAttribute("href");
			if (href && href.toLowerCase().startsWith("mailto:")) {
				return -1; // Could be phishing
			}
		}

		return 1; // Likely safe
	} catch (err) {
		console.log("Error while checking info email: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the URL is abnormal by looking for suspicious patterns in the hostname and page title.
function checkAbnormalURL(hostname, urlString) {
	if (typeof document === "undefined") return 0;
	try {
		const protocolMatches = urlString.match(/^(https?):\/\//i);
		if (protocolMatches && protocolMatches.length > 1) {
			return -1; // Could be phishing
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
				return -1; // Could be phishing
			}
		}
		return 1; // Likely safe
	} catch (err) {
		console.log("Error while checking abnormal URL: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks the number of redirects that occurred during page load.
function checkWebsiteForwarding() {
	if (typeof document === "undefined") return 0;
	try {
		const navigationEntries = performance.getEntriesByType("navigation");

		if (navigationEntries.length > 0) {
			const redirectCount = navigationEntries[0].redirectCount;

			if (redirectCount <= 1) {
				return 1; // Likely safe
			} else if (redirectCount > 1 && redirectCount < 4) {
				return 0; // Could be suspicious
			} else {
				return -1; // Could be phishing
			}
		}
		return 0; // Could be suspicious
	} catch (err) {
		console.log("Error while checking website forwarding: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the page contains scripts that attempt to manipulate the status bar.
function checkStatusBarCustomization() {
	if (typeof document === "undefined") return 0;
	try {
		const anchors = document.getElementsByTagName("a");

		for (let i = 0; i < anchors.length; i++) {
			const onMouseOver = anchors[i].getAttribute("onmouseover");
			const onMouseMove = anchors[i].getAttribute("onmousemove");

			if (
				onMouseOver &&
				(onMouseOver.toLowerCase().includes("window.status") || onMouseOver.toLowerCase().includes("status="))
			) {
				return -1; // Could be phishing
			}
			if (
				onMouseMove &&
				(onMouseMove.toLowerCase().includes("window.status") || onMouseMove.toLowerCase().includes("status="))
			) {
				return -1; // Could be phishing
			}
		}

		return 1; // Likely safe
	} catch (err) {
		console.log("Error while checking status bar customization: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if right-click is disabled on the page.
function checkDisabledRightClick() {
	if (typeof document === "undefined") return 0;
	try {
		const bodyContextMenu = document.body.getAttribute("oncontextmenu");
		const docContextMenu = document.documentElement.getAttribute("oncontextmenu");

		if (
			(bodyContextMenu && bodyContextMenu.toLowerCase().includes("return false")) ||
			(docContextMenu && docContextMenu.toLowerCase().includes("return false"))
		) {
			return -1; // Could be phishing
		}

		return 1; // Likely safe
	} catch (err) {
		console.log("Error while checking disabled right-click: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the page uses pop-up windows.
function checkUsingPopUpWindow() {
	if (typeof document === "undefined") return 0;
	try {
		const bodyHTML = document.body ? document.body.innerHTML.toLocaleLowerCase() : "";

		if (bodyHTML.includes("window.open(") || bodyHTML.includes("window.window.open ")) {
			return -1; // Could be phishing
		}

		const anchors = document.getElementsByTagName("a");

		for (let i = 0; i < anchors.length; i++) {
			const onClick = anchors[i].getAttribute("onclick");

			if (onClick && onClick.toLowerCase().includes("window.open")) {
				return -1; // Could be phishing
			}
		}

		return 1; // Likely safe
	} catch (err) {
		console.log("Error while checking using pop-up window: ", err);
		return 0; // Could be suspicious
	}
}

// This function checks if the page contains hidden iframes that could be used for redirection.
function checkIFrameRedirection() {
	if (typeof document === "undefined") return 0;
	try {
		const iframes = document.getElementsByTagName("iframe");

		if (iframes.length === 0) {
			return 1; // Likely safe
		}

		for (let i = 0; i < iframes.length; i++) {
			const iframe = iframes[i];

			const frameborder = iframe.getAttribute("frameborder");
			const style = iframe.getAttribute("style") ? iframe.getAttribute("style").toLowerCase() : "";
			const width = iframe.getAttribute("width");
			const height = iframe.getAttribute("height");

			if (frameborder === "0") {
				return -1; // Could be phishing
			}

			if (style.includes("visibility:hidden") || style.includes("display:none") || style.includes("opacity:0")) {
				return -1; // Could be phishing
			}

			if (
				width === "0" ||
				height === "0" ||
				width === "1" ||
				height === "1" ||
				style.includes("width:0") ||
				style.includes("height:0")
			) {
				return -1; // Could be phishing
			}
		}

		return 0; // Could be suspicious
	} catch (err) {
		console.log("Error while checking iframe redirection: ", err);
		return 0; // Could be suspicious
	}
}

function checkWebsiteTraffic() { return 1; }
function checkPageRank() { return 1; }
function checkGoogleIndex() { return 1; }
function checkLinksPointingToPage() { return 1; }
function checkStatisticalReport() { return 1; }

async function extractFeaturesFromUrl(urlString, domResults = null) {
	let features = new Array(31).fill(0);

	try {
		const urlObject = new URL(urlString);
		const hostname = urlObject.hostname;

		// The model has been trained with an index column that we don't actually need, so we give it a dummy value.
		features[0] = 1; // Dummy value for Index

		// Index 1: UsingIP
		features[1] = checkIPAdress(hostname);

		// Index 2: LongURL
		features[2] = checkURLLength(urlString);

		// Index 3: ShortURL
		features[3] = checkShorteningService(hostname);

		// Index 4: Symbol@
		features[4] = checkAtSymbol(urlString);

		// Index 5: Redirecting//
		features[5] = checkRedirecting(hostname);

		// Index 6: PrefixSuffix-
		features[6] = checkPreSuffix(hostname);

		// Index 7: SubDomains
		features[7] = checkSubdomainCount(hostname);

		// Index 8: HTTPS
		features[8] = checkHTTPS(urlString);

		// Index 10: Favicon
		features[10] = domResults ? domResults[10] : checkFavicon(hostname);

		// Index 11: NonStandardPort
		features[11] = checkNonStandardPort(urlObject);

		// Index 12: HTTPSDomainURL
		features[12] = checkHTTPSDomainURL(hostname);

		// Index 13: RequestURL
		features[13] = domResults ? domResults[13] : checkRequestURL(hostname);

		// Index 14: AnchorURL
		features[14] = domResults ? domResults[14] : checkAnchorURL(hostname);

		// Index 15: LinksInScript
		features[15] = domResults ? domResults[15] : checkLinksInScript(hostname);

		// Index 16: ServerFormHandler
		features[16] = domResults ? domResults[16] : checkServerFormHandler(hostname);

		// Index 17: InfoEmail
		features[17] = domResults ? domResults[17] : checkInfoEmail();

		// Index 18: AbnormalURL
		features[18] = domResults ? domResults[18] : checkAbnormalURL(hostname, urlString);

		// Index 19: WebsiteForwarding
		features[19] = domResults ? domResults[19] : checkWebsiteForwarding();

		// Index 20: StatusBarCustomization
		features[20] = domResults ? domResults[20] : checkStatusBarCustomization();

		// Index 21: DisabledRightClick
		features[21] = domResults ? domResults[21] : checkDisabledRightClick();

		// Index 22: UsingPopUpWindow
		features[22] = domResults ? domResults[22] : checkUsingPopUpWindow();

		// Index 23: IFrameRedirection
		features[23] = domResults ? domResults[23] : checkIFrameRedirection();

		// Static/Unavailable features
		features[26] = checkWebsiteTraffic();
		features[27] = checkPageRank();
		features[28] = checkGoogleIndex();
		features[29] = checkLinksPointingToPage();
		features[30] = checkStatisticalReport();

		console.log("Local checks done, beginning extraction of server vitals via backend");

		const response = await fetch(`${self.tfConfig.api.baseUrl}/api/check-url`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Client-Id": self.tfConfig.api.clientId,
			},
			body: JSON.stringify({ url: urlString }),
		});

        if (response.ok) {
            const data = await response.json();

			// Backend features

            // Index 9: DomainRegLen
            features[9] = data.features.domainRegistrationLength;

            // Index 24: AgeofDomain
            features[24] = data.features.ageOfDomain;

            // Index 25: DNSRecording
            features[25] = data.features.dnsRecord;

            console.log("Server vitals extracted and features array updated");
        } else {
            console.log("Failed to fetch server vitals, keeping default values for those features");
        }

	} catch (err) {
		console.log("Error while tokenizing URL: ", err);
	}

	return features;
}