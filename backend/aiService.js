const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const configuration = {
    apiKey: process.env.OPENAI_API_KEY,
};

// Support for Custom Base URL (e.g. Groq)
if (process.env.OPENAI_BASE_URL) {
    configuration.baseURL = process.env.OPENAI_BASE_URL;
}

const openai = new OpenAI(configuration);

// Load FAQ Data for RAG-lite
let faqData = [];
try {
    const faqPath = path.join(__dirname, 'data', 'faq.json');
    if (fs.existsSync(faqPath)) {
        faqData = JSON.parse(fs.readFileSync(faqPath, 'utf8'));
    }
} catch (e) {
    console.warn("Could not load FAQ data:", e.message);
}

const findRelevantFaq = (message) => {
    if (!message) return null;
    const lowerMsg = message.toLowerCase();
    for (const item of faqData) {
        if (item.keywords && item.keywords.some(keyword => lowerMsg.includes(keyword))) {
            return item.answer;
        }
    }
    return null;
};

// Personality Traits configuration
const PERSONALITIES = {
    'A': 'Encouragement Seeker: You are empathetic, reassuring, and provide frequent nudges. Focus on motivation.',
    'B': 'Creative Explorer: You are witty, creative, and dislike spoon-feeding. Offer variety and let the user explore options.',
    'C': 'Goal Finisher: You are direct, structured, and efficiency-focused. Give clear plans and checklists.'
};

const USAGE_BEHAVIOR = {
    'new': 'User is new (0-3 days). Be grounded, empathetic, allow venting. No instant remedies unless asked.',
    'settling': 'User is settling in (4-8 days). Be a friendly listener. Provide short remedies only after 2 messages.',
    'experienced': 'User is experienced (9+ days). Act like a Coach. Provide actionable guidance immediately.'
};

const SAFETY_PROMPT = `
CRITICAL SAFETY INSTRUCTIONS:
If the user asks about:
- Diseases (e.g., heart disease, diabetes)
- Injuries (e.g., ligament tear, fracture)
- Medications or supplements

YOU MUST:
1. REFUSE to answer the specific medical question.
2. STATE clearly: "I cannot provide medical advice."
3. SUGGEST: "Please consult a certified doctor or professional."

DO NOT attempt to give "general advice" on these specific medical topics.
`;

const generateResponse = async (userMessage, context) => {
    try {
        const { personality = 'A', usageDays = 0, lifestyle = {} } = context;

        // 1. Determine Usage Context
        let usageContext = USAGE_BEHAVIOR.new;
        if (usageDays >= 4 && usageDays <= 8) usageContext = USAGE_BEHAVIOR.settling;
        if (usageDays >= 9) usageContext = USAGE_BEHAVIOR.experienced;

        // 2. Format Lifestyle Data
        const lifestyleString = `
        Current Stats:
        - Steps: ${lifestyle.steps || 0}
        - Exercise: ${lifestyle.exerciseMinutes || 0} mins
        - Sleep: ${lifestyle.sleepHours || 0} hours
        `;

        // 3. RAG-lite: Check for relevant FAQ
        const faqContext = findRelevantFaq(userMessage);
        const faqString = faqContext
            ? `\n**Relevant Fitness Knowledge Base**:\n"${faqContext}"\n(Use this info if relevant, but maintain your personality.)`
            : "";

        // 4. Compose System Prompt
        const systemPrompt = `
        You are an Adaptive Fitness Companion Chatbot.
        
        **Your Personality Profile**:
        ${PERSONALITIES[personality] || PERSONALITIES['A']}

        **User Usage Level**:
        ${usageContext}

        **User Lifestyle Context**:
        ${lifestyleString}
        ${faqString}
        
        ${SAFETY_PROMPT}

        **Response Structure Requirements**:
        - Provide structured responses using simple text formatting.
        - Use hyphens (-) for bullet points.
        - Use numbering (1.) for steps.
        - Use clear spacing to separate sections.
        - DO NOT use markdown characters like **bold**, ## headers, or tables.
        - Keep it clean and easy to read as plain text.
        `;

        const model = process.env.OPENAI_MODEL || "gpt-4o";

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error("OpenAI/Groq Error:", error);
        return "I'm having trouble connecting to my fitness brain right now. Please try again later.";
    }
};

module.exports = { generateResponse };
