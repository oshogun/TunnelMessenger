import {Position} from "./MiscStructures"
import {MoveNotation} from "./MoveNotation"

export class AlgebraicNotation implements MoveNotation {
	public toPosition(move: string): Position {
		// TODO: handle non-pawn moves
		return {
			row: 8 - parseInt(move[1]),
			column: "abcdefgh".indexOf(move[0])
		};
	}

	public fromPosition(position: Position): string {
		const files = "abcdefgh";
		return files[position.column] + (8 - position.row);
	}
}
