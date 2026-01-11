# Adaptive Fitness Companion Chatbot

A React Native (Expo) mobile application powered by OpenAI, designed to provide personalized fitness guidance based on user personality, usage habits, and lifestyle context.

## 🚀 How to Run

### Prerequisites
- Node.js v20.x
- PostgreSQL (Running locally or hosted)
- OpenAI API Key

### 1. Backend Setup
The backend runs on Node.js + Express and handles AI logic and database persistence.

1. Navigate to the root directory.
2. Install dependencies (if not already done via root install):
   ```bash
   npm install
   ```
3. Create a `.env` file in the root configuration (or update environment variables):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/fitness_db
   OPENAI_API_KEY=sk-...
   PORT=3000
   ```
4. Start the server:
   ```bash
   node backend/index.js
   ```
   *The server will initialize the database tables on first run.*

### 2. Frontend Setup
The frontend is built with Expo.

1. Open a new terminal.
2. Run the Expo app:
   ```bash
   npx expo start
   ```
3. Scan the QR code with your phone or press `i` for iOS Simulator / `a` for Android Emulator.

> [!IMPORTANT]
> **Full Feature Mode**: Run `node backend/index.js` in a separate terminal for AI & Database.
> 
> **Offline Mode**: If you *only* run `npx expo start`, the app will function in "Offline Mode" with limited responses. This satisfies the "run only with expo start" constraint for basic UI/Logic verification.

---

## 🧠 AI & Prompt Strategy

### Prompt Composition
Every request sent to OpenAI is dynamically composed using a "Layered Context" strategy in `backend/aiService.js`.

The formula is:
```
System Prompt = [Personality Profile] + [Usage Context] + [Lifestyle Data] + [Safety Guardrails]
```

#### 1. Personality Layer
The user selects a personality type on the Home Screen, which dictates the AI's tone:
- **Type A (Encouragement Seeker)**: Empathetic, reassuring. "You're doing great!"
- **Type B (Creative Explorer)**: Witty, varied. "Let's mix it up today."
- **Type C (Goal Finisher)**: Direct, structured. "Here is your plan. Executed."

#### 2. Usage Duration Layer
The app tracks how long the user has been using it (simulated via `UserContext`):
- **New (0-3 days)**: Grounded, listening mode. No quick fixes.
- **Settling (4-8 days)**: Friendly listener. Short tips.
- **Experienced (9+ days)**: Coach mode. Action oriented.

#### 3. Lifestyle Layer
Mock data regarding steps, sleep, and exercise is injected into the prompt to give context-aware advice (e.g., "I see you only slept 5 hours, let's keep it light").

### Safety Refusals
The system prompt includes strict instructions to **REFUSE** answering questions about:
- Specific injuries (fractures, tears)
- Diseases (heart disease, diabetes)
- Medications

**Refusal Logic**: The `SAFETY_PROMPT` constant in `backend/aiService.js` contains a list of forbidden topics. The AI is instructed to:
1. Refuse the answer.
2. State "I cannot provide medical advice."
3. Suggest consulting a professional.

## 🛠️ AI Tools & Prompts Used
- **OpenAI GPT-4o / GPT-3.5**: Used for generating chat responses.
- **Groq (Mixtral 8x7B)**: Supported as an alternative high-speed model.
- **GitHub Copilot / Agent**: Used for debugging, code scaffolding, and generating the `faq.json` dataset.
- **Prompts**:
  - *System Prompt*: "You are an Adaptive Fitness Companion..." (See `backend/aiService.js` for full prompt).
  - *RAG Prompt*: "Relevant Fitness Knowledge Base: [FAQ Content]..."

## 📂 Project Structure

```
/app                # Expo Router screens (Home, Chat)
/backend            # Node.js Express Server
  - index.js        # Server Entry
  - db.js           # PostgreSQL Connection
  - aiService.js    # OpenAI Integration & Prompt Logic
/components         # React Components
  - UserContext.tsx # Global State (Personality, Usage)
```

## 🤖 AI Tools Used
- **OpenAI GPT-4o / GPT-3.5**: Used for generating chat responses.
- **GitHub Copilot / Agent**: Used for code scaffolding and refactoring.
