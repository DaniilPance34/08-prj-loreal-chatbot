const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const latestQuestion = document.getElementById("latestQuestion");

// Replace this with your deployed Cloudflare Worker URL.
const WORKER_URL = "https://loreal-beauty-chatbot.daniilp-8a9.workers.dev/";

// Instructions for the AI
const systemPrompt = `
You are a friendly and professional L'Oréal Beauty Advisor.

Your job is to help users with:
- L'Oréal makeup products
- Skincare and skincare routines
- Haircare and hair products
- Fragrances
- Personalized beauty recommendations

Ask about the user's skin type, hair type, concerns,
budget, and preferences when relevant.

Only answer questions related to L'Oréal, its beauty
products, beauty routines, and related beauty topics.

If someone asks an unrelated question, politely say:
"I'm here to help with L'Oréal beauty products and
routines. What beauty questions can I help you with?"

Never invent product details, prices, or availability.
Do not claim that products treat medical conditions.
Keep responses friendly, helpful, and easy to understand.
`;

// Store conversation history
const messages = [
  {
    role: "system",
    content: systemPrompt,
  },
];

// Display messages as bubbles
function addMessage(text, sender) {
  const bubble = document.createElement("div");

  bubble.classList.add("msg", sender);
  bubble.textContent = text;

  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return bubble;
}

// Initial greeting
addMessage(
  "👋 Welcome! I'm your L'Oréal Beauty Advisor. " +
    "Ask me about skincare, makeup, haircare, or fragrances!",
  "ai",
);

// Handle user questions
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = userInput.value.trim();

  if (!question) {
    return;
  }

  // Display latest question
  latestQuestion.textContent = "Your latest question: " + question;

  // Display user bubble
  addMessage(question, "user");

  // Save question in conversation history
  messages.push({
    role: "user",
    content: question,
  });

  userInput.value = "";
  sendBtn.disabled = true;

  const loadingBubble = addMessage("Thinking...", "ai");

  try {
    // Send messages to Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error("Request failed: " + response.status);
    }

    const data = await response.json();

    const answer = data.choices[0].message.content;

    // Replace loading text
    loadingBubble.textContent = answer;

    // Save AI response for future questions
    messages.push({
      role: "assistant",
      content: answer,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    loadingBubble.textContent =
      "Sorry, I couldn't connect right now. Please try again.";

    // Remove failed question from API history
    messages.pop();
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
