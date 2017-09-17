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

	private constructor() {}

	public setProxy(proxy: Proxy): void {
		this.proxy = proxy;
	}

	public send(data: any): void {
		if (this.proxy !== null) {
			this.proxy.send(data);
		}
	}

	public receive(data: any): void {
		this.receiveHandler(data);
	}

	public onReceive(callback: Callback): void {
		this.receiveHandler = callback;
	}

	private static instance: Network|null = null;
	private receiveHandler: Callback;
	private proxy: Proxy|null = null;
}
