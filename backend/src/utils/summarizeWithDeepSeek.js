import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com ",
});

/**
 * Generate structured lecture notes from a text chunk.
 * @param {string} chunk - A single chunk of text
 * @returns {Promise<string>} - Generated notes for that chunk
 */
export const summarizeWithDeepSeek = async (chunk) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `
            You are an AI assistant tasked with generating structured lecture notes from academic material.

            ⚠️ STRICT RULES:
            - Use only information explicitly present in the source text.
            - Do NOT add explanations, examples, or external knowledge.
            - Retain technical terms, proper nouns, and exact phrases from the source.
            - Structure notes using plain text conventions:
              • Headings: === Section Title ===
              • Bullet points with "-"
            - Maintain the original order of ideas and sections.
            - Output must be plain text (no markdown).
            - Include definitions/explanations only if explicitly provided in the source.
            - Ensure clarity while staying faithful to the source material.
          `.trim(),
        },
        {
          role: "user",
          content: `
            Generate structured lecture notes from the following academic text. Follow these rules precisely:
            • Organize content using plain text bullets (-), numbered lists (1.), and headings (=== Section Title ===).
            • Identify and highlight key terms/concepts relevant to the subject.
            • Include definitions or explanations only if explicitly provided in the source.
            • Maintain the original structure and order of ideas.
            • Output plain text only — no markdown or formatting.

            Text:
            ${chunk}
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
    return "Chunk summary failed";
  }
};
