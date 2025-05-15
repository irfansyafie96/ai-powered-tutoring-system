import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

/**
 * Summarize a given text via DeepSeek Chat API.
 * @param {string} text — raw extracted text
 * @returns {Promise<string>} — the generated summary
 */

export const summarizeWithDeepSeek = async (text) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "Summarize this educational content clearly and concisely.",
        },
        {
          role: "user",
          content: text.slice(0, 4000),
        },
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek API error: ", error);
    return "Summarization failed";
  }
};
