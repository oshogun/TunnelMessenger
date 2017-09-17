import {SocketId} from "./Settings"

type Callback = () => void;

export class InviteSystem {
	public register(id: string, from: SocketId, to: SocketId,
		onAccept: Callback, onReject: Callback): void {

		this.invites[id] = {
			from: from,
			to: to,
			onAccept: onAccept,
			onReject: onReject
		};
	}

	public accept(id: string): void {
		if (this.invites.hasOwnProperty(id)) {
			this.invites[id].onAccept();
			delete this.invites[id];
		}
	}

	public reject(id: string): void {
		if (this.invites.hasOwnProperty(id)) {
			this.invites[id].onReject();
			delete this.invites[id];
		}
	}

	private invites: {
		[id: string]: {
			from: SocketId,
			to: SocketId,
			onAccept: Callback,
			onReject: Callback
		}
	} = {};
}
