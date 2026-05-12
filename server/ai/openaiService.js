const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

function createOpenAIService() {
  let openAIClient;
  let openRouterClient;
  let groqClient;
  let geminiClient;

  function getProvider() {
    const configuredProvider = String(process.env.AI_PROVIDER || "").trim().toLowerCase();

    if (configuredProvider) {
      return configuredProvider;
    }

    return process.env.GEMINI_API_KEY ? "gemini" : "openai";
  }

  function getOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    if (!openAIClient) {
      openAIClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    return openAIClient;
  }

  function getOpenRouterClient() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is missing");
    }

    if (!openRouterClient) {
      openRouterClient = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_APP_NAME || "Personal Chat"
        }
      });
    }

    return openRouterClient;
  }

  function getGroqClient() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing");
    }

    if (!groqClient) {
      groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"
      });
    }

    return groqClient;
  }

  function getGeminiClient() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    if (!geminiClient) {
      geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    return geminiClient;
  }

  function formatConversationHistory(conversationHistory = []) {
    const historyLines = conversationHistory
      .filter((message) => message?.body)
      .slice(-10)
      .map((message) => {
        const speaker = message.direction === "outgoing" ? "Me" : "Contact";
        return `${speaker}: ${String(message.body).slice(0, 500)}`;
      });

    if (!historyLines.length) {
      return "No prior context available.";
    }

    return historyLines.join("\n");
  }

  async function generateReply({ customPrompt, messageText, contactName, conversationHistory = [] }) {
    const safeMessageText = String(messageText || "").trim();

    if (!safeMessageText) {
      throw new Error("Cannot generate an AI reply for an empty message");
    }

    const systemInstruction = `${customPrompt}\nReply like a real person on WhatsApp. Keep it short unless the user asked for detail. Output only the message to send.`;
    const prompt = `Contact: ${contactName}\nRecent conversation:\n${formatConversationHistory(conversationHistory)}\n\nLatest incoming message:\n${safeMessageText}`;
    const provider = getProvider();
    let output = "";

    if (provider === "openai" || provider === "openrouter" || provider === "groq") {
      const client =
        provider === "openrouter"
          ? getOpenRouterClient()
          : provider === "groq"
            ? getGroqClient()
            : getOpenAIClient();
      const completion = await client.chat.completions.create({
        model:
          provider === "openrouter"
            ? process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
            : provider === "groq"
              ? process.env.GROQ_MODEL || "llama-3.1-8b-instant"
              : process.env.OPENAI_MODEL || "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 180
      });

      output = completion.choices?.[0]?.message?.content?.trim() || "";
    } else if (provider === "gemini") {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        systemInstruction
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      output = response.text().trim();
    } else {
      throw new Error(`Unsupported AI_PROVIDER "${provider}". Use "openai", "openrouter", "groq", or "gemini".`);
    }

    if (!output) {
      throw new Error(`${provider} returned an empty response`);
    }

    return output;
  }

  return {
    generateReply
  };
}

module.exports = {
  createOpenAIService
};
