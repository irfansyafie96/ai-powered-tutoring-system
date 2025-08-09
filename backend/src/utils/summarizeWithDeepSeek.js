import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
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
          content:
            "Extract key points from this text. Use bullet points and headings. Be concise.",
        },
        {
          role: "user",
          content: `Summarize this text:\n\n${chunk}`,
        },
      ],
      temperature: 0.1, // Reduced from 0.2 for more consistent, faster responses
      max_tokens: 1000, // Reduced from 1500 for faster processing
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
