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

function extractFeaturesFromUrl(urlString) {
	let features = new Array(31).fill(0);

	try {
		const urlObject = new URL(urlString);
		const hostname = urlObject.hostname;

		// Index 0: UsingIP
		features[0] = checkIPAdress(hostname);

        // Index 1: LongURL
        features[1] = checkURLLength(urlString);
	} catch (err) {
		console.log("Error while tokenizing URL: ", err);
	}

	return features;
}
