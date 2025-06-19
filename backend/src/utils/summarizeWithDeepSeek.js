import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

/**
 * Generates structured lecture notes by extracting key information from a text chunk.
 *
 * @param {string} chunk - A single chunk of text to summarize.
 * @returns {Promise<string>} The generated summary for that chunk.
 */
export const summarizeWithDeepSeek = async (chunk) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant that extracts key information from a piece of text.
Your goal is to create a raw, detailed set of notes from the text provided.
Do not add any information that is not present in the text.
Do not include any personal commentary, notes, or apologies (e.g., "Note: The text cuts off...").
Structure the output using headings and bullet points where appropriate.
          `.trim(),
        },
        {
          role: "user",
          content: `
Based on the text below, create a detailed set of notes.
Only use the information provided in the text.

Text:
"${chunk}"
          `.trim(),
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek API error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    return ""; // Return empty string on failure to allow batch processing to continue
  }
};
