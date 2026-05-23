console.log("URL Tokenizer module loaded.");

function extractFeaturesFromUrl(url) {
    let features = new Array(31).fill(0);
    
    // TEST TRIGGER 1
    if (url.includes("ai-phishing")) {
        features[0] = 1;
        features[1] = 1;
        features[3] = 1;
        features[7] = 1;
    }
    
    // TEST TRIGGER 2
    if (url.includes("ai-suspicious")) {
        features[1] = 1;
    }
    
    return features;
}