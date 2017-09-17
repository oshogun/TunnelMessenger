import {Board} from "./Board"
import {BoardNotation} from "./BoardNotation"
import {BoardDelta, MoveDelta, DeltaAssembler} from "./DeltaAssembler"
import {CheckSystem} from "./CheckSystem"
import {Player, Position} from "./MiscStructures"
import {Piece} from "./Piece"
import {Queen} from "./pieces/Queen"
import {SpecialMove} from "./SpecialMove"

export interface MoveFeedback {
	delta: BoardDelta;
	isCheck: boolean;
	hasValidMoves: boolean;
	attackedKingPosition?: Position[];
	promotion?: Piece;
}

const EMPTY_FEEDBACK: MoveFeedback = {
	delta: [],
	isCheck: false,
	hasValidMoves: true
};

export class BoardController {
	constructor(board: Board, specialMoves: SpecialMove[]) {
		this.board = board;
		this.deltaAssembler = new DeltaAssembler();
		this.specialMoves = specialMoves;
		this.checkSystem = new CheckSystem(board, this);

		board.addObserver(this.deltaAssembler);
	}

	public possibleMovesAt(position: Position): Position[] {
		let board = this.board;
		board.assertValidPosition(position);

		let cell = board.at(position);

		if (!cell.isOccupied()) {
			return [];
		}

		let piece = cell.getPiece();
		if (piece.getPlayer() != board.getCurrentPlayer()) {
			return [];
		}

		let result: Position[] = [];
		let size = board.getSize();

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				let target: Position = {
					row: i,
					column: j
				};

				let isValid: boolean = false;
				isValid = isValid || piece.isMoveValid(board, position, target);

				for (let specialMove of this.specialMoves) {
					isValid = isValid ||
						specialMove.isMoveValid(board, position, target);
				}

				if (isValid) {
					result.push(target);
				}
			}
		}

		return result;
	}

	public move(from: Position, to: Position): MoveFeedback {
		let board = this.board;
		board.assertValidPosition(from);
		board.assertValidPosition(to);

		let cell = board.at(from);

		if (!cell.isOccupied()) {
			return EMPTY_FEEDBACK;
		}

		let piece = cell.getPiece();
		if (piece.getPlayer() != board.getCurrentPlayer()) {
			return EMPTY_FEEDBACK;
		}

		this.deltaAssembler.reset();
		let castlingRights = board.getCastlingRights();
		let enPassantSquare = board.getEnPassantSquare();
		let halfMoveClock = board.getHalfMoveClock();

		let promotedPiece: Piece|null = null;

		if (piece.isMoveValid(board, from, to)) {
			// standard move: just move the piece
			if (board.at(to).isOccupied()) {
				board.setHalfMoveClock(0);
			}

			board.setEnPassantSquare(null);

			let promotion = piece.onMove(board, from, to);
			board.move(from, to);

			if (promotion) {
				// TODO: ask the user which piece he wants to promote to
				let newPiece = new Queen();
				newPiece.setPlayer(piece.getPlayer());
				board.setCellContent(to, newPiece);
				promotedPiece = newPiece;
			}
		} else {
			// try to find a valid special move
			let found: boolean = false;
			for (let specialMove of this.specialMoves) {
				if (specialMove.isMoveValid(board, from, to)) {
					board.setEnPassantSquare(null);
					specialMove.execute(board, from, to);
					found = true;
					break;
				}
			}

			if (!found) {
				return EMPTY_FEEDBACK;
			}
		}

		let checkSystem = this.checkSystem;

		if (checkSystem.verifyCheck(board.getCurrentPlayer())) {
			// Illegal move, rollback
			this.rollback();
			board.setCastlingRights(castlingRights);
			board.setEnPassantSquare(enPassantSquare);
			board.setHalfMoveClock(halfMoveClock);
			return EMPTY_FEEDBACK;
		}

		this.processMove();

		// Note that board.getCurrentPlayer() now returns
		// a different player than before since processMove()
		// updates the current player.
		let currentPlayer = board.getCurrentPlayer();

		let feedback: MoveFeedback = {
			delta: this.deltaAssembler.getDelta(),
			isCheck: checkSystem.verifyCheck(currentPlayer),
			hasValidMoves: checkSystem.hasValidMoves(currentPlayer)
		};

		if (promotedPiece !== null) {
			feedback.promotion = promotedPiece;
		}

		if (feedback.isCheck) {
			let kingPosition = checkSystem.getKingPosition(currentPlayer);
			feedback.attackedKingPosition = [kingPosition];
		} else if (!feedback.hasValidMoves) {
			feedback.attackedKingPosition = [
				checkSystem.getKingPosition(Player.WHITE),
				checkSystem.getKingPosition(Player.BLACK)
			];
		}

		return feedback;
	}

	public toString(notation: BoardNotation): string {
		return this.board.toString(notation);
	}

	/**
	 * Updates the current player and the full move count
	 * of the board.
	 */
	private processMove(): void {
		let board = this.board;
		let currentPlayer = board.getCurrentPlayer();
		let newPlayer: Player;

		if (currentPlayer == Player.WHITE) {
			newPlayer = Player.BLACK;
		} else {
			newPlayer = Player.WHITE;

			let fullMoveCount = board.getFullMoveCount();
			board.setFullMoveCount(fullMoveCount + 1);
		}

		board.setCurrentPlayer(newPlayer);
	}

	private rollback(): void {
		let board = this.board;
		let delta = this.deltaAssembler.getDelta();
		this.deltaAssembler.reset();

		for (let move of delta) {
			board.move(move.to, move.from);
			board.setCellContent(move.to, move.destroyedPiece);
		}
	}

	private board: Board;
	private deltaAssembler: DeltaAssembler;
	private specialMoves: SpecialMove[];
	private checkSystem: CheckSystem;
}
