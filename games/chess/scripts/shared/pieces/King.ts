import {Board} from "../Board"
import {CastlingRights, CastlingType, Player, Position} from "../MiscStructures"
import {Piece} from "../Piece"
import {utils} from "../Utils"

export class King implements Piece {
	public isMoveValid(board: Board, from: Position, to: Position): boolean {
		let variation = utils.getVariation(from, to);
		let deltaRows = Math.abs(variation.deltaRows);
		let deltaColumns = Math.abs(variation.deltaColumns);

		if (deltaRows <= 1 && deltaColumns <= 1) {
			return utils.notAlly(board, from, to);
		}

		return false;
	}

	public onMove(board: Board, from: Position, to: Position): boolean {
		let forbidden: CastlingRights;
		if (this.getPlayer() == Player.WHITE) {
			forbidden = CastlingType.WHITE_KINGSIDE | CastlingType.WHITE_QUEENSIDE;
		} else {
			forbidden = CastlingType.BLACK_KINGSIDE | CastlingType.BLACK_QUEENSIDE;
		}

		let castlingRights = board.getCastlingRights();
		castlingRights &= ~forbidden;
		board.setCastlingRights(castlingRights);

		return false;
	}

	public setPlayer(player: Player): void {
		this.player = player;
	}

	public getPlayer(): Player {
		return this.player;
	}

	private player: Player;
}
