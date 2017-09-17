import {PieceTranslationTable} from "../shared/PieceTranslationTable"

export class PieceImageTranslationTable implements PieceTranslationTable {
	readonly WHITE_PAWN = "wp.png";
	readonly WHITE_ROOK = "wr.png";
	readonly WHITE_KNIGHT = "wn.png";
	readonly WHITE_BISHOP = "wb.png";
	readonly WHITE_QUEEN = "wq.png";
	readonly WHITE_KING = "wk.png";

	readonly BLACK_PAWN = "bp.png";
	readonly BLACK_ROOK = "br.png";
	readonly BLACK_KNIGHT = "bn.png";
	readonly BLACK_BISHOP = "bb.png";
	readonly BLACK_QUEEN = "bq.png";
	readonly BLACK_KING = "bk.png";
}
