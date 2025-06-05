import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

/**
 * Generate structured lecture notes from a text chunk.
 * @param {string} chunk - A single chunk of text
 * @returns {Promise<string>} - Generated summary for that chunk
 */
export const summarizeWithDeepSeek = async (chunk) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant specialized in generating structured, accurate, and concise lecture notes from academic material.

⚠️ STRICT GUIDELINES:
1. Only use information explicitly present in the source text.
2. Do NOT add explanations, examples, or external knowledge.
3. Retain technical terms, proper nouns, and exact phrases from the source.
4. Structure output using plain text conventions:
   • Headings: === Section Title ===
   • Subheadings: --- Subsection ---
   • Bullet Points: -
   • Numbered Lists: 1., 2., etc.
5. Maintain the original order of ideas and sections.
6. Group related concepts together under appropriate headings.
7. Output must be plain text only — no markdown or special formatting.
8. If content is unclear or empty, respond with: "No valid content to summarize."
9. Avoid line wrapping issues — keep paragraphs short and readable.
10. Ensure consistency between chunks — avoid repeating headers unnecessarily.

Your goal is to transform the input into well-organized lecture-style notes without altering the meaning or structure of the original text.
          `.trim(),
        },
        {
          role: "user",
          content: `
Generate structured lecture notes from the following academic text:

"${chunk}"

Follow these instructions precisely:
• Use only content from the text above.
• Organize content using:
  - Headings: === Section Title ===
  - Subheadings: --- Subsection ---
  - Bullet points: -
• Highlight key terms/concepts relevant to the subject.
• Include definitions/explanations ONLY if explicitly provided.
• Keep the original structure and flow of the document.
• Output plain text only — no markdown.
• Do not invent or infer missing content.

Return only the summarized notes.
          `.trim(),
        },
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek API error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    return ""; // Return empty string on failure
  }
};
