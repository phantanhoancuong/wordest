"use client";

import { useRef } from "react";

import { useActiveSession } from "@/hooks";

import { GameState } from "@/lib/constants";

import { UseGameStateReturn } from "@/types/useGameState.types";

/**
 * Hook to manage game state lifecycle.
 *
 * Implements delayed state transitions so that game state changes can be synchronized with animations.
 *
 * Typical flow:
 * 1. Call 'queueState()' when a win/loss condition is detected.
 * 2. Let animation finish.
 * 3. Call 'commitState()' to apply the queued state.
 */
export const useGameState = (): UseGameStateReturn => {
  const { gameState, setGameState } = useActiveSession();
  const pendingGameState = useRef<GameState | null>(null);

  const resetState = (): void => {
    setGameState(GameState.PLAYING);
  };

  return {
    state: gameState,
    pendingState: pendingGameState.current,
    setGameState,
    resetState,
  };
};
