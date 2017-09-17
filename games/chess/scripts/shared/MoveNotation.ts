import {Position} from "./MiscStructures"

export interface MoveNotation {
	/**
	 * Converts a move in some notation to the corresponding Position.
	 * 
	 * @param  {string} move The move to be converted
	 * @return {Position} The resulting Position
	 */
	toPosition(move: string): Position;

	/**
	 * Converts Position to its corresponding move in some notation.
	 * 
	 * @param  {Position} The position to be converted
	 * @return {string} move The resulting move
	 */
	fromPosition(position: Position): string;
}
