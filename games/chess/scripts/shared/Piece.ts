import {Board} from "./Board"
import {Player, Position} from "./MiscStructures"

export interface Piece {
	/**
	 * Checks if moving this piece from square "from" to square "to"
	 * is valid. Note that special moves such as Castling that
	 * involve more than one piece should return false here,
	 * since they are treated somewhere else.
	 * 
	 * @param  {Board} board the current board configuration
	 * @param  {Position} from the origin square
	 * @param  {Position} to the target square
	 * @return {boolean} true is the move is valid, false otherwise
	 */
	isMoveValid(board: Board, from: Position, to: Position): boolean;

	/**
	 * Method to allow changing certain properties of the
	 * board when this piece is moved (e.g setting the
	 * en passant square, disabling castling or promoting).
	 * Note that this method should assume that the move is valid.
	 * 
	 * @param  {Board} board the post-move board configuration
	 * @param  {Position} from the origin square
	 * @param  {Position} to the target square
	 * @return {boolean} true if the move results in a promotion, false otherwise
	 */
	onMove(board: Board, from: Position, to: Position): boolean;

	setPlayer(player: Player): void;
	getPlayer(): Player;
}
