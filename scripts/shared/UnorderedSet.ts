/**
 * Encapsulates an unordered set of either strings or numbers,
 * which allow O(1) insertion, deletion and search.
 */
export class UnorderedSet<T extends string|number> {
	public insert(value: T): void {
		if (!this.contains(value)) {
			this.count++;
		}
		this.data[<string> value] = true;
		this.type = typeof value;
	}

	public erase(value: T): void {
		if (this.contains(value)) {
			this.count--;
		}
		delete this.data[<string> value];
	}

	public contains(value: T): boolean {
		return !!this.data[<string> value];
	}

	public clear(): void {
		this.data = {};
		this.count = 0;
	}

	public empty(): boolean {
		return this.count == 0;
	}

	public size(): number {
		return this.count;
	}

	public forEach(callback: (v: T) => any): void {
		for (var value in this.data) {
			if (this.data.hasOwnProperty(value)) {
				let val = <T> value;
				if (this.type == "number") {
					val = <T> parseFloat(value);
				}

				if (callback(val) === false) {
					break;
				}
			}
		}
	}

	public asList(): T[] {
		let result: T[] = [];
		this.forEach(function(value: T) {
			result.push(value);
		});
		return result;
	}

	private data: {[value: string]: boolean} = {};
	private count = 0;

	// Used to get runtime type checking
	private type: string;
}
