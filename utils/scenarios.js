const scenarios = Object.freeze({
	SAFE: {
		status: "safe",
		title: "Alles is veilig.",
		reason: "Geen bedreigingen gevonden.",
		description: "Kamil heeft deze website gecontroleerd. Je kunt hier veilig surfen.",
		blogUrl: `${self.tfConfig.blog.baseUrl}`,
	},
	BLACKLISTED_URL: {
		status: "critical",
		title: "Gevaar: Zwarte lijst.",
		reason: "URL staat op een zwarte lijst.",
		description: "Deze website die je probeerde te betreden staat op een zwarte lijst van bekende phishing-websites.",
		blogUrl: `${self.tfConfig.blog.baseUrl}/gids/zwarte-lijsten-en-databases`,
	},
	PUNYCODE: {
		status: "critical",
		title: "Gevaar: Vermomde URL.",
		reason: "Punycode gedetecteerd.",
		description: "Deze website gebruikt speciale tekens om te lijken op een bekende website. Dit is bijna altijd phishing.",
		blogUrl: `${self.tfConfig.blog.baseUrl}/gids/gevaarlijke-tekens-punycode`,
	},
	AI_PREDICTION_HIGH_RISK: {
		status: "warning",
		title: "Opgelet: Verdacht.",
		reason: "AI-model meldt hoog risico.",
		description: "Kamil's AI-model herkent patronen op deze pagina die sterk lijken op phishing. Wees extra voorzichtig.",
		blogUrl: `${self.tfConfig.blog.baseUrl}/gids/hoe-kamil-ai-jou-beschermt`,
	},
	DISABLED: {
		status: "safe",
		title: "Kamil staat uit.",
		reason: "Beveiliging is uitgeschakeld.",
		description: "Je bent momenteel niet beschermd. Schakel Kamil weer in via de instellingen voor optimale veiligheid.",
		blogUrl: "#",
	},
});
