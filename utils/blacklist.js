let remotePhishingList = [];

// This function fetches the latest phishing URLs from a repo ans stores them in memory for quick access.
async function loadExternalBlacklist() {
	try {
		const response = await fetch("https://raw.githubusercontent.com/openphish/public_feed/refs/heads/main/feed.txt");
		const textData = await response.text();

		remotePhishingList = textData
			.split("\n")
			.map((url) => url.trim())
			.filter((url) => url.length > 0);
	} catch (err) {
		console.error("Error loading external blacklist: ", err);
		remotePhishingList = [];
	}
}

// Important information for this script. We give it the parameters that it needs to run.
/**
 * @param {string} urlString
 * @returns {boolean}
 */

// This function checks if a given URL is in the remote phishing list.
function isBlacklisted(urlString) {
	return remotePhishingList.includes(urlString);
}

loadExternalBlacklist();
