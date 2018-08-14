export enum Player {
	WHITE, BLACK
}

export type CastlingRights = number;

export enum CastlingType {
	NONE = 0,
	WHITE_KINGSIDE = 1,
	WHITE_QUEENSIDE = 2,
	BLACK_KINGSIDE = 4,
	BLACK_QUEENSIDE = 8
}

export namespace Ranks {
	// Note that ranks go from 0 to 7.
	export const FIRST_RANK = 7;
	export const SECOND_RANK = 6;
	export const SEVENTH_RANK = 1;
	export const EIGHTH_RANK = 0;
}

export interface Position {
	row: number;
	column: number;
}
