// Configure tensorflow first to avoid eval errors
self.tfConfig = {
	environments: {
		development: true, // AANPASSEN NAAR PRODUCTION
	},
	flags: {
		IS_BROWSER: true,
	},
};

// Prevent crashes due to missing process.env.NODE_ENV in TensorFlow.js
self.process = { env: { NODE_ENV: "development" } }; // AANPASSEN NAAR PRODUCTION