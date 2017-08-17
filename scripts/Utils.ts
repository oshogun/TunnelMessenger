export namespace utils {
	// Creates a tag with a given name and optionally given properties.
	export function create(tag: string, props?: Object): Element {
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
	export function foreach(obj: Object, callback): void {
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				if (callback(i, obj[i]) === false) {
					break;
				}
			}
		}
	}
}
