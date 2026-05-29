// Important information for this script. We give it the parameters that it needs to run.
/**
 * @param {string} url
 * @returns {boolean}
 */

function isPunycode(url) {
    try {
        const parsedUrl = new URL(url);

        // Checks to see if the hostname includes "xn--" which is the prefix used for punycode domains.
        return parsedUrl.hostname.startsWith('xn--') || parsedUrl.hostname.includes('.xn--');
    } catch (err) {
        console.error("Error parsing URL for punycode check: ", err);
        return false;
    }
}