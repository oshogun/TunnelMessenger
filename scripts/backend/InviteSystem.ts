import {SocketId} from "./Settings"

type Callback = (id: string, from: SocketId, to: SocketId) => void;

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
			let invite = this.invites[id];
			invite.onAccept(id, invite.from, invite.to);
			delete this.invites[id];
		}
	}

	public reject(id: string): void {
		if (this.invites.hasOwnProperty(id)) {
			let invite = this.invites[id];
			invite.onReject(id, invite.from, invite.to);
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
