# UNMESS — Turn Chaos Into Clarity

> **"Your mind wasn't built to remember everything. Let UNMESS organize it."**

UNMESS is a developer-grade, AI-powered cognitive entropy decompression engine. It transforms raw, disorganized thoughts, meeting transcripts, fragmented notes, audio dictations, and high-stress daily responsibilities into structured, prioritized action units.

---

## ✨ Features

1. **De-Mess Studio**
   - **Entropy Ingestion**: Dump fragmented notes, audio voice note transcripts, Slack/email clutter, or meeting minutes.
   - **Voice Dictation**: Built-in Web Speech API audio transcription with real-time feedback.
   - **Clarity Extraction**: Extracts Tasks, Deadlines, Reminders, and Ideas with zero fluff.
   - **Polished Prose**: Synthesizes chaotic brain dumps into clear, readable, cohesive paragraphs.
   - **Parsing Strategies**: *Balanced*, *Action Items (P1 Only)*, and *Executive Briefing*.

2. **Multi-Model AI Cascade (Token Guard & Failover)**
   - Smart cascade: **Groq (Fastest)** → **Google Gemini** → **OpenAI/ChatGPT** → **OpenRouter** → **Local Heuristic Engine**.
   - Zero-crash fallback: If an API quota is exhausted or rate-limited, it automatically falls back to the next provider.
   - Built-in Local NLP parser: Works 100% offline or out of the box even before adding API keys.
   - Token Guard: Prompt pruning and JSON formatting saves up to 68% in token overhead.

3. **AI Priority Assistant (Eisenhower Urgency-Impact Matrix)**
   - Computes urgency based on approaching deadlines, time estimates, and mental effort.
   - 4 Quadrants:
     - **Q1 - Do First**: Critical deadlines (P1).
     - **Q2 - Schedule / Deep Work**: High-effort strategic items.
     - **Q3 - Quick Wins**: Tasks taking under 20 minutes.
     - **Q4 - Backlog**: Exploratory thoughts & low-stress items.

4. **Smart Daily Planner**
   - Chrono-sequenced timeline scheduling based on biological cognitive cycles:
     - *09:00 - 11:30*: Morning Peak Cognitive (Deep Work)
     - *11:45 - 12:30*: High Focus Execution
     - *13:30 - 14:45*: Collaborative & Meetings
     - *15:00 - 16:00*: Operational & Quick Wins
     - *16:30 - 17:15*: Daily Wrap-up & Review
   - Re-order schedule blocks with 1 click.
   - 15-minute inter-block cognitive guardrails to prevent burnout.

5. **Clarity & Efficiency Telemetry Dashboard**
   - Chaos Density Score tracking.
   - Total tasks completed & on-time completion percentage.
   - Real-time token efficiency & AI latency metrics.
   - Persistent session history with one-click reload back to Studio.

6. **Interactive Procedural Fluid WebGL Background**
   - High-contrast obsidian aesthetic with fluid simplex-noise WebGL shader.
   - Hardware-friendly toggle: Pause or resume animation anytime in Settings to save battery and GPU on low-end laptops.
   - Obsidian Dark Theme and Clean Light Theme switch.

7. **Universal Export Hub**
   - Export to **Markdown** (for Notion & Obsidian).
   - Export to **iCalendar (.ics)** (instant import to Google Calendar, Apple Calendar, Outlook).
   - Export to **Plain Text** & **JSON**.
   - One-click copy with toast notifications.

8. **Cloud & Local Hybrid Storage**
   - Cloud Firestore integration for cross-device authentication and sync.
   - Automatic local storage persistence in Guest Mode if Firebase credentials are not yet configured.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configure API Keys
You can configure your keys in any of these 3 ways:
1. Open the file `API_KEYS.txt` in the root folder and paste your keys.
2. Edit `.env` or `.env.local`:
   ```env
   VITE_GROQ_API_KEY=gsk_...
   VITE_GEMINI_API_KEY=AIzaSy...
   VITE_OPENAI_API_KEY=sk-...
   VITE_OPENROUTER_API_KEY=sk-or-v1-...
   ```
3. Or simply open the web app, click the **Settings (Sliders)** icon, and paste your keys into the AI Cascade section!

> **Note**: Even if you don't enter any keys, UNMESS runs immediately using its smart local heuristic engine!

### 3. Run Locally
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Deploy to Vercel
UNMESS is pre-configured with `vercel.json`:
```bash
npm run build
npx vercel
```
Or import the repository directly into your Vercel Dashboard.

