import {Board} from "../Board"
import {Player, Position} from "../MiscStructures"
import {Piece} from "../Piece"
import {utils} from "../Utils"

export class Knight implements Piece {
	public isMoveValid(board: Board, from: Position, to: Position): boolean {
		let variation = utils.getVariation(from, to);
		let deltaRows = Math.abs(variation.deltaRows);
		let deltaColumns = Math.abs(variation.deltaColumns);

		if (deltaRows != 0 && deltaColumns != 0) {
			if (deltaRows + deltaColumns == 3) {
				return utils.notAlly(board, from, to);
			}
		}

		return false;
	}

	public onMove(board: Board, from: Position, to: Position): boolean {
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
