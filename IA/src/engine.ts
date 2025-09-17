// modelagem do estado
export type Mark = "X" | "O";
export type Cell = "" | Mark;
export type Board = Cell[]; // 9 posições

const LINES = [
  [0,1,2],[3,4,5],[6,7,8], // linhas
  [0,3,6],[1,4,7],[2,5,8], // colunas
  [0,4,8],[2,4,6]          // diagonais
] as const satisfies readonly (readonly [number, number, number])[];

