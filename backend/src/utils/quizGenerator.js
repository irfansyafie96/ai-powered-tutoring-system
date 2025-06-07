import { generateWithDeepSeek } from "./generateWithDeepSeek.js"; // ADD THIS LINE

/**
 * Generate structured quiz data from summary text.
 * @param {string} summary - Raw summary text
 * @param {"easy"|"medium"|"hard"} difficulty - Difficulty level
 * @returns {Array} Array of quiz questions
 */
export const generateQuiz = async (summary, difficulty) => {
  const systemPromptContent = `
You are an AI assistant specialized in generating multiple-choice quiz questions from academic summaries.

⚠️ STRICT GUIDELINES for Quiz Generation:
1. Return exactly 5 questions.
2. Each question must have 4 options (A-D), one correct answer.
3. Use the following precise format for each question:
   Question X: [question text]
   A. [option A text]
   B. [option B text]
   C. [option C text]
   D. [option D text]
   Correct: [A|B|C|D]
4. Ensure the correct answer is indeed present in the options and is accurate.
5. All questions and options must be derived *only* from the provided summary. Do not invent external knowledge.
6. Avoid ambiguous questions or options.
7. Maintain consistent formatting throughout.
8. If the summary is too short or lacks sufficient information to generate 5 distinct questions, generate fewer questions or respond with a message indicating insufficient content. However, prioritize generating 5 questions if possible.
9. Do not include any introductory or concluding remarks outside the quiz format.
    `.trim();

  const userPromptContent = `
Generate a quiz from the following summary with a difficulty level of "${difficulty}".

Summary:
${summary}

Please generate the quiz following the strict format defined in the system prompt.
    `.trim();

  try {
    // Call the new general generation utility
    const response = await generateWithDeepSeek(
      systemPromptContent,
      userPromptContent
    ); // <--- KEY CHANGE

    // Add a check for minimal response content before parsing
    if (!response || response.trim().length < 50) {
      // Arbitrary length, adjust as needed
      console.warn(
        "DeepSeek returned insufficient content for quiz:",
        response
      );
      return []; // Return empty array if response is too short to be a valid quiz
    }

    // --- Your existing parsing logic (remains mostly the same) ---
    const lines = response.split("\n").filter((line) => line.trim() !== ""); // Filter out empty lines for robustness
    const questions = [];
    let i = 0;

    while (i < lines.length) {
      const questionMatch = lines[i]?.match(/^Question \d+:\s*(.*)$/i);
      if (!questionMatch) {
        // If we hit a non-question line, try to advance to the next possible question start
        i++;
        continue;
      }

      const question = questionMatch[1].trim(); // Trim question text
      const options = [];
      // Collect options A-D. Be more robust with line checks.
      for (let j = 1; j <= 4; j++) {
        const optionLine = lines[i + j];
        if (!optionLine) break; // Break if no more lines for options
        const optionMatch = optionLine.match(/^[A-D]\.\s*(.*)$/);
        if (optionMatch) {
          options.push(optionMatch[1].trim()); // Trim option text
        } else {
          // If an option line doesn't match, something is wrong with formatting, stop parsing this question
          console.warn(
            `Quiz parsing error: Option format incorrect at line ${
              i + j
            }: "${optionLine}"`
          );
          options.push(""); // Push empty to keep array length consistent if needed, or handle as error
        }
      }

      const correctAnswerLine = lines[i + 5];
      const correctAnswerMatch =
        correctAnswerLine?.match(/Correct:\s*([A-D])/i);
      const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1] : null;

      // Only push question if it seems valid (e.g., has 4 options and a correct answer)
      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
        });
      } else {
        console.warn("Skipping malformed question due to missing parts:", {
          question,
          options,
          correctAnswer,
        });
      }

      i += 6; // Move to the next potential question start
    }

    // Additional check: Ensure at least one question was successfully parsed
    if (questions.length === 0 && response.trim().length > 0) {
      console.error(
        "Quiz generation failed: AI returned content but no questions were parsed. Raw response:",
        response
      );
    }

    return questions;
  } catch (err) {
    console.error("Error in generateQuiz:", err.message);
    // You might want to distinguish between AI API errors and parsing errors here
    throw new Error("Failed to process quiz generation.");
  }
};
