
export interface Observer<T> {
	notify(data: T): void;
}

export class Observable<T> {
	public addObserver(observer: Observer<T>): void {
		this.observers.push(observer);
	}

	protected notifyObservers(data: T): void {
		for (let observer of this.observers) {
			observer.notify(data);
		}
	}

	private observers: Observer<T>[] = [];
}
