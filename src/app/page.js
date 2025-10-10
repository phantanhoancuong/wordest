"use client";

import { useState, useRef, useEffect } from "react";

import Grid from "../components/Grid";
import Keyboard from "../components/Keyboard";
import ToastBar from "../components/ToastBar";
import Banner from "../components/Banner";
import styles from "./page.module.css";

const ATTEMPTS = 6;
const WORD_LENGTH = 5;
const MAX_TOASTS = 3;

function useLatest(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

function countLetter(word) {
  const count = {};
  for (const char of word) {
    count[char] = (count[char] || 0) + 1;
  }
  return count;
}

const CellStatus = {
  DEFAULT: "default",
  CORRECT: "correct",
  PRESENT: "present",
  ABSENT: "absent",
};

function initEmptyGrid() {
  return Array.from({ length: ATTEMPTS }, () =>
    Array.from({ length: WORD_LENGTH }, () => ({
      char: "",
      status: CellStatus.DEFAULT,
    }))
  );
}

async function fetchWordFromApi() {
  const res = await fetch("/api/word");
  if (!res.ok) {
    throw new Error(`HTTP Error! Status: ${res.status}`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error || "Invalid server response");
  }
  return data.target.toUpperCase();
}

export default function Home() {
  const [grid, setGrid] = useState(() => initEmptyGrid());
  const gridRef = useLatest(grid);

  const [rowState, setRowState] = useState(0);
  const [colState, setColState] = useState(0);
  const rowRef = useLatest(rowState);
  const colRef = useLatest(colState);

  const [keyStatuses, setKeyStatuses] = useState({});
  const [error, setError] = useState("");
  const [targetWord, setTargetWord] = useState("");
  const targetLetterCount = useRef({});
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const loadWord = async () => {
      try {
        const word = await fetchWordFromApi();
        setTargetWord(word);
        targetLetterCount.current = countLetter(word);
      } catch (err) {
        console.error("Failed to fetch word ", err);
        setError("Could not load the game. Please try again later.");
        setGameOver(true);
      }
    };

    loadWord();
  }, []);

  function updateCell(row, col, charValue, statusValue) {
    setGrid((prevGrid) => {
      const newRow = [...prevGrid[row]];
      newRow[col] = { char: charValue, status: statusValue };
      const newGrid = [...prevGrid];
      newGrid[row] = newRow;
      return newGrid;
    });
  }

  function updateRow(row, rowValue) {
    setGrid((prevGrid) =>
      prevGrid.map((r, rIndex) => (rIndex === row ? rowValue : r))
    );
  }

  function updateKeyStatuses(guess, statuses) {
    setKeyStatuses((prev) => {
      const newStatuses = { ...prev };
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const newStatus = statuses[i];

        const currentStatus = newStatuses[letter];
        if (currentStatus === CellStatus.CORRECT) continue;
        if (
          currentStatus === CellStatus.PRESENT &&
          newStatus === CellStatus.ABSENT
        )
          continue;

        newStatuses[letter] = newStatus;
      }
      return newStatuses;
    });
  }

  async function submitGuess(row) {
    const guess = gridRef.current[row].map((cell) => cell.char).join("");

    if (guess.length !== WORD_LENGTH) return;

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });

      if (res.status === 422) {
        addToast("Not in word list");
        return;
      }
      if (res.status === 500) {
        addToast("Server error, please try again later.");
        return;
      }
      if (!res.ok) {
        addToast("Unknown error");
        return;
      }

      const tempLetterCount = { ...targetLetterCount.current };
      const statuses = Array(WORD_LENGTH).fill(CellStatus.ABSENT);

      for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === targetWord[i]) {
          statuses[i] = CellStatus.CORRECT;
          tempLetterCount[guess[i]] -= 1;
        }
      }

      for (let i = 0; i < WORD_LENGTH; i++) {
        if (statuses[i] === CellStatus.CORRECT) continue;
        if (tempLetterCount[guess[i]] > 0) {
          statuses[i] = CellStatus.PRESENT;
          tempLetterCount[guess[i]] -= 1;
        }
      }

      const newRow = guess.split("").map((char, i) => ({
        char,
        status: statuses[i],
      }));

      updateRow(row, newRow);
      updateKeyStatuses(guess, statuses);

      if (guess === targetWord) {
        addToast("You win!");
        setGameOver(true);
        return;
      }

      if (row + 1 >= ATTEMPTS) {
        addToast(`${targetWord}`);
        setGameOver(true);
        return;
      }

      setRowState((r) => r + 1);
      setColState(0);
    } catch (err) {
      console.error("Error validating guess: ", err);
      addToast("Network error, please try again later.");
    }
  }

  function handleInput(key) {
    if (gameOver || !targetWord) return;

    const row = rowRef.current;
    const col = colRef.current;

    if (key === "Backspace") {
      setColState((c) => {
        if (c === 0) return c;
        const newCol = c - 1;
        updateCell(row, newCol, "", CellStatus.DEFAULT);
        return newCol;
      });
      return;
    }

    if (key === "Enter") {
      if (col !== WORD_LENGTH) return;
      submitGuess(row);
      return;
    }

    const letter = key.toUpperCase();

    if (/^[A-Z]$/.test(letter)) {
      setColState((c) => {
        if (c >= WORD_LENGTH) return c;
        updateCell(row, c, letter, CellStatus.DEFAULT);
        const newCol = c + 1;
        return newCol;
      });
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
      handleInput(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, targetWord]);

  const [toasts, setToasts] = useState([]);
  function addToast(message) {
    setToasts((prev) => {
      const without = prev.filter((t) => t.message !== message);
      const newToast = { id: Date.now(), message };

      const updated = [...without, newToast];
      return updated.slice(-MAX_TOASTS);
    });
  }
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function restartGame() {
    try {
      const word = await fetchWordFromApi();
      setTargetWord(word);
      targetLetterCount.current = countLetter(word);

      setGrid(initEmptyGrid());
      setRowState(0);
      setColState(0);
      setError("");
      setKeyStatuses({});
      setGameOver(false);
    } catch (err) {
      console.error("Failed to restart game ", err);
      setError("Could not restart the game. Please try again later.");
      setGameOver(true);
    }
  }

  return (
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner />
      </header>

      <main className={styles["app__game"]}>
        {error ? (
          <section className={styles["game__error"]}>
            <p>{error}</p>
          </section>
        ) : (
          <section className={`${styles["game__board"]} flex-center`}>
            <Grid
              grid={
                gameOver
                  ? [
                      targetWord.split("").map((char) => ({
                        char,
                        status: CellStatus.CORRECT,
                      })),
                    ]
                  : grid
              }
            />

            {gameOver && <button onClick={restartGame}>Restart</button>}

            <ToastBar toasts={toasts} removeToast={removeToast} />
          </section>
        )}
      </main>

      <footer className={`${styles["app__keyboard"]}`}>
        <Keyboard keyStatuses={keyStatuses} onKeyClick={handleInput} />
      </footer>

      <div className={styles["landscape-warning"]}>
        The game doesn't fit on your screen in this orientation.
        <br />
        Please rotate your device.
      </div>
    </div>
  );
}
