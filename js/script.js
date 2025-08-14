// script.js - Main chatbot functionality
class TravelBuddy {
    constructor() {
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatHistory = document.getElementById('chatHistory');
        this.sidebar = document.getElementById('sidebar');
        this.backButton = document.getElementById('backButton');
        
        this.conversations = [];
        this.currentConversation = [];
        
        this.setupEventListeners();
        this.showWelcomeMessage();
    }
    
    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.backButton.addEventListener('click', () => {
            this.sidebar.classList.toggle('open');
        });
    }
    
    showWelcomeMessage() {
        setTimeout(() => {
            this.addBotMessage("Hello! I'm TravelBuddy, your personal travel assistant for India. I can help you with travel plans, budget trips, hotel information, and details about Indian destinations. How can I assist you today?");
        }, 500);
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addUserMessage(message);
        this.messageInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // First try our local knowledge base
            let response = generateResponse(message);
            
            // If the local response is generic, try Gemini API
            if (response.includes("I'm sorry, I don't have specific information")) {
                response = await GeminiAPI.generateResponse(`As a travel expert for India, answer this travel question: ${message}`);
            }
            
            this.addBotMessage(response);
        } catch (error) {
            console.error('Error generating response:', error);
            this.addBotMessage("I'm having trouble processing your request. Please try again later.");
        }
    }
    
    showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        this.chatContainer.appendChild(typingIndicator);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        // Remove after 3 seconds if still there
        setTimeout(() => {
            if (this.chatContainer.contains(typingIndicator)) {
                this.chatContainer.removeChild(typingIndicator);
            }
        }, 3000);
    }
    
    addUserMessage(text) {
        this.addMessage(text, 'user');
        this.currentConversation.push({
            sender: 'user',
            text: text,
            time: new Date()
        });
        
        if (this.currentConversation.length === 1) {
            this.addToChatHistory(text);
        }
    }
    
    addBotMessage(text) {
        this.addMessage(text, 'bot');
        this.currentConversation.push({
            sender: 'bot',
            text: text,
            time: new Date()
        });
        
        if (this.currentConversation.length >= 2) {
            this.conversations.push([...this.currentConversation]);
            this.currentConversation = [];
        }
    }
    
    addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = text;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = this.getCurrentTime();
        
        messageElement.appendChild(timestamp);
        this.chatContainer.appendChild(messageElement);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    addToChatHistory(text) {
        const historyItem = document.createElement('div');
        historyItem.className = 'chat-item';
        historyItem.textContent = text.length > 30 ? text.substring(0, 30) + '...' : text;
        
        historyItem.addEventListener('click', () => {
            this.addBotMessage("You asked previously: " + text);
        });
        
        this.chatHistory.appendChild(historyItem);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0');
    }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Gemini API with your API key
    GeminiAPI.init('YOUR_API_KEY');
    
    // Create TravelBuddy instance
    const travelBuddy = new TravelBuddy();
    
    // Make generateResponse function available globally
    window.generateResponse = function(userMessage) {
        // Your existing generateResponse implementation
        const lowerMessage = userMessage.toLowerCase();
        
        // Greetings
        if (matchesPattern(lowerMessage, ['hi', 'hello', 'hey'])) {
            return "Hello there! Ready to plan your next adventure in India? I am here to help you with Trip Planning.";
        }
        
        // ... rest of your existing generateResponse function ...
        
        // If no specific pattern matches
        return "I'm sorry, I don't have specific information about that. As a travel assistant, I can help with:\n" +
               "- Destination recommendations\n" +
               "- Budget travel tips\n" +
               "- Hotel and transportation advice\n" +
               "- Cultural information about India\n" +
               "Could you please rephrase your question or ask about something else related to travel in India?";
    };
    
    // Helper function to check if message matches any pattern
    window.matchesPattern = function(message, patterns) {
        return patterns.some(pattern => message.includes(pattern));
    };
});