console.log("URL Tokenizer module loaded.");

function extractFeaturesFromUrl(url) {
    let features = new Array(31).fill(0);
    
    // Temporary heuristic: If the URL contains "ai-phishing", set the first two features to 1
    if (url.includes("ai-phishing")) {
        features[0] = 1; 
        features[1] = 1;
    }
    
    return features;
}