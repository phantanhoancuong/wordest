import { CellAnimation, CellStatus } from "@/lib/constants";

export interface DataCell {
  char: string;
  status: CellStatusType;
}

export interface RenderCell extends DataCell {
  animation: CellAnimationType;
  animationDelay: number;
  animationKey?: number;
}

export type PartialRenderCell = Partial<RenderCell>;

export type CellStatusType = (typeof CellStatus)[keyof typeof CellStatus];

export type CellAnimationType =
  (typeof CellAnimation)[keyof typeof CellAnimation];

export interface Grid {
  grid: Array<Array<RenderCell>>;
}
