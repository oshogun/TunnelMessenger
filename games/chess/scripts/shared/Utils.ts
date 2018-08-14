import {Board} from "./Board"
import {Position} from "./MiscStructures"

export interface PositionVariation {
	deltaRows: number;
	deltaColumns: number;
}

export namespace utils {
	export function getVariation(from: Position, to: Position): PositionVariation {
		return {
			deltaRows: to.row - from.row,
			deltaColumns: to.column - from.column
		};
	}

	export function isSamePosition(a: Position, b: Position): boolean {
		return a.row == b.row && a.column == b.column;
	}

	export function getDirection(from: Position, to: Position): PositionVariation {
		let variation = utils.getVariation(from, to);

		let deltaRows = variation.deltaRows;		
		let rowDirection: number = 0;
		if (deltaRows != 0) {
			rowDirection = Math.abs(deltaRows) / deltaRows;
		}

		let deltaColumns = variation.deltaColumns;
		let columnDirection: number = 0;
		if (deltaColumns != 0) {
			columnDirection = Math.abs(deltaColumns) / deltaColumns;
		}

		return {
			deltaRows: rowDirection,
			deltaColumns: columnDirection
		};
	}

	export function getSkippedSquares(from: Position, to: Position): Position[] {
		let direction = utils.getDirection(from, to);
		let rowDirection = direction.deltaRows;
		let columnDirection = direction.deltaColumns;

		let straightMove = (rowDirection == 0 || columnDirection == 0);
		let diagonalMove = (Math.abs(rowDirection) == Math.abs(columnDirection));
		if (!straightMove && !diagonalMove) {
			return [];
		}

		let result: Position[] = [];
		let row = from.row + rowDirection;
		let column = from.column + columnDirection;
		while (row != to.row || column != to.column) {
			result.push({
				row: row,
				column: column
			});

			row += rowDirection;
			column += columnDirection;
		}

		return result;
	}

	/**
	 * Checks if a linear move fulfills the following conditions:
	 * - there are no pieces on the way (except possibly for the
	 * target position);
	 * - the target piece, if any, belongs to a different team
	 * than the attacking piece.
	 *
	 * Note that this function does not check whether the move is
	 * indeed linear.
	 * 
	 * @param  {Board} board the current board configuration
	 * @param  {Position} from the origin of the move
	 * @param  {Position} to the destination of the move
	 * @return {boolean} true if it's a valid linear move, false otherwise
	 */
	export function tryLinearMove(board: Board, from: Position, to: Position): boolean {
		let skippedSquares = utils.getSkippedSquares(from, to);
		for (let position of skippedSquares) {
			if (board.at(position).isOccupied()) {
				return false;
			}
		}

		let targetCell = board.at(to);
		if (!targetCell.isOccupied()) {
			return true;
		}

		let self = board.at(from).getPiece();
		let player = self.getPlayer();
		return targetCell.getPiece().getPlayer() != player;
	}

	export function isStraightMove(from: Position, to: Position): boolean {
		let variation = utils.getVariation(from, to);
		let deltaRows = variation.deltaRows;
		let deltaColumns = variation.deltaColumns;
		return (deltaRows == 0) != (deltaColumns == 0);
	}

	export function isDiagonalMove(from: Position, to: Position): boolean {
		let variation = utils.getVariation(from, to);
		let deltaRows = Math.abs(variation.deltaRows);
		let deltaColumns = Math.abs(variation.deltaColumns);
		return (deltaRows == deltaColumns && deltaRows != 0);
	}

	export function isLinearMove(from: Position, to: Position): boolean {
		let variation = utils.getVariation(from, to);
		let deltaRows = Math.abs(variation.deltaRows);
		let deltaColumns = Math.abs(variation.deltaColumns);
		return (deltaRows == deltaColumns) != (deltaRows * deltaColumns == 0);
	}

	/**
	 * Checks if a target position is either empty or contains
	 * a piece of a different team than the origin piece.
	 *
	 * @param  {Board} board the current board configuration
	 * @param  {Position} origin the position of the attacking piece
	 * @param  {Position} target the target position
	 * @return {boolean} true iff the target position does not contain an ally
	 */
	export function notAlly(board: Board, origin: Position, target: Position): boolean {
		let targetCell = board.at(target);
		if (!targetCell.isOccupied()) {
			return true;
		}

		let originPlayer = board.at(origin).getPiece().getPlayer();
		let targetPlayer = targetCell.getPiece().getPlayer();
		return originPlayer != targetPlayer;
	}
}
