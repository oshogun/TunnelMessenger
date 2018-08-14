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
		for (let i in obj) {
			if (obj.hasOwnProperty(i)) {
				if (callback(i, obj[i]) === false) {
					break;
				}
			}
		}
	}

	// Iterates over an object in a sorted way (by keys),
	// applying a callback to each property.
	export function sortedForeach<T>(obj: Map<T>,
		callback: MapIteratorCallback<T>): void {

		let keys = Object.keys(obj);
		keys.sort();

		for (let key of keys) {
			if (obj.hasOwnProperty(key)) {
				if (callback(key, obj[key]) === false) {
					break;
				}
			}
		}
	}

	// Extends a given object with a given set of properties
	export function extend<T, M1 extends Map<T>, M2 extends Map<T>>
		(obj: M1, props: M2): M1 & M2 {

		foreach(props, function(key, value) {
			obj[key] = value;
		});

		return <M1 & M2> obj;
	}

	export function assertUnreachable(v: never): never {
		throw Error("Runtime type violation");
	}
}
