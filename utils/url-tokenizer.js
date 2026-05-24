console.log("URL Tokenizer module loaded.");

// This function checks if the hostname (url) is an IP address or not.
function checkIPAdress(hostname) {
	const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
	return ipPattern.test(hostname) ? 1 : -1;
}

// This function checks the length of the URL and categorizes it.
function checkURLLength(url) {
	if (url.length < 54) {
		return -1; // Safe
	} else if (url.length >= 54 && url.length <= 75) {
		return 0; // Suspicious
	} else {
		return 1; // Phishing
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

	} catch (err) {
		console.log("Error while tokenizing URL: ", err);
	}

	return features;
}
