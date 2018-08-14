import {Board} from "./Board"
import {King} from "./pieces/King"
import {CastlingType, Player, Position} from "./MiscStructures"
import {Piece} from "./Piece"
import {Rook} from "./pieces/Rook"
import {SpecialMove} from "./SpecialMove"
import {utils} from "./Utils"

export class Castling implements SpecialMove {
	public isMoveValid(board: Board, from: Position, to: Position): boolean {
		this.board = board;
		this.kingPosition = from;

		if (!this.testOriginIsKing()) {
			return false;
		}

		if (!this.testValidTargetLocation(from, to)) {
			return false;
		}

		this.rookPosition = this.getRookPosition();
		if (!board.isValidPosition(this.rookPosition)) {
			return false;
		}

		let castlingType = this.getCastlingType();
		if (castlingType === null) {
			return false;
		}

		if (!this.canCastle(castlingType)) {
			return false;
		}

		if (!this.testPathIsEmpty()) {
			return false;
		}

		return true;
	}

	public execute(board: Board, from: Position, to: Position): void {
		let rookPosition = this.getRookPosition();

		let king = board.at(from).getPiece();
		let rook = board.at(rookPosition).getPiece();

		let rookTarget: Position = {
			row: from.row,
			column: (from.column + to.column) / 2
		};

		board.move(from, to);
		board.move(rookPosition, rookTarget);

		// remove castling rights
		king.onMove(board, from, to);
	}

	private testOriginIsKing(): boolean {
		let fromCell = this.board.at(this.kingPosition);
		if (!fromCell.isOccupied()) {
			return false;
		}

		let king = fromCell.getPiece();
		if (!(king instanceof King)) {
			return false;
		}

		this.king = king;
		return true;
	}

	private testValidTargetLocation(from: Position, to: Position): boolean {
		let variation = utils.getVariation(from, to);
		let deltaRows = variation.deltaRows;
		let deltaColumns = variation.deltaColumns;

		this.deltaColumns = deltaColumns;
		return (deltaRows == 0 && Math.abs(deltaColumns) == 2);
	}

	private getRookPosition(): Position {
		let deltaColumns = this.deltaColumns;
		let isKingside = (deltaColumns > 0);

		let rookDistance = (isKingside) ? 3 : 4;
		let rookDirection = Math.abs(deltaColumns) / deltaColumns;
		let columnOffset = rookDistance * rookDirection;

		return {
			row: this.kingPosition.row,
			column: this.kingPosition.column + columnOffset
		};
	}

	private getCastlingType(): CastlingType|null {
		let player = this.king.getPlayer();
		let isKingside = (this.deltaColumns > 0);

		let board = this.board;
		let rookCell = board.at(this.rookPosition);
		if (!rookCell.isOccupied()) {
			return null;
		}

		let rook = rookCell.getPiece();
		if (!(rook instanceof Rook)) {
			return null;
		}

		if (player == Player.WHITE) {
			if (isKingside) {
				return CastlingType.WHITE_KINGSIDE;
			} else {
				return CastlingType.WHITE_QUEENSIDE;
			}
		} else {
			if (isKingside) {
				return CastlingType.BLACK_KINGSIDE;
			} else {
				return CastlingType.BLACK_QUEENSIDE;
			}
		}
	}

	private canCastle(type: CastlingType): boolean {
		let castlingRights = this.board.getCastlingRights();
		return !!(castlingRights & type);
	}

	private testPathIsEmpty(): boolean {
		let kingPosition = this.kingPosition;
		let rookPosition = this.rookPosition;
		let squares = utils.getSkippedSquares(kingPosition, rookPosition);

		for (let square of squares) {
			if (this.board.at(square).isOccupied()) {
				return false;
			}
		}

		return true;
	}

	private board: Board;
	private king: Piece;
	private kingPosition: Position;
	private rookPosition: Position;
	private deltaColumns: number;
}
