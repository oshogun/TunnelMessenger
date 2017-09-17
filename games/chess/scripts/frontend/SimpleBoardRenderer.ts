/// <reference path="../../node_modules/@types/es6-promise/index.d.ts" />

import {Board} from "../shared/Board"
import {BoardController, MoveFeedback} from "../shared/BoardController"
import {BoardRenderer} from "./BoardRenderer"
import {Cell} from "../shared/Cell"
import {Piece} from "../shared/Piece"
import {PieceFactory} from "../shared/PieceFactory"
import {PieceImageTranslationTable} from "./PieceImageTranslationTable"
import {Position} from "../shared/MiscStructures"
import {Settings} from "../shared/Settings"
import {utils} from "../shared/Utils"

import {Network} from "../Network"

export class SimpleBoardRenderer implements BoardRenderer {
	constructor(controller: BoardController, parent: HTMLElement,
		network: Network) {

		this.parent = parent;
		this.controller = controller;
		this.network = network;
	}

	public render(board: Board): void {
		let size = board.getSize();

		let table = document.createElement("div");
		table.classList.add("table");
		this.cells = [];

		for (let i = 0; i < size; i++) {
			let row = document.createElement("div");
			row.classList.add("row");
			this.cells.push([]);

			for (let j = 0; j < size; j++) {
				let cell = document.createElement("div");
				cell.classList.add("cell");
				this.cells[i].push(cell);

				let parity = (i + j) % 2;
				cell.classList.add((parity == 0) ? "even" : "odd");

				cell.innerHTML = this.printableCell(board.at(i, j));
				this.bindEventsToCell(cell, i, j);

				row.appendChild(cell);
			}

			table.appendChild(row);
		}

		this.parent.appendChild(table);
	}

	public receiveMove(from: Position, to: Position): void {
		this.processMove(from, to);
		this.locked = false;
	}

	private processMove(from: Position, to: Position): void {
		let moveFeedback = this.controller.move(from, to);
		this.update(moveFeedback);
	}

	private play(from: Position, to: Position): void {
		let moveFeedback = this.controller.move(from, to);
		if (moveFeedback.delta.length > 0) {
			this.update(moveFeedback);
			this.network.send([from, to]);
			this.locked = true;
		}
	}

	private update(moveFeedback: MoveFeedback): void {
		if (moveFeedback.delta.length > 0) {
			this.updateMoves(moveFeedback);

			$(".cell", this.parent).removeClass("checked_king");

			let kingPositions = moveFeedback.attackedKingPosition;
			if (kingPositions !== undefined) {
				for (let king of kingPositions) {
					let kingCell = this.cells[king.row][king.column];
					if (!moveFeedback.hasValidMoves) {
						kingCell.classList.add("checkmated_king");
					} else if (moveFeedback.isCheck) {
						kingCell.classList.add("checked_king");
					}
				}
			}
		}
	}

	private updateMoves(moveFeedback: MoveFeedback): void {
		let self = this;

		for (let move of moveFeedback.delta) {
			let fromCell = this.cells[move.from.row][move.from.column];
			let toCell = this.cells[move.to.row][move.to.column];

			if (toCell.children.length > 0) {
				this.destroyTargetPiece(toCell);
			}

			// Moves the origin piece to its target if this move
			// is not a spontaneous destruction (which occurs when
			// en passant happens)
			if (!utils.isSamePosition(move.from, move.to)) {
				this.moveOriginPiece(fromCell, toCell).then(function() {
					if (moveFeedback.promotion) {
						let promotedPiece = moveFeedback.promotion;
						toCell.innerHTML = self.printablePiece(promotedPiece);
					}
				});
			}
		}
	}

	private destroyTargetPiece(cell: HTMLElement): void {
		let positionOffset = $(cell).offset();
		let previousPiece = cell.children[0];
		let fadeoutDuration = Settings.fadeoutAnimationDelay;
		$(previousPiece)
			.css("position", "absolute")
			.css("left", positionOffset.left)
			.css("top", positionOffset.top)
			.appendTo("body")
			.fadeOut(fadeoutDuration, function() {
				$(this).remove();
			});
	}

	private moveOriginPiece(from: HTMLElement, to: HTMLElement): Promise<void> {
		let fromOffset = $(from).offset();
		let toOffset = $(to).offset();
		let moveDuration = Settings.moveAnimationDelay;
		return new Promise<void>(function(resolve, reject) {
			$(from.children[0])
				.css("position", "absolute")
				.css("left", fromOffset.left)
				.css("top", fromOffset.top)
				.appendTo("body")
				.animate(toOffset, moveDuration, function() {
					$(this)
						.appendTo(to)
						.css("position", "")
						.css("left", "")
						.css("top", "");

					resolve();
				});
		});
	}

	private bindEventsToCell(cell: HTMLElement, row: number, column: number) {
		let position: Position = {
			row: row,
			column: column
		};

		let self = this;
		cell.addEventListener("click", function() {
			if (self.locked) {
				return;
			}

			self.clearPossibleMoveHighlight();

			let moveOrigin = self.moveOrigin;
			if (moveOrigin !== null) {
				self.cells[moveOrigin.row][moveOrigin.column].classList.remove("selected");

				for (let move of self.possibleMoves) {
					if (position.row == move.row && position.column == move.column) {
						self.play(moveOrigin, position);

						moveOrigin = null;
						self.possibleMoves = [];
						return;
					}
				}
			}

			let possibleMoves = self.controller.possibleMovesAt(position);
			self.addPossibleMoveHighlight(possibleMoves);

			if (possibleMoves.length > 0) {
				this.classList.add("selected");
			}

			self.moveOrigin = position;
			self.possibleMoves = possibleMoves;
		});
	}

	private addPossibleMoveHighlight(moves: Position[]): void {
		for (let move of moves) {
			let cell = this.cells[move.row][move.column];
			cell.classList.add("possible_move");
		}
	}

	private clearPossibleMoveHighlight(): void {
		for (let row of this.cells) {
			for (let cell of row) {
				cell.classList.remove("possible_move");
			}
		}
	}

	private printableCell(cell: Cell): string {
		if (!cell.isOccupied()) {
			return "";
		}

		return this.printablePiece(cell.getPiece());
	}

	private printablePiece(piece: Piece): string {
		let factory = new PieceFactory(new PieceImageTranslationTable());
		let url = factory.toString(piece);
		return "<img src='images/" + url + "'>";
	}

	private parent: HTMLElement;
	private controller: BoardController;
	private cells: HTMLElement[][];

	private moveOrigin: Position|null = null;
	private possibleMoves: Position[] = [];

	private network: Network;
	private locked: boolean = false;
}
