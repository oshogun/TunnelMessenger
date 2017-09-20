type Map<T>
	= {[key: string]: T}
	| {[key: number]: T};
type ArbitraryMap = Map<any>;

type MapIteratorCallback<V>
	= ((key: string, value: V) => boolean)
	| ((key: string, value: V) => void);

export namespace utils {
	// Creates a tag with a given name and optionally given properties.
	export function create<T extends keyof HTMLElementTagNameMap, V>(tag: T,
		props?: ArbitraryMap): HTMLElementTagNameMap[T] {

		let result = document.createElement(tag);
		if (props) {
			this.foreach(props, function(key, value) {
				if (key == "click") {
					result.addEventListener("click", value);
				} else {
					result[key] = value;
				}
			});
		}
		return result;
	}

	// Iterates over an object, applying a callback to each property.
	export function foreach<T>(obj: Map<T>, callback: MapIteratorCallback<T>): void {
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				if (callback(i, obj[i]) === false) {
					break;
				}
			}
		}
	}

	export function assertUnreachable(v: never): never {
		throw Error("Runtime type violation");
	}
}
