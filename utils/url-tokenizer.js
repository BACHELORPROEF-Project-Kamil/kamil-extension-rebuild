console.log("URL Tokenizer module loaded.");

// This function checks if the hostname (url) is an IP address or not.
function checkIPAdress(hostname) {
	const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
	return ipPattern.test(hostname) ? 1 : -1;
}

function extractFeaturesFromUrl(urlString) {
	let features = new Array(31).fill(0);

	try {
		const urlObject = new URL(urlString);
		const hostname = urlObject.hostname;

		// Index 0: UsingIP
		features[0] = checkIPAdress(hostname);

	} catch (err) {
		console.log("Error while tokenizing URL: ", err);
	}

	return features;
}
