export interface GameInfo {
	dimensions: [number, number],
	minPlayers: number,
	maxPlayers: number
}

type GameInfoTable = {[gameName: string]: GameInfo};

export const gameInfoTable: GameInfoTable = {
	"chess": {
		dimensions: [730, 738],
		minPlayers: 2,
		maxPlayers: 2
	}
}
