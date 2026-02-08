import { useGameStore } from "@/store/useGameStore";

export const useActiveSession = () => {
  const activeSession = useGameStore((s) => s.activeSession);
  const hydrateFromSettings = useGameStore((s) => s.hydrateFromSettings);
  const gameState = useGameStore(
    (s) => s.sessions.get(activeSession)!.gameState,
  );

  const gameGrid = useGameStore((s) => s.sessions.get(activeSession)!.gameGrid);

  const referenceGrid = useGameStore(
    (s) => s.sessions.get(activeSession)!.referenceGrid,
  );

  const row = useGameStore((s) => s.sessions.get(activeSession)!.row);
  const col = useGameStore((s) => s.sessions.get(activeSession)!.col);

  const keyStatuses = useGameStore(
    (s) => s.sessions.get(activeSession)!.keyStatuses,
  );

  const lockedPositions = useGameStore(
    (s) => s.sessions.get(activeSession)!.lockedPositions,
  );

  const minimumLetterCounts = useGameStore(
    (s) => s.sessions.get(activeSession)!.minimumLetterCounts,
  );

  const targetWord = useGameStore(
    (s) => s.sessions.get(activeSession)!.targetWord,
  );

  const setGameState = useGameStore((s) => s.setGameState);
  const setGameGrid = useGameStore((s) => s.setGameGrid);
  const resetGameGrid = useGameStore((s) => s.resetGameGrid);
  const setReferenceGrid = useGameStore((s) => s.setReferenceGrid);
  const resetReferenceGrid = useGameStore((s) => s.resetReferenceGrid);
  const setRow = useGameStore((s) => s.setRow);
  const setCol = useGameStore((s) => s.setCol);
  const incrementRow = useGameStore((s) => s.incrementRow);
  const setKeyStatuses = useGameStore((s) => s.setKeyStatuses);
  const resetKeyStatuses = useGameStore((s) => s.resetKeyStatuses);
  const setLockedPositions = useGameStore((s) => s.setLockedPositions);
  const setMinimumLetterCounts = useGameStore((s) => s.setMinimumLetterCounts);
  const setTargetWord = useGameStore((s) => s.setTargetWord);
  const setWordLength = useGameStore((s) => s.setWordLength);
  const setRuleset = useGameStore((s) => s.setRuleset);

  const wordLength = useGameStore(
    (s) => s.sessions.get(activeSession)!.wordLength,
  );
  const ruleset = useGameStore((s) => s.sessions.get(activeSession)!.ruleset);

  return {
    activeSession,
    hydrateFromSettings,
    gameState,
    setGameState,
    gameGrid,
    setGameGrid,
    resetGameGrid,
    referenceGrid,
    setReferenceGrid,
    resetReferenceGrid,
    wordLength,
    setWordLength,
    ruleset,
    setRuleset,
    row,
    col,
    setRow,
    setCol,
    incrementRow,
    keyStatuses,
    setKeyStatuses,
    resetKeyStatuses,
    lockedPositions,
    setLockedPositions,
    minimumLetterCounts,
    setMinimumLetterCounts,
    targetWord,
    setTargetWord,
  };
};
