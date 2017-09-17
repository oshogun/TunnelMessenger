import {Board} from "./Board"

export interface BoardNotation {
	loadBoard(board: Board, position: string): void;
	toString(board: Board): string;
}
