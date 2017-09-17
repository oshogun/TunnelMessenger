import {Board} from "../shared/Board"

export interface BoardRenderer {
	render(board: Board, parent: HTMLElement): void;
}
