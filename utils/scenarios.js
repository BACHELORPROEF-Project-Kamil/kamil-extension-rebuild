const scenarios = Object.freeze({
	SAFE: {
		status: "safe",
		title: "Alles is veilig.",
		reason: "Geen bedreigingen gevonden.",
		description: "Kamil heeft deze website gecontroleerd. Je kunt hier veilig surfen.",
		blogUrl: "http://localhost:3000/tips-and-guides",
	},
	BLACKLISTED_URL: {
		status: "critical",
		title: "Gevaar: Zwarte lijst.",
		reason: "URL staat op een zwarte lijst.",
		description: "Deze website die je probeerde te betreden staat op een zwarte lijst van bekende phishing-websites.",
		blogUrl: "http://localhost:3000/tips-and-guides/gids/zwarte-lijsten-en-databases",
	},
	PUNYCODE: {
		status: "critical",
		title: "Gevaar: Vermomde URL.",
		reason: "Punycode gedetecteerd.",
		description: "Deze website gebruikt speciale tekens om te lijken op een bekende website. Dit is bijna altijd phishing.",
		blogUrl: "http://localhost:3000/tips-and-guides/gids/gevaarlijke-tekens-punycode",
	},
	AI_PREDICTION_HIGH_RISK: {
		status: "warning",
		title: "Opgelet: Verdacht.",
		reason: "AI-model meldt hoog risico.",
		description: "Kamil's AI-model herkent patronen op deze pagina die sterk lijken op phishing. Wees extra voorzichtig.",
		blogUrl: "http://localhost:3000/tips-and-guides",
		//TODO: ADD BLOG ON WEBSITE EXPLAINING AI PREDICTIONS
	},
});
