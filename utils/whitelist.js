let whitelistDomains = [];

// This function loads the whitelist from the JSON file and stores it frozen in memory for quick access.
async function loadWhitelist(url) {
	try {
		const response = await fetch(chrome.runtime.getURL("utils/whitelist.json"));
		const data = await response.json();

		whitelistDomains = Object.freeze(data);
	} catch (err) {
		console.error("Error loading whitelist: ", err);
		whitelistDomains = [];
	}
}

// This function checks if a given hostname is in the whitelist. It returns true if the hostname matches any entry in the whitelist.
function isWhitelisted(hostname) {
	if (!hostname || whitelistDomains.length === 0) return false;

	const cleanHostname = hostname.toLowerCase();

	return whitelistDomains.some((domain) => cleanHostname === domain || cleanHostname.endsWith("." + domain));
}

loadWhitelist();
