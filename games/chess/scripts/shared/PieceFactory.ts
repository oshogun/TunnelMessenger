import {Bishop} from "./pieces/Bishop"
import {King} from "./pieces/King"
import {Knight} from "./pieces/Knight"
import {Player} from "./MiscStructures"
import {Queen} from "./pieces/Queen"
import {Pawn} from "./pieces/Pawn"
import {Piece} from "./Piece"
import {PieceTranslationTable} from "./PieceTranslationTable"
import {Rook} from "./pieces/Rook"

export class PieceFactory<T extends PieceTranslationTable> {
	constructor(table: T) {
		this.table = table;
	}
 
	fromString(value: string): Piece {
		let table = this.table;
		let piece: Piece;
		switch (value) {
			case table.BLACK_PAWN:
				piece = new Pawn();
				piece.setPlayer(Player.BLACK);
				break;
			case table.BLACK_ROOK:
				piece = new Rook();
				piece.setPlayer(Player.BLACK);
				break;
			case table.BLACK_KNIGHT:
				piece = new Knight();
				piece.setPlayer(Player.BLACK);
				break;
			case table.BLACK_BISHOP:
				piece = new Bishop();
				piece.setPlayer(Player.BLACK);
				break;
			case table.BLACK_QUEEN:
				piece = new Queen();
				piece.setPlayer(Player.BLACK);
				break;
			case table.BLACK_KING:
				piece = new King();
				piece.setPlayer(Player.BLACK);
				break;
			case table.WHITE_PAWN:
				piece = new Pawn();
				piece.setPlayer(Player.WHITE);
				break;
			case table.WHITE_ROOK:
				piece = new Rook();
				piece.setPlayer(Player.WHITE);
				break;
			case table.WHITE_KNIGHT:
				piece = new Knight();
				piece.setPlayer(Player.WHITE);
				break;
			case table.WHITE_BISHOP:
				piece = new Bishop();
				piece.setPlayer(Player.WHITE);
				break;
			case table.WHITE_QUEEN:
				piece = new Queen();
				piece.setPlayer(Player.WHITE);
				break;
			case table.WHITE_KING:
				piece = new King();
				piece.setPlayer(Player.WHITE);
				break;
			default:
				// TODO: create a custom exception
				throw Error("42");
		}

		return piece;
	}

	public toString(piece: Piece): string {
		let table = this.table;
		if (piece instanceof Pawn) {
			return piece.getPlayer() == Player.WHITE
				? table.WHITE_PAWN : table.BLACK_PAWN;
		}

		if (piece instanceof Rook) {
			return piece.getPlayer() == Player.WHITE
				? table.WHITE_ROOK : table.BLACK_ROOK;
		}

		if (piece instanceof Knight) {
			return piece.getPlayer() == Player.WHITE
				? table.WHITE_KNIGHT : table.BLACK_KNIGHT;
		}

		if (piece instanceof Bishop) {
			return piece.getPlayer() == Player.WHITE
				? table.WHITE_BISHOP : table.BLACK_BISHOP;
		}

		if (piece instanceof Queen) {
			return piece.getPlayer() == Player.WHITE
				? table.WHITE_QUEEN : table.BLACK_QUEEN;
		}

		if (piece instanceof King) {
			return piece.getPlayer() == Player.WHITE
				? table.WHITE_KING : table.BLACK_KING;
		}

		// TODO: create a custom exception
		throw Error("42");
	}

	private table: T;
}
