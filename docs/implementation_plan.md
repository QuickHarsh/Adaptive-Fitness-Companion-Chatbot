# Implementation Plan - Adaptive Fitness Companion Chatbot

## Goal Description
Build a "Adaptive Fitness Companion Chatbot" using React Native (Expo) and a Node.js + Express backend. The bot will provide fitness guidance, adapting to user personality, usage duration, and lifestyle context, while adhering to safety guardrails.

## User Review Required
> [!IMPORTANT]
> **Backend Execution**: The requirements state "The project must run using only: npm install, npx expo start". However, a separate Node.js + Express backend requires execution. I will add backend dependencies to the root `package.json` and provide a script (e.g., `npm run backend`) or expect the evaluator to run `node backend/index.js` as documented in my updated README.
> **Database**: Valid PostgreSQL connection string (`DATABASE_URL`) is required for the backend to function.

## Proposed Changes

### Backend
Directory: `/backend` (New Directory)

#### [NEW] [index.js](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/backend/index.js)
- Express server setup.
- API Routes:
    - `POST /api/chat`: Handles user messages.
    - `GET /api/history`: Returns chat history (Bonus).

#### [NEW] [db.js](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/backend/db.js)
- PostgreSQL connection using `pg` pool.
- Table initialization (Users, Chats).

#### [NEW] [aiService.js](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/backend/aiService.js)
- OpenAI API integration.
- Prompt composition logic (Personality + Usage + Lifestyle).
- Safety guardrails (System prompt + pre-check).

### Frontend
Directory: `/app` and `/components`

#### [NEW] [Context Providers](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/constants/UserContext.js)
- `UserContext`: Stores user personality, usage duration (mocked/persisted), and lifestyle data.

#### [NEW] [HomeScreen](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/app/index.tsx)
- Welcome UI.
- Input for "Personality" (if not hardcoded).
- "Start Chat" button.

#### [NEW] [ChatScreen](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/app/chat.tsx)
- Chat interface (Bubble UI).
- Integration with Backend API.
- Rendering structured responses (Markdown/Cards).

#### [MODIFY] [package.json](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/package.json)
- Add dependencies: `express`, `pg`, `cors`, `dotenv`, `openai`.

### Bonus Features
#### [MODIFY] [UserContext.tsx](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/components/UserContext.tsx)
- Add `coins` state and `addCoin` function.
- Persist coins to AsyncStorage.

#### [NEW] [faq.json](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/backend/data/faq.json)
- Create a JSON file with 10-20 fitness Q&A pairs.

#### [MODIFY] [aiService.js](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/backend/aiService.js)
- Load `faq.json`.
- Implement basic keyword matching to find relevant FAQ entries.
- Inject relevant FAQ content into the System Prompt (RAG-lite).

#### [MODIFY] [chat.tsx](file:///Users/harshpatel/Desktop/Adaptive-Fitness-Companion-Chatbot/app/chat.tsx)
- Call `addCoin` when a message is sent.
- Display a "+1 Coin" animation.
- **Status**: Completed & Verified.

## Verification Plan

### Automated Tests
- None planned (Scope is prototype/assignment).

### Manual Verification
1.  **Setup**:
    - Run `npm install`.
    - Set `.env` with `OPENAI_API_KEY` and `DATABASE_URL`.
    - Run `node backend/index.js` in Terminal 1.
    - Run `npx expo start` in Terminal 2.
2.  **Test Welcome Screen**:
    - Verify UI text and "Start Chat" button.
3.  **Test Chat Flow**:
    - Send "Hi". Verify response.
    - Send "I have a fracture". Verify refusal (Safety).
    - Send "Make me a workout plan". Verify structured response (Table/List).
4.  **Test Adaptation**:
    - Change "Days Using App" < 3. Verify empathetic tone.
    - Change "Days Using App" > 9. Verify coaching tone.
