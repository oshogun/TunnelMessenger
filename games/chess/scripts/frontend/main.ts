/// <reference path="../defs/jQuery.d.ts" />

import {Board} from "../shared/Board"
import {BoardController} from "../shared/BoardController"
import {Castling} from "../shared/Castling"
import {FEN} from "../shared/FEN"
import {SimpleBoardRenderer} from "./SimpleBoardRenderer"
import {SpecialMove} from "../shared/SpecialMove"

import {Network} from "../Network"

$(document).ready(function() {
	let fen = new FEN();
	let board = new Board();
	board.loadPosition(fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

	window["fen"] = function() {
		return board.toString(fen);
	}

	let container = document.getElementById("container");
	if (container === null) {
		throw Error("42");
	}

	let specialMovesAllowed: SpecialMove[] = [
		new Castling()
	];

	let network = Network.getInstance();

	let controller = new BoardController(board, specialMovesAllowed);
	let renderer = new SimpleBoardRenderer(controller, container, network);
	renderer.render(board);

	network.onReceive(function(data: any) {
		renderer.receiveMove(data[0], data[1]);
	});
});
