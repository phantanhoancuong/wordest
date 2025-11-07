import { CellStatus, CellAnimation } from "../lib/constants";

export interface Cell {
  char: string;
  status: CellStatusType;
  animation: CellAnimationType;
  animationDelay: number;
  animationKey?: number;
}

export type PartialCell = Partial<Cell>;

export type CellStatusType = (typeof CellStatus)[keyof typeof CellStatus];

export type CellAnimationType =
  (typeof CellAnimation)[keyof typeof CellAnimation];

export interface Grid {
  grid: Array<Array<Cell>>;
}
