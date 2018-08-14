import {AlgebraicNotation} from "./AlgebraicNotation"
import {MoveNotation} from "./MoveNotation"

export namespace Settings {
	export const moveNotation: MoveNotation = new AlgebraicNotation();
	export const moveAnimationDelay: number = 200;
	export const fadeoutAnimationDelay: number = 200;
}
