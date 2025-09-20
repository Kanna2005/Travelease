// ⚠️ Gemini API key (better to keep this on backend, not frontend)
const API_KEY = "AIzaSyDY2OyqPm2o9hE26eMQAtTJbd5pfGyKadA";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Store conversation history
let conversationHistory = [];

// Send message to Gemini
async function sendMessageToGemini(message) {
    try {
        // Push user message
        conversationHistory.push({ role: "user", parts: [{ text: message }] });

        const requestBody = {
            contents: conversationHistory.slice(-10), // keep last 10 messages to avoid huge payload
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
            }
        };

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Safe parsing (prevents crash if API returns unexpected response)
        const responseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "⚠ No response from Gemini.";

        // Push model response
        conversationHistory.push({ role: "model", parts: [{ text: responseText }] });

        return responseText;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "⚠ Sorry, I couldn't process your request. Try again.";
    }
}

// Manage history
function clearConversationHistory() {
    conversationHistory = [];
}

function setConversationHistory(history) {
    conversationHistory = history;
}
