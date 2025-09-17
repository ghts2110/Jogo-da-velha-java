// Modelagem do estado
export type Mark = "X" | "O";
export type Cell = "" | Mark;
export type Board = Cell[]; // 9 posições

const LINES = [
  [0,1,2],[3,4,5],[6,7,8], // linhas
  [0,3,6],[1,4,7],[2,5,8], // colunas
  [0,4,8],[2,4,6]          // diagonais
] as const satisfies readonly (readonly [number, number, number])[];

// Utilitários puros de estado
export function emptyBoard(): Board {
  return Array(9).fill("");
}

export function isValidMove(board: Board, idx: number) {
  return idx >= 0 && idx < 9 && board[idx] === "";
}

export function availableMoves(board: Board): number[]{
  const emptyCell: number[] = []

  for(let i = 0; i < 9; i++){
    if(board[i] == ""){
      emptyCell.push(i)
    }
  }

  return emptyCell
}

export function applyMove(board: Board, idx: number, mark: Mark): Board {
  const b = board.slice();
  b[idx] = mark;
  return b;
}

// Regras de término e vencedor
export function winnerOf(board: Board): Mark | "draw" | null {
  for (const [a,b,c] of LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a] as Mark;
  }
  return board.every(c => c !== "") ? "draw" : null;
}

export function isTerminal(board: Board): boolean{
  if(winnerOf(board) != null){
    return true;
  }
  return false;
}

// Gestão de turno
export function nextPlayer(board: Board, first: Mark = "X", turn: number): Mark{
  if(turn % 2 == 0){
    return first;
  }

  return first == "X" ? "O" : "X";
}
