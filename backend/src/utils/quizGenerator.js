import { generateWithDeepSeek } from "./generateWithDeepSeek.js";

/**
 * Generate structured quiz data from summary text.
 * @param {string} summary - Raw summary text
 * @param {"easy"|"medium"|"hard"} difficulty - Difficulty level
 * @param {number} numQuestions - The desired number of questions
 * @returns {Array} Array of quiz questions
 */
export const generateQuiz = async (summary, difficulty, numQuestions) => {
  const systemPromptContent = `
You are an AI assistant specialized in generating multiple-choice quiz questions from academic summaries.

⚠️ STRICT GUIDELINES for Quiz Generation:
1. Return exactly ${numQuestions} questions. // Dynamically set number of questions
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
8. If the summary is too short or lacks sufficient information to generate ${numQuestions} distinct questions, generate fewer questions or respond with a message indicating insufficient content. However, prioritize generating ${numQuestions} questions if possible.
9. Do not include any introductory or concluding remarks outside the quiz format.
    `.trim();

  const userPromptContent = `
Generate a quiz from the following summary with a difficulty level of "${difficulty}".

Summary:
${summary}

Please generate the quiz following the strict format defined in the system prompt.
    `.trim();

  try {
    const response = await generateWithDeepSeek(
      systemPromptContent,
      userPromptContent
    );

    if (!response || response.trim().length < 50) {
      console.warn(
        "DeepSeek returned insufficient content for quiz:",
        response
      );
      return [];
    }

    const lines = response.split("\n").filter((line) => line.trim() !== "");
    const questions = [];
    let i = 0;

    while (i < lines.length) {
      const questionMatch = lines[i]?.match(/^Question \d+:\s*(.*)$/i);
      if (!questionMatch) {
        i++;
        continue;
      }

      const question = questionMatch[1].trim();
      const options = [];
      for (let j = 1; j <= 4; j++) {
        const optionLine = lines[i + j];
        if (!optionLine) break;
        const optionMatch = optionLine.match(/^[A-D]\.\s*(.*)$/);
        if (optionMatch) {
          options.push(optionMatch[1].trim());
        } else {
          console.warn(
            `Quiz parsing error: Option format incorrect at line ${
              i + j
            }: "${optionLine}"`
          );
          options.push("");
        }
      }

      const correctAnswerLine = lines[i + 5];
      const correctAnswerMatch =
        correctAnswerLine?.match(/Correct:\s*([A-D])/i);
      const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1] : null;

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

      i += 6;
    }

    if (questions.length === 0 && response.trim().length > 0) {
      console.error(
        "Quiz generation failed: AI returned content but no questions were parsed. Raw response:",
        response
      );
    }

    return questions;
  } catch (err) {
    console.error("Error in generateQuiz:", err.message);
    throw new Error("Failed to process quiz generation.");
  }
};
