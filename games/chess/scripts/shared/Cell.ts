import {Piece} from "./Piece"

export class Cell {
	/**
	 * Sets the content of this Cell, which can be
	 * either null or an instance of Piece.
	 * 
	 * @param {Piece|null} piece the new content
	 */
	public setContent(piece: Piece|null): void {
		this.piece = piece;
	}

	/**
	 * Returns the content of this cell, which can
	 * be either null or an instance of Piece.
	 * 
	 * @return {Piece|null} the content of this cell
	 */
	public getContent(): Piece|null {
		return this.piece;
	}

	/**
	 * Only use this instead of getContent() if you
	 * are sure that this cell is not empty.
	 * 
	 * @return {Piece} the piece contained in this cell
	 */
	public getPiece(): Piece {
		return <Piece> this.piece;
	}

	public isOccupied(): boolean {
		return this.piece !== null;
	}

	public clear(): void {
		this.piece = null;
	}

	private piece: Piece|null = null;
}
