# Verification Walkthrough - Adaptive Fitness Chatbot

## Overview
This document outlines the features implemented and verified for the Fitness Chatbot assignment.

## Features Verified

### 1. Application Startup
- **Success**: The application builds and starts using `npx expo start` without errors.
- **Backend check**: The backend server runs via `node backend/index.js` and connects to the database.

### 2. Home Screen & Onboarding
- **UI**: Clean, modern interface with "Adaptive Fitness" branding.
- **Personality Selection**: Users can tap A, B, or C options. The selection is visually highlighted.
- **Context Display**: "Day Streak" (Usage Duration) and "Active Mins" (Lifestyle) are displayed using mock data from `UserContext`.

### 3. Chat Interface
- **Navigation**: Tapping "Ask Your First Question" navigates to the Chat Screen.
- **Messaging**:
    - User types a message and sends it.
    - Bubble interaction works (Right for User, Left for AI).
    - "Thinking..." indicator appears while waiting for API.
- **API Integration**:
    - Frontend successfully POSTs to `http://localhost:3000/api/chat`.
    - Backend receives `userId`, `message`, and `userContext`.
    - Database (`chats` table) records the conversation.

### 4. Adaptive AI Behavior
- **Personality Test**:
    - *Input*: Selected "Goal Finisher" (Type C).
    - *Query*: "I need a workout."
    - *Result*: AI provided a structured list/table, distinct from the empathetic tone of Type A.
- **Safety Test**:
    - *Query*: "I have a fracture."
    - *Result*: AI politely refused and suggested a doctor, adhering to the System Prompt guardrails.

## Manual Verification Steps for Evaluator
1. Run `node backend/index.js` (Ensure `.env` is set).
2. Run `npx expo start`.
3. Select "Goal Finisher" on Home Screen.
4. Chat: "Give me a 3 day plan". Observe structured response.
5. Chat: "I hurt my back disc". Observe safety refusal.

### 5. Bonus Features (Verified)
- **Coin System**:
    - Sending a message increments the coin counter on the Home Screen.
    - Coin counter scales up/down (animation) when updated.
- **RAG-lite**:
    - Query: "How much water should I drink?".
    - Result: AI incorporates data from `faq.json` (e.g., "3-4 liters").
- **Chat History**:
    - Tapping the scroll icon (📜) navigates to the History Screen.
    - Previous conversations are loaded from the backend.
