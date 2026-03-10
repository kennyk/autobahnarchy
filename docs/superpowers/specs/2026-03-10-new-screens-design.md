# New Interstitial Screens Design

## Overview

Add three new interstitial screens to the game flow: Instructions, Handoff, and Victory. These improve the player experience by replacing the current `alert()` for player transitions and adding context before study and quiz phases.

## Screen Flows

**1-player:** Title -> Instructions -> Study -> Quiz -> Results

**2-player:** Title -> Instructions -> Study -> Handoff (Masha) -> Quiz (Masha) -> Handoff (Bobby) -> Quiz (Bobby) -> Victory -> Results

## New Screens

### Instructions (`screen-instructions`)

- Appears after player count is selected, before study mode (both 1P and 2P)
- Shows `assets/study-time.png` image
- Text: "Flip through the rules to study up. When you're ready, hit START QUIZ!"
- Button: "LET'S GO!" -> navigates to study screen

### Handoff (`screen-handoff`) — 2-player only

A single reusable screen whose content is swapped dynamically per player:

- **Masha's turn:** `assets/masha-run.png`, text: "Masha is up! Bobby no fucking peeking!", button: "GO!"
- **Bobby's turn:** `assets/bobby-run.png`, text: "Bobby is up! Masha, please kindly look away.", button: "GO!"

Shown twice in 2P flow:
1. After study, before Masha's quiz
2. After Masha's quiz completes, before Bobby's quiz

### Victory (`screen-victory`) — 2-player only

Shown after both players complete the quiz, before the results summary.

- **Winner exists:** Shows winner's victory gif (`masha-victory.gif` or `bobby-victory.gif`), text announcing winner (e.g. "MASHA WINS!"), button: "SEE SUMMARY" -> results
- **Tie:** No gifs. Text: "IT'S A TIE!", button: "SEE SUMMARY" -> results

## Implementation Approach

- All 3 screens follow the existing pattern: `<div id="screen-{name}" class="screen">` toggled via `showScreen()`
- Handoff and Victory screens are single HTML elements with content swapped dynamically in JS
- The `alert()` on line 133 of `app.js` is removed
- The existing results screen is unchanged
- CSS styling follows existing patterns (same card/button styles, pixel-art font)
- `sw.js` ASSETS array updated with new image references

## Assets Used

- `assets/study-time.png` (instructions screen)
- `assets/masha-run.png` (handoff screen, Masha's turn)
- `assets/bobby-run.png` (handoff screen, Bobby's turn)
- `assets/masha-victory.gif` (victory screen, Masha wins)
- `assets/bobby-victory.gif` (victory screen, Bobby wins)
