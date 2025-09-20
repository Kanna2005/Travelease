/*  FIREBASE SETUP */
const firebaseConfig = {
apiKey: "AIzaSyA98_LyFxLewhlIxMAaZ5UWdfDrwSSWgsU",
    authDomain: "chat-fec5e.firebaseapp.com",
    projectId: "chat-fec5e",
    storageBucket: "chat-fec5e.firebasestorage.app",
    messagingSenderId: "478788977340",
    appId: "1:478788977340:web:b52062ebb340a3574046b9",
    measurementId: "G-SJL74BT9WW"
};

// Initialize Firebase (safe if called once)
if (typeof firebase !== "undefined" && (!firebase.apps || !firebase.apps.length)) {
  firebase.initializeApp(firebaseConfig);
}
const db = (typeof firebase !== "undefined") ? firebase.firestore() : null;

// Collection name (change if you like)
const FIREBASE_COLLECTION = "chatMessages";

// Save a single message to Firestore
function saveMessageToFirebase(role, contentRaw, contentHtml) {
  try {
    if (!db) return; // SDK not loaded
    const payload = {
      chatId: typeof currentChatId !== "undefined" ? currentChatId : null,
      role,                                // "user" | "assistant"
      content: contentRaw,                 // plain text
      contentHtml: contentHtml ?? contentRaw, // formatted HTML (kept for assistant)
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      clientTimestamp: Date.now()
    };
    return db.collection(FIREBASE_COLLECTION).add(payload)
      .then(() => console.log("[Firestore] Message saved"))
      .catch(err => console.error("[Firestore] Save error:", err));
  } catch (e) {
    console.error("[Firestore] Exception:", e);
  }
}
/* Chatbot script function */
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatHistoryList = document.getElementById("chat-history-list");

let currentChatId = null;
let chats = JSON.parse(localStorage.getItem("travelChats")) || {};

document.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
  if (Object.keys(chats).length === 0) startNewChat();
  else loadChat(Object.keys(chats).pop());

  sendBtn.addEventListener("click", handleSendMessage);
  userInput.addEventListener("keypress", e => { if (e.key === "Enter") handleSendMessage(); });
});

async function handleSendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  userInput.value = "";

  // Add + Save USER message
  addMessage("user", message);
  saveMessageToFirebase("user", message, message);

  showTyping();

  const response = await sendMessageToGemini(message);
  removeTyping();

  // Format assistant message for UI
  const formatted = formatResponse(response);
  addMessage("assistant", formatted);

  // Save ASSISTANT message (raw + html)
  saveMessageToFirebase("assistant", response, formatted);

  saveChat();
  updateChatHistoryList();
}

function formatResponse(text){
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>")             // italic
    .replace(/\n/g, "<br>");                          // line breaks 
}

function addMessage(role, content) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerHTML = `<div class="message-content">${content}</div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "message assistant";
  typing.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() { document.getElementById("typing")?.remove(); }

function startNewChat() {
  clearConversationHistory();
  chatMessages.innerHTML = "";
  currentChatId = "chat-" + Date.now();
  chats[currentChatId] = { messages: [], title: "New Chat", timestamp: Date.now() };

  const welcome = "👋 Hi! I'm your Travel Assistant. Where would you like to explore?";
  addMessage("assistant", welcome);

  // Save the welcome assistant message too
  saveMessageToFirebase("assistant", welcome, welcome);

  saveChat();
}

function saveChat() {
  if (!currentChatId) return;
  const msgs = [...chatMessages.querySelectorAll(".message")].map(el => ({
    role: el.classList.contains("user") ? "user" : "assistant",
    content: el.querySelector(".message-content").innerHTML //heep html format
  }));
  chats[currentChatId].messages = msgs;

  // Set title from first user message
  const firstUserMsg = msgs.find(m => m.role === "user");
  if (firstUserMsg) {
    chats[currentChatId].title = firstUserMsg.content.substring(0, 20) + "...";
  }

  chats[currentChatId].timestamp = Date.now();
  localStorage.setItem("travelChats", JSON.stringify(chats));
}

function loadChat(id) {
  currentChatId = id;
  clearConversationHistory();
  chatMessages.innerHTML = "";

  chats[id].messages.forEach(m =>{
    const content = m.role ==="assistant"? formatResponse(m.content): m.content;
    addMessage(m.role, content);
  });
  setConversationHistory(chats[id].messages.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })));
}

function loadChatHistory() {
  chatHistoryList.innerHTML = "";
  Object.keys(chats).sort((a, b) => chats[b].timestamp - chats[a].timestamp)
    .forEach(id => {
      const li = document.createElement("li");
      li.textContent = chats[id].title;
      li.onclick = () => loadChat(id);
      chatHistoryList.appendChild(li);
    });
}

function updateChatHistoryList() { loadChatHistory(); }
function deleteAllChats() { chats = {}; localStorage.clear(); startNewChat(); }
function goBack() { window.location.href = "index.html"; }

async function sendMessageToGemini(userMessage) {
  try {
    const API_KEY = "AIzaSyDY2OyqPm2o9hE26eMQAtTJbd5pfGyKadA"; // replace with your real Gemini API key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const body = {
      contents: [
        { role: "user", parts: [{ text: userMessage }] }
      ]
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("Gemini API error:", data);
      return "⚠ Sorry, I couldn't process your request. Try again.";
    }

  } catch (error) {
    console.error("Fetch error:", error);
    return "⚠ Sorry, something went wrong while connecting.";
  }
}
