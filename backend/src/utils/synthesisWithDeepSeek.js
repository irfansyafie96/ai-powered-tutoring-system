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
          content: `
You are an AI assistant that refines and synthesizes a set of notes into a final, coherent document.
The notes you receive were generated from chunks of a larger document and have been concatenated.
Your tasks are:
1. Merge the notes into a single, logically flowing document.
2. Remove any redundant or duplicate headings and content.
3. Ensure a consistent and clean structure using headings and bullet points.
4. Do not add any information that is not present in the provided notes.
5. Remove any artifacts from the original document's structure, such as section numbers (e.g., "1.8", "Chapter 5"), page numbers, or phrases like "End of Document". The output should only contain the titles and the content.
          `.trim(),
        },
        {
          role: "user",
          content: `
Based on the combined notes below, create a final, synthesized summary.

Notes:
"${combinedSummary}"
          `.trim(),
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
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
