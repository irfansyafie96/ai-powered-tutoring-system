import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

/**
 * Sends a generic prompt to the DeepSeek chat model and returns its completion.
 * This is suitable for various generation tasks, including quizzes.
 *
 * @param {string} systemContent - The system role content for the AI.
 * @param {string} userContent - The user role content (your specific instructions/summary).
 * @returns {Promise<string>} - The AI's generated response as a string.
 */
export const generateWithDeepSeek = async (systemContent, userContent) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", // Or "deepseek-coder" if you prefer for some tasks
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
      temperature: 0.7, // Add a temperature to control creativity (0.7 is a good balance)
      max_tokens: 1500, // Add max_tokens to prevent excessively long responses
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("DeepSeek GENERATION API error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      // You might want to log the prompt here during development if errors occur
      // systemContent,
      // userContent,
    });
    // Re-throw the error so higher-level functions can catch it and respond appropriately
    throw new Error("Failed to get response from DeepSeek API for generation.");
  }
};
