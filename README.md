# Kamil | Browser Extension 🛡️

This is the repository for the **AI-powered browser extension** of my bachelor's thesis at **Erasmushogeschool Brussel** (Multimedia & Creative Technologies).

**Kamil** is a digital kameleon designed to increase digital resilience. By utilizing **TensorFlow.js**, this extension analyzes URLs and website features in real-time to protect users from phishing attacks and online fraud.

---

## 🚀 Project Overview
- **Developer:** Arno Baeck
- **Contact:** arno.baeck@student.ehb.be / arno.baeck@live.be
- **Tech Stack:** JavaScript (ES6+), TensorFlow.js, Chrome Extension API (Manifest V3)
- **Status:** Under Development

## ✨ Key Features
- **AI-Powered Detection:** Real-time analysis of websites using a custom TensorFlow.js model.
- **Punycode Protection:** Identifies and flags IDN Homograph attacks (masked URLs).
- **Blacklist & Whitelist:** Integrated verification against known malicious and safe domains.
- **Manifest V3:** Built on the latest Chrome extension standards for better security and performance.

---

## 🛠 Installation & Development

### Prerequisites
- Google Chrome (or any Chromium-based browser)
- A basic understanding of Chrome Extension management

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kamil-extension.git
   cd kamil-extension
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **"Developer mode"** in the top right corner.
   - Click **"Load unpacked"** and select the root directory of this repository.

3. **Verify Installation:**
   - Look for the Kamil icon in your extensions toolbar.
   - The extension is now active and monitoring your browsing session.

---

## 📂 Project Structure
- `model/`: Contains the pre-trained TensorFlow.js model (`model.json` and binary shards).
- `ui/`: The user interface components, including the popup (`popup.html`, `popup.js`, `popup.css`) and assets.
- `utils/`: Core logic for URL tokenization, blacklist/whitelist management, and Punycode checking.
- `background.js`: The service worker handling extension lifecycle and events (Manifest V3).
- `content.js`: The script responsible for interacting with the DOM of visited pages.
- `config/`: Configuration files for the TensorFlow.js environment.

---

## 📚 Sources & References

### 🛡️ Cybersecurity & Academic Research
* [Safeonweb.be](https://safeonweb.be/) - Official Belgian portal for cybersecurity and real-time threat alerts.
* [PhiUSIIL Phishing URL Dataset (2024)](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+website) - A modern, large-scale dataset for advanced ML training.
* [Punycode & Homograph Attacks](https://en.wikipedia.org/wiki/IDN_homograph_attack) - Research on internationalized domain name deception.
* [APWG (Anti-Phishing Working Group)](https://apwg.org/trendsreports/) - Global trends and reports on phishing activity.

### 🛠️ Frameworks & Extension Architecture
* [TensorFlow.js Documentation](https://www.tensorflow.org/js) - Core library for browser-based machine learning.
* [Chrome Extension MV3 Overview](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) - Official transition guide and architectural changes.
* [Service Worker Lifecycle in MV3](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle) - Best practices for handling ephemeral background scripts.
* [Manifest V3 Security (CSP)](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security) - Detailed guide on Content Security Policy and remote code restrictions.

### ⚙️ Development & Machine Learning Tooling
* [Google Colab](https://colab.research.google.com/) - Platform used for training and testing the ML models.
* [Phishing URL Dataset (CSV)](https://raw.githubusercontent.com/vaibhavbichave/Phishing-URL-Detection/master/phishing.csv) - Primary data source for initial model prototyping.
* [TensorFlow.js Phishing Example](https://storage.googleapis.com/tfjs-examples/website-phishing/dist/index.html) - Reference implementation for client-side URL classification.

### 💡 Technical Discussions (Stack Overflow)
* [Storage Local vs. Sync in MV3](https://stackoverflow.com/questions/20279484/chrome-storage-local-vs-chrome-storage-sync-for-extensions) - Managing persistent state across service worker restarts.

### 🤖 AI & Productivity Tools
* [Gemini AI](https://gemini.google.com/) - Utilized for debugging, logic optimization, and research.
* [Gemini CLI](https://geminicli.com/) - Advanced agentic CLI used for codebase orchestration and automation.
* [GitHub Copilot](https://github.com/copilot) - AI pair programmer for rapid prototyping.
* [Error Handling Insights](https://gemini.google.com/share/6849769945d7) & [Local LM Model Error](https://gemini.google.com/share/3dd0519b8c3c) - AI-assisted debugging logs.
* [Project cleanup](./AI_CHATS/project_cleanup.md) - Documentation on project cleanup.

---

## 📄 License
Copyright (c) 2026 Arno Baeck. All rights reserved.  
This project is developed as part of a Bachelor's thesis at Erasmushogeschool Brussel. Unauthorized copying, distribution, or commercial use is strictly prohibited.
