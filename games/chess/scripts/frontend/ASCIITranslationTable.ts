import {PieceTranslationTable} from "../shared/PieceTranslationTable"

export class ASCIITranslationTable implements PieceTranslationTable {
	readonly WHITE_PAWN = "&#9817;";
	readonly WHITE_ROOK = "&#9814;";
	readonly WHITE_KNIGHT = "&#9816;";
	readonly WHITE_BISHOP = "&#9815;";
	readonly WHITE_QUEEN = "&#9813;";
	readonly WHITE_KING = "&#9812;";

	readonly BLACK_PAWN = "&#9823;";
	readonly BLACK_ROOK = "&#9820;";
	readonly BLACK_KNIGHT = "&#9822;";
	readonly BLACK_BISHOP = "&#9821;";
	readonly BLACK_QUEEN = "&#9819;";
	readonly BLACK_KING = "&#9818;";
}
