// gemini.js
const GEMINI_API_KEY = AIzaSyAAHoRR2tnHynvobWpJKvhbVFf7Z_aE_wY; 
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY;

async function getGeminiResponse(userMessage) {
    try {
        const response = await fetch('https://api.gemini.google.com/v1/generate', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer ${this.apiKey}"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userMessage
                    }]
                }]
            })
        });

        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Sorry, I couldn’t get a response from Gemini.";
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error connecting to Gemini API.";
    }
}

// Export for use in other JS files
window.getGeminiResponse = getGeminiResponse;
