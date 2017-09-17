import {Board} from "./Board"
import {Position} from "./MiscStructures"

export interface SpecialMove {
	isMoveValid(board: Board, from: Position, to: Position): boolean;
	execute(board: Board, from: Position, to: Position): void;
}
