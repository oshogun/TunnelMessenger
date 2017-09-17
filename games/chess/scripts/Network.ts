type Callback = (data: any) => void;

export class Network {
	public static getInstance(): Network {
		if (this.instance === null) {
			this.instance = new Network();
		}

		return this.instance;
	}

	private constructor() {}

	public setProxy(proxy: any): void {
		this.proxy = proxy;
	}

	public send(data: any): void {
		this.proxy.send(data);
	}

	public onReceive(callback: Callback): void {
		this.receiveHandler = callback;
	}

	private static instance: Network|null = null;
	private receiveHandler: Callback;
	private proxy: any;
}
