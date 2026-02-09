/**
 * AI Service for Co-Teacher Hub
 * This service handles interactions with the Groq API (LLaMA 3).
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const generateAIContent = async ({ topic, grade, subject, board, type, pdfUrl, teacherInstructions, classId, teacherId, schoolId }) => {
    if (!GROQ_API_KEY) {
        throw new Error("Groq API Key missing. Please check your .env file.");
    }

    let systemPrompt = `You are an expert ${subject} teacher for ${board} board, Grade ${grade}. 
    Internal Context: [Class: ${classId}, Teacher: ${teacherId}, School: ${schoolId}]
    Your task is to generate high-quality academic content tailored for this specific class context.
    You MUST return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json.`;

    let userPrompt = `Generate a ${type} for the topic: "${topic}". Response must be in valid JSON format.`;
    if (teacherInstructions) {
        userPrompt += ` \nSpecial Instructions from teacher: ${teacherInstructions}`;
    }
    if (pdfUrl) {
        userPrompt += ` \nContext from uploaded chapter: ${pdfUrl}`;
    }

    if (type === 'quiz') {
        systemPrompt += ` \nOutput structure for quiz:
        {
            "type": "quiz",
            "title": "Quiz: [Topic Name]",
            "questions": [
                {
                    "id": 1,
                    "question": "Question text?",
                    "options": ["A", "B", "C", "D"],
                    "answer": "Correct Option exactly as in options array",
                    "explanation": "Brief academic explanation"
                }
            ]
        }`;
    } else if (type === 'lesson') {
        systemPrompt += ` \nOutput structure for lesson outline:
        {
            "type": "lesson",
            "title": "Lesson Outline: [Topic Name]",
            "outline": [
                { "heading": "Introduction", "points": ["Point 1", "Point 2"] },
                { "heading": "Key Concepts", "points": ["Point 1", "Point 2"] }
            ]
        }`;
    } else if (type === 'weak_topics') {
        systemPrompt += ` \nOutput structure for weak topics:
        {
            "type": "weak_topics",
            "title": "Suggested Weak Topics for [Topic Name]",
            "suggestions": [
                { "topic": "Name of specific sub-topic", "reason": "Why students struggle here" }
            ]
        }`;
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Groq API Error: ${response.status}`);
        }

        const data = await response.json();
        let rawContent = data.choices[0].message.content;

        // Safety: Strip markdown blocks if the model ignored instructions
        if (rawContent.includes('```')) {
            rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            return JSON.parse(rawContent);
        } catch (parseErr) {
            console.error("Failed to parse AI content:", rawContent);
            throw new Error("AI returned malformed data. Please try again.");
        }

    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};

/**
 * Cloudinary Mock Upload
 */
export const uploadToCloudinary = async (file) => {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
        url: `https://res.cloudinary.com/demo/image/upload/v12345678/samples/${file.name}`,
        public_id: `sample_${Date.now()}`
    };
};
