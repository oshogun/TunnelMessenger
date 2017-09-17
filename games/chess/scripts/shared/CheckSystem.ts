import {Board} from "./Board"
import {BoardController} from "./BoardController"
import {DeltaAssembler} from "./DeltaAssembler"
import {FEN} from "./FEN"
import {King} from "./pieces/King"
import {Observer} from "./ObserverPattern"
import {Piece} from "./Piece"
import {Player, Position} from "./MiscStructures"

import {Pawn} from "./pieces/Pawn"

type IterationCallback = (piece: Piece, position: Position) => boolean|void;

const KEEP_ITERATING = true;
const STOP_ITERATING = false;

export class CheckSystem implements Observer<[Position[], Piece|null]> {
	constructor(board: Board, controller: BoardController) {
		this.board = board;
		this.controller = controller;

		board.addObserver(this);
		this.findAllKings();
	}

	public notify(data: [Position[], Piece|null]): void {
		let [positions, destroyedPiece] = data;

		if (positions.length != 2) {
			// Destruction "moves" can be ignored
			return;
		}

		let [from, to] = positions;

		let board = this.board;

		let movedPiece = board.at(to).getContent();
		if (movedPiece === null) {
			// Shouldn't happen, but just to be safe
			throw Error("A null piece was moved");
		}

		let player = board.getCurrentPlayer();
		if (movedPiece instanceof King) {
			this.kingPositions[player] = to;
		}
	}

	public getKingPosition(player: Player): Position {
		return this.kingPositions[player];
	}

	/**
	 * Checks if a given player is in check.
	 * @param  {Player}  player the player to be tested
	 * @return {boolean} true if the player is in check, false otherwise
	 */
	public verifyCheck(player: Player): boolean {
		let board = this.board;
		let kingPosition = this.kingPositions[player];
		let result: boolean = false;

		this.pieceIteration(function(piece: Piece, position: Position) {
			if (piece.isMoveValid(board, position, kingPosition)) {
				result = true;
				return STOP_ITERATING;
			}

			return KEEP_ITERATING;
		});

		return result;
	}

	/**
	 * Checks if a given player has any valid moves.
	 * Note that there's either a checkmate or a stalemate
	 * if this method returns false for the current player.
	 * @param  {Player}  player the player to be tested
	 * @return {boolean} true if the player has been valid moves, false otherwise
	 */
	public hasValidMoves(player: Player): boolean {
		if (this.checkingValidMoves) {
			// Avoids hasValidMoves() computation inside
			// another hasValidMoves() computation
			return true;
		}

		this.checkingValidMoves = true;

		let board = this.board;

		let notation = new FEN();
		let fen = board.toString(notation);

		let restore = function() {
			board.loadPosition(notation, fen);
		};

		let controller = this.controller;
		let self = this;
		let result: boolean = false;

		this.pieceIteration(function(piece: Piece, position: Position) {
			if (piece.getPlayer() != player) {
				return KEEP_ITERATING;
			}

			let possibleMoves = controller.possibleMovesAt(position);
			for (let target of possibleMoves) {
				let feedback = controller.move(position, target);
				if (feedback.delta.length > 0 && !self.verifyCheck(player)) {
					result = true;
					restore();

					// Restore original king positions
					self.findAllKings();

					return STOP_ITERATING;
				}

				restore();
			}

			return KEEP_ITERATING;
		});

		this.checkingValidMoves = false;

		return result;
	}

	private findAllKings(): void {
		let self = this;
		this.pieceIteration(function(piece: Piece, position: Position) {
			if (piece instanceof King) {
				let player = piece.getPlayer();
				self.kingPositions[player] = position;
			}
		});
	}

	private pieceIteration(callback: IterationCallback): void {
		let board = this.board;
		let size = board.getSize();

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				let cell = board.at(i, j);
				if (cell.isOccupied()) {
					let position: Position = {
						row: i,
						column: j
					};

					if (callback(cell.getPiece(), position) === false) {
						return;
					}
				}
			}
		}
	}

	private board: Board;
	private controller: BoardController;
	private checkingValidMoves: boolean = false;
	private kingPositions: {[player: number]: Position} = {};
}
