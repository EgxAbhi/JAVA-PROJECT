
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, GeminiQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A check to ensure the API key is available.
  // In a real deployed environment, this would be set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const questionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            questionText: {
                type: Type.STRING,
                description: "The text of the question.",
            },
            options: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                },
                description: "An array of possible answers. For True/False, this should be ['True', 'False'].",
            },
            correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The 0-based index of the correct answer in the options array.",
            },
        },
        required: ["questionText", "options", "correctAnswerIndex"],
    },
};

export const generateQuestions = async (
    topic: string, 
    numQuestions: number, 
    questionType: QuestionType
): Promise<Question[]> => {
    
    const typeDescription = questionType === QuestionType.MultipleChoice ? 
        'multiple-choice questions with 4 options each' : 
        'true/false questions';

    const prompt = `Generate ${numQuestions} ${typeDescription} about the topic: "${topic}". Ensure the questions are clear, concise, and suitable for a quiz.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionSchema,
            },
        });

        const jsonText = response.text.trim();
        const generatedQs: GeminiQuestion[] = JSON.parse(jsonText);
        
        return generatedQs.map((q, index) => ({
            id: `gen-${Date.now()}-${index}`,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.options[q.correctAnswerIndex],
            type: questionType,
        }));

    } catch (error) {
        console.error("Error generating questions with Gemini API:", error);
        throw new Error("Failed to generate questions. Please check the topic and try again.");
    }
};
