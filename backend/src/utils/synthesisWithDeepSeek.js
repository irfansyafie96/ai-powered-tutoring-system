import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

/**
 * Synthesizes a collection of partial summaries into a single, coherent document.
 *
 * @param {string} combinedSummary - The combined text of all partial summaries.
 * @returns {Promise<string>} The final, synthesized summary.
 */
export const synthesizeWithDeepSeek = async (combinedSummary) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Merge these notes into a coherent document. Remove duplicates and organize with headings.",
        },
        {
          role: "user",
          content: `Organize these notes:\n\n${combinedSummary}`,
        },
      ],
      temperature: 0.1, // Reduced for consistency
      max_tokens: 2000, // Reduced from 3000 for faster processing
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek synthesis API error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    // Return the original combined summary as a fallback on failure
    return combinedSummary;
  }
};
