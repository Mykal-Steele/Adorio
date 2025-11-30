import { GoogleGenAI } from "@google/genai";

export const streamGeminiResponse = async (
  history: { role: string; text: string }[],
  context: string,
  onChunk: (text: string) => void,
  useThinking: boolean
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    onChunk("Error: API Key not found.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const modelName = useThinking ? "gemini-3-pro-preview" : "gemini-2.5-flash";

  const systemInstruction = `You are a direct Computer Architecture tutor.
  
  CONTEXT:
  ${context}

  INSTRUCTIONS:
  1. Give practical, step-by-step answers without long paragraphs or theoretical explanations.
  2. Focus on steps, formulas, and direct solutions.
  3. Be concise: no chit-chat, no introductions, straight to the point.
  4. Always provide the correct answer based on the solution in the context.
  5. If the user asks for the answer, give it directly from the context's solution.
  6. Use the Definitions and Solution from the context.
  7. If wrong, explain why briefly with the correct step from the solution.
  `;

  const recentHistory = history.slice(-10);

  try {
    const lastMessage = recentHistory[recentHistory.length - 1];
    const historyForChat = recentHistory.slice(0, -1).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const thinkingConfig = useThinking ? { thinkingBudget: 32768 } : undefined;

    const activeChat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction,
        thinkingConfig: thinkingConfig,
      },
      history: historyForChat,
    });

    const result = await activeChat.sendMessageStream({
      message: lastMessage.text,
    });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n[Connection Error]");
  }
};
