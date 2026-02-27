"use client";

import { useRef } from "react";

import { useActiveSession } from "@/hooks";

import { GameState } from "@/lib/constants";

import { UseGameStateReturn } from "@/types/useGameState.types";

/**
 * Hook to manage game state lifecycle.
 *
 * Implements delayed state transitions so that game state changes can be synchronized with animations.
 */
export const useGameState = (): UseGameStateReturn => {
  const { gameState, setGameState } = useActiveSession();

  const resetState = (): void => {
    setGameState(GameState.PLAYING);
  };

  return {
    state: gameState,
    setGameState,
    resetState,
  };
};
