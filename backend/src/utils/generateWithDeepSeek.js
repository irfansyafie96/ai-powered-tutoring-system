import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

/**
 * Sends a generic prompt to the DeepSeek chat model and returns its completion.
 *
 * @param {string} systemContent - The system role content for the AI.
 * @param {string} userContent - The user role content (your specific instructions/summary).
 * @returns {Promise<string>} The AI's generated response as a string.
 */
export const generateWithDeepSeek = async (systemContent, userContent) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemContent.trim(),
        },
        {
          role: "user",
          content: userContent.trim(),
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek GENERATION API error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    throw new Error("Failed to get response from DeepSeek API for generation.");
  }
};

/**
 * Takes a collection of raw, partial notes and synthesizes them into a final,
 * coherent set of study notes using DeepSeek.
 *
 * @param {string} rawNotes - The combined, unrefined notes from all chunks.
 * @returns {Promise<string>} The final, structured study notes.
 */
export const createFinalSummary = async (rawNotes) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `
You are an expert AI assistant that synthesizes and organizes study material into a rich, well-formatted document.

Your task is to take a collection of raw notes and transform them into a complete, easy-to-study document using Markdown formatting.

Formatting Rules:
- The output MUST be in Markdown.
- Use '#' for the main title, '##' for major sections, and '###' for sub-sections.
- Use '**' for bolding key terms.
- Use '*' or '-' for bullet points.
- The document should start directly with the main title. Do not add introductory phrases like "Study Notes:".
- Do not add a concluding phrase like "End of Notes" or "End of Document".
- Consolidate all information logically and remove redundant points.
          `.trim(),
        },
        {
          role: "user",
          content: `
Please create a single, cohesive, and well-formatted study document using Markdown from the raw text provided below.

Raw Notes:
"${rawNotes}"
          `.trim(),
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek FINAL SUMMARY error:", {
      message: error.message,
    });
    throw new Error("Failed to create final summary from DeepSeek API.");
  }
};
