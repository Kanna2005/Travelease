function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = input.value.trim();

  if (!message) return;

  appendMessage("You", message, "user");

  const response = getBotResponse(message.toLowerCase());
  setTimeout(() => {
    appendMessage("Bot", response, "bot");
  }, 500);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(sender, text, className) {
  const chatBox = document.getElementById("chat-box");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add(className);
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msgDiv);
}

function getBotResponse(msg) {
  // 🌦️ Weather
  if (msg.includes("weather") || msg.includes("temperature") || msg.includes("forecast")) {
    return "I can help you plan based on weather. Use OpenWeather or AccuWeather for the latest forecast.";
  }

  // 🎉 Festivals
  if (msg.includes("festival") || msg.includes("event") || msg.includes("celebration")) {
    return "Check out Holi in India, Carnival in Brazil, or Oktoberfest in Germany! Want a country-specific suggestion?";
  }

  // 💰 Budget trips
  if (msg.includes("budget") || msg.includes("cheap") || msg.includes("low cost")) {
    return "Southeast Asia, Eastern Europe, and South America are great for budget travel! Use hostels & public transport.";
  }

  // 🧭 Destination suggestion
  if (msg.includes("suggest") || msg.includes("destination") || msg.includes("where to go") || msg.includes("recommend")) {
    return "For adventure, try New Zealand. For beaches, go to Thailand. For history, explore Rome!";
  }

  // 🕓 Best time to visit
  if (msg.includes("best time") || msg.includes("season") || msg.includes("when to visit")) {
    return "Europe is lovely in Spring (Apr–Jun), SE Asia in Winter (Nov–Feb). What country are you thinking of?";
  }

  // ✈️ Flights
  if (msg.includes("flight") || msg.includes("airfare") || msg.includes("airline") || msg.includes("ticket")) {
    return "Compare prices on Skyscanner, Google Flights, or Kayak. Book early for the best deals!";
  }

  // 🎒 Packing
  if (msg.includes("pack") || msg.includes("packing") || msg.includes("carry")) {
    return "Pack light: clothes, ID, power bank, meds, adapters, and check weather conditions.";
  }

  // 🛂 Visa & passport
  if (msg.includes("visa") || msg.includes("passport") || msg.includes("documents")) {
    return "Check the embassy website for your destination country. Visa rules vary widely!";
  }

  // 🔐 Safety
  if (msg.includes("safe") || msg.includes("danger") || msg.includes("crime") || msg.includes("secure")) {
    return "Stay safe: Avoid isolated places at night, use registered taxis, and keep emergency contacts handy.";
  }

  // 🏨 Accommodation
  if (msg.includes("hotel") || msg.includes("stay") || msg.includes("hostel") || msg.includes("accommodation")) {
    return "Try Booking.com, Hostelworld, or Airbnb for stays. Reviews help you find safe and comfortable places.";
  }

  // 🚗 Transport
  if (msg.includes("transport") || msg.includes("cab") || msg.includes("bus") || msg.includes("train") || msg.includes("metro")) {
    return "Use Google Maps for local transport, Uber/Ola for cabs, or Rome2Rio for multi-country travel planning.";
  }

  // 🍜 Food
  if (msg.includes("food") || msg.includes("eat") || msg.includes("restaurant")) {
    return "Try local cuisine! Use Google Reviews or Zomato/TripAdvisor for the best places to eat.";
  }

  // ⛰️ Adventure
  if (msg.includes("adventure") || msg.includes("trek") || msg.includes("hike") || msg.includes("scuba")) {
    return "You might love Rishikesh for rafting, Himalayas for trekking, or the Maldives for scuba diving!";
  }

  // 💕 Romantic / Honeymoon
  if (msg.includes("honeymoon") || msg.includes("romantic") || msg.includes("couple")) {
    return "Try Santorini (Greece), Udaipur (India), or Bora Bora (French Polynesia) for romantic getaways.";
  }

  // 👨‍👩‍👧‍👦 Family / Group trips
  if (msg.includes("family") || msg.includes("group") || msg.includes("kids")) {
    return "Visit amusement parks, zoos, or beaches. Dubai, Singapore, and Orlando are family-friendly destinations.";
  }

  // 🧍‍♀️ Solo travel
  if (msg.includes("solo") || msg.includes("alone") || msg.includes("by myself")) {
    return "Solo travel is empowering! Japan, Portugal, and Thailand are safe and great for solo adventurers.";
  }

  // 🧘 Culture & history
  if (msg.includes("culture") || msg.includes("history") || msg.includes("heritage")) {
    return "Explore Rome, Varanasi, Kyoto, or Cairo for deep cultural and historical experiences.";
  }

  // 🌲 Nature & wildlife
  if (msg.includes("wildlife") || msg.includes("nature") || msg.includes("forest") || msg.includes("safari")) {
    return "Try Kenya for safaris, Costa Rica for rainforests, or India’s Jim Corbett for tigers!";
  }

  // 💉 Travel insurance / health
  if (msg.includes("insurance") || msg.includes("health") || msg.includes("vaccine")) {
    return "Travel insurance is smart! Also check if you need vaccines for your destination before departure.";
  }

  // ⚖️ Laws & customs
  if (msg.includes("law") || msg.includes("rule") || msg.includes("legal") || msg.includes("customs")) {
    return "Always respect local laws and customs. Research cultural etiquette, dress codes, and legal restrictions.";
  }

  // ❓ General fallback
  return "Hmm... I didn’t get that fully. Can you ask something about travel, weather, packing, or destinations?";
}
