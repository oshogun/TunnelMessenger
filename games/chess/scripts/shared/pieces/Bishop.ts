import {Board} from "../Board"
import {Player, Position} from "../MiscStructures"
import {Piece} from "../Piece"
import {utils} from "../Utils"

export class Bishop implements Piece {
	public isMoveValid(board: Board, from: Position, to: Position): boolean {
		if (utils.isDiagonalMove(from, to)) {
			return utils.tryLinearMove(board, from, to);
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
