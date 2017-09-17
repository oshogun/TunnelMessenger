import {Board} from "../Board"
import {Player, Position, Ranks} from "../MiscStructures"
import {Piece} from "../Piece"
import {utils} from "../Utils"

export class Pawn implements Piece {
	public isMoveValid(board: Board, from: Position, to: Position): boolean {
		let self = board.at(from).getPiece();
		let player = self.getPlayer();

		let allowedDirection: number;
		let isInStartingPosition: boolean;
		if (player == Player.WHITE) {
			allowedDirection = -1;
			isInStartingPosition = (from.row == Ranks.SECOND_RANK);
		} else {
			allowedDirection = 1;
			isInStartingPosition = (from.row == Ranks.SEVENTH_RANK);
		}

		let variation = utils.getVariation(from, to);
		let deltaRows = variation.deltaRows;
		let deltaColumns = variation.deltaColumns;
		if (deltaColumns == 0) {
			// Forward movement
			if (board.at(to).isOccupied()) {
				return false;
			}

			if (isInStartingPosition && deltaRows == 2 * allowedDirection) {
				// 2-square move
				let skippedSquare: Position = {
					row: from.row + allowedDirection,
					column: from.column
				};

				return !board.at(skippedSquare).isOccupied();
			}

			// allow 1-square moves only
			return deltaRows == allowedDirection;
		} else if (Math.abs(deltaColumns) == 1 && deltaRows == allowedDirection) {
			// Capture
			let targetCell = board.at(to);
			if (targetCell.isOccupied()) {
				// Normal capture
				return targetCell.getPiece().getPlayer() != player;
			} else {
				// En passant capture
				let enPassantSquare = board.getEnPassantSquare();
				return !!enPassantSquare && utils.isSamePosition(to, enPassantSquare);
			}
		}

		return false;
	}

	public onMove(board: Board, from: Position, to: Position): boolean {
		let variation = utils.getVariation(from, to);
		let deltaRows = variation.deltaRows;
		let deltaColumns = variation.deltaColumns;

		if (Math.abs(deltaRows) == 2) {
			// 2-square move, update en passant square
			let skippedSquare: Position = {
				row: from.row + (deltaRows / 2),
				column: from.column
			};

			board.setEnPassantSquare(skippedSquare);
		} else if (Math.abs(deltaColumns) == 1) {
			if (!board.at(to).isOccupied()) {
				// en passant capture, remove the target pawn
				let pawnSquare: Position = {
					row: from.row,
					column: to.column
				};

				board.destroy(pawnSquare);
			}
		}

		let player = this.getPlayer();
		let isInPromotionSquare: boolean = false;
		if (player == Player.WHITE) {
			isInPromotionSquare = (to.row == Ranks.EIGHTH_RANK);
		} else {
			isInPromotionSquare = (to.row == Ranks.FIRST_RANK);
		}

		// pawn moves always reset the half move clock
		board.setHalfMoveClock(0);

		return isInPromotionSquare;
	}

	public setPlayer(player: Player): void {
		this.player = player;
	}

	public getPlayer(): Player {
		return this.player;
	}

	private player: Player;
}
