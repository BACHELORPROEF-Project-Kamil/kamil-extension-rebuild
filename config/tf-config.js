// Configure tensorflow first to avoid eval errors
self.tfConfig = {
	environments: {
		development: false, // PRODUCTIE MODUS
	},
	flags: {
		IS_BROWSER: true,
	},
	api: {
		baseUrl: "https://api.kamil-extension.be",
		clientId: "kamil-extension-client-v1", // Identificatie voor de backend
	},
	blog: {
		baseUrl: "https://www.kamil-extension.be/tips-and-guides",
	},
};

// Prevent crashes due to missing process.env.NODE_ENV in TensorFlow.js
self.process = { env: { NODE_ENV: "production" } }; // PRODUCTIE MODUS