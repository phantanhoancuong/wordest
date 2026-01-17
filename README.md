# WORDest

**WORDest** is a Wordle-inspired word puzzle game (with a few extra spices), built with **Next.js**.

Play it live at:  
https://wordest.vercel.app

---

## How You Can Play

The goal is to guess a hidden word within a limited number of attempts.

- Each guess must be a valid word of a chosen length.
- After every guess, letters are highlighted to show feedback:
  - Correct letter in the correct position
  - Correct letter in the wrong position
  - Incorrect letter
- Use this feedback to refine your next guesses.
- The game ends when the word is solved or when all attempts are used.

### Word Length

Expanded from Wordle, which only lets you play with 5-letter words. In WORDest, you can choose between **5-, 6-, and 7-letter words**, which changes both difficulty and pacing.

---

## Game Modes

WORDest currently offers two game modes to suit different play styles.

### Normal Mode

Normal Mode follows standard Wordle rules and is intended for relaxed, casual play.  
You are free to experiment with guesses as long as they are valid words.

### Expert Mode

Expert Mode is designed for players who want stricter rules and more deliberate decision-making.

When Expert Mode is enabled, guesses must follow additional constraints:

- Letters confirmed in the correct position must be reused in that same position.
- Letters known to be present must continue to appear at least the same number of times.

### Hardcore Mode

Hardcore Mode is intended for experienced players who want to rely purely on memory and deducation, with minimal assistance from the UI.

Hardcore Mode buils on Strict Mode and enforces all of its rules, with additional restrictions:

- The reference grid is disabled.
- Keyboard letter status feedback is disabled.

Switching modes automatically restarts the game to avoid rule conflicts.

---

## Customization & Settings

WORDest includes several options that let you tailor how the game looks and feels.  
Your preferences are saved and restored when you return.

### Color Themes

You can choose how the game looks:

- **Light Theme**
- **Dark Theme**
- **System Theme**, which follows your browser’s color scheme preference.

### Sound & Feedback

Audio feedback is fully adjustable:

- Volume slider with visual icon feedback.
- Mute toggle that preserves your previous volume level.
- Sound effects when interacting with buttons and controls.

### Animation Speed

You can control how fast animations play:

- **Fast**, **Normal**, **Slow**.
- **Instant**, which removes animation delays for faster play.

### Reset Settings

You can reset all options back to their default values at any time.

---

### Word Lists & Validity

WORDest uses curated word lists derived from
[SCOWL (Spell Checker Oriented Word Lists)](http://wordlist.aspell.net/).

- The **allowed guess list** is intentionally more expansive, allowing a wide range of valid words.
- The **answer list** is more selective and focuses on common, familiar words to keep solutions reasonable.
- The answer list is filtered to remove offensive or inappropriate words.

While care is taken to keep the lists clean and fair, filtering may not be perfect.  
If you encounter an issue, feedback is welcome.

## Notable UX / UI Details

WORDest focuses heavily on clarity, predictability, and consistency during play as I try to adhere to UX / UI principles while designing (even though the technical implementation may not be great yet).

- **Reliable input handling**  
  Rapid key presses are processed one by one. Holding down a key will not spam input or sound effects.

- **Clear visual feedback**  
  Letter statuses are revealed with animation to make the gameplay more lively. The keyboard and the reference grid both reflect known letter states, helping you reason about future guesses.

- **Stable layout**  
  The game board and keyboard are intentionally constrained so everything fits within a single viewport. You can’t accidentally scroll away from the game mid-play.

- **Grouped and categorized settings**  
  Settings are grouped into collapsible sections with consistent controls, keeping customization organized and easy to scan.

- **State preservation**  
  Navigating away and coming back within the same session does not unexpectedly reset progress or settings.

- **Persistent preferences**  
  Some preferences are stored in the browser so they persist even across sessions.

---

## Possible Future Expansions

I plan to continue developing WORDest and explore new ideas, some ideas that may or may not be implemented are shown below:

### Gameplay

- Additional difficulty variants.
- Timed or challenge-based modes.
- Alternative word lists or dictionaries.
- Practice modes without pressure or constraints.

### Player Progress

- Basic statistics (wins, streaks, guess distribution).
- History or recap of previous games.

### UX / UI

- Further animation refinement.
- Accessibility improvements such as color-blind mode.
- Additional customization options.

These ideas are exploratory and may change over time.

---

## Feedback

If you have feedback, suggestions, or ideas, feel free to open an issue or reach out at:  
phantanhoancuong@gmail.com

Or alternatively, open an issue in the repository.
