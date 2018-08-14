import {PieceTranslationTable} from "./PieceTranslationTable"

export class FENTranslationTable implements PieceTranslationTable {
	readonly WHITE_PAWN = "P";
	readonly WHITE_ROOK = "R";
	readonly WHITE_KNIGHT = "N";
	readonly WHITE_BISHOP = "B";
	readonly WHITE_QUEEN = "Q";
	readonly WHITE_KING = "K";
	readonly BLACK_PAWN = "p";
	readonly BLACK_ROOK = "r";
	readonly BLACK_KNIGHT = "n";
	readonly BLACK_BISHOP = "b";
	readonly BLACK_QUEEN = "q";
	readonly BLACK_KING = "k";
}
