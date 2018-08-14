type Callback = (data: any) => void;
type Proxy = {
	send: Callback;
};

export class Network {
	public static getInstance(): Network {
		if (this.instance === null) {
			this.instance = new Network();
		}

		return this.instance;
	}

	private constructor() {
		// Enables the server to access this instance
		window["network"] = this;
	}

	public send(data: any): void {
		if (this.proxy !== null) {
			this.proxy.send(data);
		}
	}

	public onReceive(callback: Callback): void {
		this.receiveHandler = callback;
	}

	public isSpectating(): boolean {
		return this.spectating;
	}

	public receive(data: any): void {
		this.receiveHandler(data);
	}

	public setProxy(proxy: Proxy): void {
		this.proxy = proxy;
	}

	public setSpectating(flag: boolean): void {
		this.spectating = flag;
	}

	private static instance: Network|null = null;
	private proxy: Proxy|null = null;
	private receiveHandler: Callback;
	private spectating: boolean = false;
}
