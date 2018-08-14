import {Board} from "./Board"
import {FENTranslationTable} from "./FENTranslationTable"
import {Player, CastlingRights, CastlingType, Position} from "./MiscStructures"
import {PieceFactory} from "./PieceFactory"
import {BoardNotation} from "./BoardNotation"
import {Settings} from "./Settings"

export class FEN implements BoardNotation {
	public loadBoard(board: Board, position: string): void {
		let fenParts = position.split(" ");
		this.loadPosition(board, fenParts[0]);
		this.loadCurrentPlayer(board, fenParts[1]);
		this.loadCastlingRights(board, fenParts[2]);
		this.loadEnPassant(board, fenParts[3]);
		this.loadHalfMoveClock(board, fenParts[4]);
		this.loadFullMoveCount(board, fenParts[5]);
	}

	public toString(board: Board): string {
		let fenParts: string[] = [
			this.savePosition(board),
			this.saveCurrentPlayer(board),
			this.saveCastlingRights(board),
			this.saveEnPassant(board),
			this.saveHalfMoveClock(board),
			this.saveFullMoveCount(board)
		];

		return fenParts.join(" ");
	}

	private loadPosition(board: Board, fen: string): void {
		let size = board.getSize();
		let isDigit = /[1-9]/;
		let index = 0;
		for (let i = 0; i < size; i++) {
			let j = 0;
			while (j < size) {
				let char = fen[index];
				if (isDigit.test(char)) {
					j += parseInt(char);
				} else {
					let position = {
						row: i,
						column: j
					};

					let piece = this.pieceFactory.fromString(char);
					board.setCellContent(position, piece);
					j++;
				}
				index++;
			}
			index++; // skips the slashes between rows
		}
	}

	private loadCurrentPlayer(board: Board, fen: string): void {
		let player: Player;
		if (fen == "w") {
			player = Player.WHITE;
		} else if (fen == "b") {
			player = Player.BLACK;
		} else {
			// TODO: create a custom exception
			throw Error("42");
		}

		board.setCurrentPlayer(player);
	}

	private loadCastlingRights(board: Board, fen: string): void {
		let rights: CastlingRights = CastlingType.NONE;
		let none = false;

		for (let i = 0; i < fen.length; i++) {
			let char = fen[i];
			switch (char) {
				case "K":
					rights |= CastlingType.WHITE_KINGSIDE;
					break;
				case "Q":
					rights |= CastlingType.WHITE_QUEENSIDE;
					break;
				case "k":
					rights |= CastlingType.BLACK_KINGSIDE;
					break;
				case "q":
					rights |= CastlingType.BLACK_QUEENSIDE;
					break;
				case "-":
					none = true;
					break;
				default:
					// TODO: create a custom exception
					throw Error("42");
			}
		}

		if (none && rights != CastlingType.NONE) {
			// TODO: create a custom exception
			throw Error("42");
		}

		board.setCastlingRights(rights);
	}

	private loadEnPassant(board: Board, fen: string): void {
		if (fen != "-") {
			let position = Settings.moveNotation.toPosition(fen);
			board.setEnPassantSquare(position);
		} else {
			board.setEnPassantSquare(null);
		}
	}

	private loadHalfMoveClock(board: Board, fen: string): void {
		let numericValue = parseInt(fen);
		if (!isNaN(numericValue)) {
			board.setHalfMoveClock(numericValue);
		} else {
			// TODO: create a custom exception
			throw Error("42");
		}
	}

	private loadFullMoveCount(board: Board, fen: string): void {
		let numericValue = parseInt(fen);
		if (!isNaN(numericValue)) {
			board.setFullMoveCount(numericValue);
		} else {
			// TODO: create a custom exception
			throw Error("42");
		}
	}

	private savePosition(board: Board): string {
		let result = "";
		let size = board.getSize();
		for (let i = 0; i < size; i++) {
			if (i > 0) {
				result += "/";
			}

			let emptyCells = 0;
			for (let j = 0; j < size; j++) {
				let cell = board.at(i, j);
				if (cell.isOccupied()) {
					if (emptyCells > 0) {
						result += emptyCells.toString();
						emptyCells = 0;
					}

					result += this.pieceFactory.toString(cell.getPiece());
				} else {
					emptyCells++;
				}
			}

			if (emptyCells > 0) {
				result += emptyCells.toString();
			}
		}

		return result;
	}

	private saveCurrentPlayer(board: Board): string {
		return board.getCurrentPlayer() == Player.WHITE ? "w" : "b";
	}

	private saveCastlingRights(board: Board): string {
		let result = "";
		let castlingRights = board.getCastlingRights();

		if (castlingRights & CastlingType.WHITE_KINGSIDE) {
			result += "K";
		}

		if (castlingRights & CastlingType.WHITE_QUEENSIDE) {
			result += "Q";
		}

		if (castlingRights & CastlingType.BLACK_KINGSIDE) {
			result += "k";
		}

		if (castlingRights & CastlingType.BLACK_QUEENSIDE) {
			result += "q";
		}

		if (result.length == 0) {
			result += "-";
		}

		return result;
	}

	private saveEnPassant(board: Board): string {
		let enPassantSquare = board.getEnPassantSquare();
		if (!enPassantSquare) {
			return "-";
		}

		return Settings.moveNotation.fromPosition(enPassantSquare);
	}

	private saveHalfMoveClock(board: Board): string {
		return board.getHalfMoveClock().toString();
	}

	private saveFullMoveCount(board: Board): string {
		return board.getFullMoveCount().toString();
	}

	private pieceFactory = new PieceFactory(new FENTranslationTable());
}
