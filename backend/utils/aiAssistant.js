const axios = require('axios');

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://host.docker.internal:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Sends a prompt to Ollama and returns the response.
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
const queryAI = async (prompt) => {
    try {
        const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });
        return response.data.response;
    } catch (error) {
        console.error('Error querying Ollama:', error.message);
        throw new Error('AI processing failed. Make sure Ollama is running.');
    }
};

/**
 * Generates flashcards from text.
 * @param {string} text 
 * @returns {Promise<Array<{question: string, answer: string}>>}
 */
const generateFlashcards = async (text) => {
    const prompt = `
    Based on the following study material, generate 5-10 flashcards.
    Each flashcard must have a "question" and an "answer".
    Return the response as a JSON object with a "flashcards" array.
    
    Text:
    ${text.substring(0, 4000)} // Truncate to avoid context window issues
    `;

    const result = await queryAI(prompt);
    try {
        const parsed = JSON.parse(result);
        return parsed.flashcards || [];
    } catch (e) {
        console.error('Failed to parse AI response for flashcards:', result);
        return [];
    }
};

/**
 * Generates a multiple choice test from text.
 * @param {string} text 
 * @returns {Promise<Array<{question: string, options: string[], correctIndex: number, explanation: string}>>}
 */
const generateTest = async (text) => {
    const prompt = `
    Based on the following study material, generate 5 multiple-choice questions.
    Each question must have:
    - "question": The question text
    - "options": An array of 4 possible answers
    - "correctIndex": The 0-based index of the correct answer
    - "explanation": A short explanation of why it's correct
    
    Return the response as a JSON object with a "questions" array.
    
    Text:
    ${text.substring(0, 4000)}
    `;

    const result = await queryAI(prompt);
    try {
        const parsed = JSON.parse(result);
        return parsed.questions || [];
    } catch (e) {
        console.error('Failed to parse AI response for test:', result);
        return [];
    }
};

/**
 * Dissects chapter text into semantic blocks (text, image placeholders, special terms).
 * @param {string} text 
 * @returns {Promise<Array<{type: string, content: string, style?: any, imageDescription?: string}>>}
 */
const dissectChapterContent = async (text) => {
    const prompt = `
    Analyze the following chapter text and break it into a logical sequence of "blocks".
    For each block, identify:
    - type: "text" or "image" (if the text describes an image or figure)
    - content: The raw text or the description of the image
    - style: { "isBold": boolean, "isSpecial": boolean } (set isSpecial to true for definitions or key terms)
    - imageDescription: (only if type is "image")
    
    Return the response as a JSON object with a "blocks" array.
    
    Text:
    ${text.substring(0, 3000)}
    `;

    const result = await queryAI(prompt);
    try {
        const parsed = JSON.parse(result);
        return parsed.blocks || [{ type: 'text', content: text, style: { isBold: false, isSpecial: false } }];
    } catch (e) {
        console.error('Failed to parse AI response for dissection:', result);
        return [{ type: 'text', content: text, style: { isBold: false, isSpecial: false } }];
    }
};

module.exports = {
    generateFlashcards,
    generateTest,
    dissectChapterContent
};
