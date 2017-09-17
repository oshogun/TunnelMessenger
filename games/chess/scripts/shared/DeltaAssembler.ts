import {Piece} from "./Piece"
import {Position} from "./MiscStructures"
import {Observer} from "./ObserverPattern"

export interface MoveDelta {
	from: Position,
	to: Position,
	destroyedPiece: Piece|null
};

export type BoardDelta = MoveDelta[];

export class DeltaAssembler implements Observer<[Position[], Piece|null]> {
	public notify(data: [Position[], Piece|null]): void {
		let positions = data[0];

		this.moves.push({
			from: positions[0],
			to: positions.length == 2 ? positions[1] : positions[0],
			destroyedPiece: data[1]
		});
	}

	public reset(): void {
		this.moves = [];
	}

	public getDelta(): BoardDelta {
		return this.moves;
	}

	private moves: BoardDelta = [];
}
