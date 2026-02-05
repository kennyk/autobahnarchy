# Autobahnarchy - Game Design Document

## Overview

**Autobahnarchy** is a pixel-art PWA that helps drivers (primarily from the US) learn German road rules through study and competitive quizzing.

### Goals
- Teach German road rules that differ from US rules
- Provide both learning (study) and testing (quiz) modes
- Support 1 or 2 player competitive gameplay
- Work fully offline as an installable PWA
- Deliver a retro 8-bit gaming experience

## Game Flow

```
┌─────────────────┐
│  Title Screen   │
│  "AUTOBAHNARCHY"│
│                 │
│  [1 PLAYER]     │
│  [2 PLAYERS]    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Study Mode    │
│                 │
│  [NEXT RULE]    │
│  [START QUIZ]   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Quiz Mode     │
│                 │
│  Player 1: 10 Q │
│  Player 2: 10 Q │ ◄── (2-player only, same questions)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Results      │
│                 │
│  Stats + Winner │
└────────┬────────┘
         │
         ▼
     [PLAY AGAIN] ──► Back to Title
```

### Player Modes
- **1-Player**: Masha studies and quizzes solo, sees personal stats
- **2-Player**: Masha completes all 10 questions, then Bobby answers the same 10 questions. Results compare both scores and crown a winner.

## Screen Details

### Title Screen
- Large pixel-art "AUTOBAHNARCHY" logo
- German road/Autobahn-themed pixel background
- Two buttons: "1 PLAYER" / "2 PLAYERS"
- 1-player mode uses "Masha" as the player name
- 2-player mode: Player 1 is "Masha", Player 2 is "Bobby" (hardcoded, no name entry)

### Study Mode
- One rule displayed at a time, centered
- **For sign rules**: Pixel art sign image on top, explanation text below
- **For verbal rules**: Text description with optional simple illustration
- Rule counter: "Rule 3 of 15"
- Two buttons at bottom: "NEXT RULE" / "START QUIZ"
- Can cycle through all rules, wraps back to first after last

### Quiz Mode
- Shows current player and question number: "MASHA - Q3/10"
- Question text or sign image at top
- 4 multiple-choice answers as buttons (always includes "None of the above")
- Multi-select questions show checkboxes; single-select show radio-style buttons
- "SUBMIT" button confirms answer
- Brief feedback flash: correct (green) or incorrect (red) before next question

### Results Screen
- 1-player: "MASHA scored 8/10" with breakdown of missed questions
- 2-player: Side-by-side scores for Masha and Bobby, winner announcement with fanfare pixel animation
- "PLAY AGAIN" button returns to title

## Data Structure

Content lives in JSON files within the app.

### rules.json
```json
[
  {
    "id": "sign-001",
    "type": "sign",
    "image": "signs/yellow-diamond.png",
    "title": "Priority Road",
    "explanation": "You have right-of-way at all intersections until the sign is cancelled."
  },
  {
    "id": "verbal-001",
    "type": "verbal",
    "title": "Right Before Left",
    "explanation": "At unmarked intersections, yield to vehicles approaching from your right.",
    "image": null
  }
]
```

### quiz.json
```json
[
  {
    "id": "q-001",
    "relatedRuleId": "sign-001",
    "questionType": "sign",
    "image": "signs/yellow-diamond.png",
    "questionText": "What does this sign mean?",
    "answers": [
      { "text": "You have priority on this road", "correct": true },
      { "text": "Caution: construction ahead", "correct": false },
      { "text": "Yield to oncoming traffic", "correct": false },
      { "text": "None of the above", "correct": false }
    ],
    "multiSelect": false
  }
]
```

### Key Points
- `relatedRuleId` links quiz questions to study content (useful for "review what you missed")
- `multiSelect` flag determines checkbox vs radio button UI
- 10 questions randomly selected from pool for each quiz
- Same random seed used for both players in 2-player mode

## Technical Architecture

### Project Structure
```
autobahnarchy/
├── index.html
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker for offline
├── css/
│   └── style.css          # All styles, pixel art aesthetic
├── js/
│   ├── app.js             # Main game logic & state
│   ├── screens.js         # Screen rendering functions
│   └── quiz.js            # Quiz logic & scoring
├── data/
│   ├── rules.json
│   └── quiz.json
├── assets/
│   ├── signs/             # Pixel art sign images
│   ├── ui/                # Buttons, borders, icons
│   └── logo.png           # Title screen logo
└── fonts/
    └── pixel-font.woff2   # Retro pixel font
```

### PWA & Offline
- **manifest.json**: App name, icons, theme color, display: standalone
- **Service Worker**: Caches all assets on first load (cache-first strategy)
- Once installed, works 100% offline - no network requests needed
- Installable on iOS (Add to Home Screen) and Android

### State Management
- Simple JavaScript object holds game state:
  - `currentScreen`, `playerCount`, `currentRuleIndex`
  - `quizQuestions`, `currentQuestion`, `player1Answers`, `player2Answers`
- No persistence needed between sessions (fresh start each time)

### No Build Step
- Vanilla JS with ES modules (`<script type="module">`)
- No bundler, no transpilation - just serve the files

## UI & Art Direction

### Visual Style
- **Inspiration**: Original Legend of Zelda (NES), early 8-bit games
- **Resolution feel**: Chunky pixels, limited color palette per element
- **No anti-aliasing**: Hard pixel edges everywhere

### Color Palette
- **Background**: Dark blue (#1a1a2e) or dark green (#0f380f) - classic game feel
- **Text**: Off-white (#e8e8e8) for readability
- **Accent**: Gold/yellow (#f0c000) for highlights, buttons, winner announcement
- **Correct**: Green (#38b764)
- **Incorrect**: Red (#b13e53)
- **Signs**: Accurate to real German sign colors (red, yellow, blue, white)

### Typography
- Single pixel font throughout (e.g., "Press Start 2P" or similar free font)
- ALL CAPS for headers and buttons
- Mixed case for longer explanation text (readability)

### UI Elements
- Buttons: Rectangular with 2px pixel border, subtle hover state (color shift)
- Panels: Simple bordered boxes for content areas
- Transitions: Instant screen cuts (no fancy animations - retro feel)
- Feedback: Screen flash or brief sprite animation for correct/incorrect

## Content Scope

### Initial Release
- 10-20 rules covering core differences between US and German road rules
- Mix of sign-based and verbal rules
- Corresponding quiz questions for all rules

### Example Content Areas
- Priority road signs (yellow diamond)
- Right-before-left rule
- Autobahn rules (no speed limit signs, minimum speed)
- Environmental zones (Umweltzone)
- Unique German signs (town entry/exit, etc.)

## Out of Scope (Future Enhancements)

- Sound effects and music
- Progress saving between sessions
- Categories/filtering for rules
- More than 2 players
- Difficulty levels
- Achievements/unlockables
