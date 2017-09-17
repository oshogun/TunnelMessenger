import {BoardNotation} from "./BoardNotation"
import {Cell} from "./Cell"
import {Observable} from "./ObserverPattern"
import {Player, CastlingRights, Position} from "./MiscStructures"
import {Piece} from "./Piece"

export class Board extends Observable<[Position[], Piece|null]> {
	constructor(size: number = 8) {
		super();
		this.size = size;

		for (let i = 0; i < size * size; i++) {
			this.matrix.push(new Cell());
		}
	}

	public setCellContent(position: Position, piece: Piece|null): void {
		this.assertValidPosition(position);
		this.at(position).setContent(piece);
	}

	public move(from: Position, to: Position): void {
		this.assertValidPosition(from);
		this.assertValidPosition(to);

		let fromCell = this.at(from);
		let toCell = this.at(to);

		let piece = fromCell.getContent();
		let targetPiece = toCell.getPiece();

		fromCell.setContent(null);
		toCell.setContent(piece);

		this.notifyObservers([[from, to], targetPiece]);
	}

	public destroy(position: Position): void {
		let piece = this.at(position).getContent();
		this.setCellContent(position, null);
		this.notifyObservers([[position], piece]);
	}

	public loadPosition(notation: BoardNotation, position: string): void {
		this.clear();
		notation.loadBoard(this, position);
	}

	public toString(notation: BoardNotation): string {
		return notation.toString(this);
	}

	public clear(): void {
		for (let cell of this.matrix) {
			cell.clear();
		}
	}

	public getSize(): number {
		return this.size;
	}

	public setCurrentPlayer(player: Player): void {
		this.currentPlayer = player;
	}

	public getCurrentPlayer(): Player {
		return this.currentPlayer;
	}

	public setCastlingRights(rights: CastlingRights): void {
		this.castlingRights = rights;
	}

	public getCastlingRights(): CastlingRights {
		return this.castlingRights;
	}

	public setEnPassantSquare(position: Position|null): void {
		this.enPassantSquare = position;
	}

	public getEnPassantSquare(): Position|null {
		return this.enPassantSquare;
	}

	public setHalfMoveClock(value: number): void {
		this.halfMoveClock = value;
	}

	public getHalfMoveClock(): number {
		return this.halfMoveClock;
	}

	public setFullMoveCount(value: number): void {
		this.fullMoveCount = value;
	}

	public getFullMoveCount(): number {
		return this.fullMoveCount;
	}

	public at(position: Position): Cell;
	public at(row: number, column: number): Cell;

	public at(first, second?): Cell {
		if (typeof first != "number") {
			second = first.column;
			first = first.row;
		}

		this.assertValidPosition(first, second);

		let index = first * this.size + second;
		return this.matrix[index];
	}

	public isValidPosition(position: Position): boolean;
	public isValidPosition(row: number, column: number): boolean;

	public isValidPosition(row, column?): boolean {
		if (typeof row != "number") {
			column = row.column;
			row = row.row;
		}

		return (row >= 0 && row < this.size && column >= 0 && column < this.size);
	}

	public assertValidPosition(position: Position): void;
	public assertValidPosition(row: number, column: number): void;

	public assertValidPosition(row, column?): void {
		if (typeof row != "number") {
			column = row.column;
			row = row.row;
		}

		if (!this.isValidPosition(row, column)) {
			throw Error("Invalid position (row " + row + ", column " + column + ")");
		}
	}

	private matrix: Cell[] = [];
	private size: number;
	private currentPlayer: Player;
	private castlingRights: CastlingRights;
	private enPassantSquare: Position|null;
	private halfMoveClock: number;
	private fullMoveCount: number;
}
