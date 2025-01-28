import { atom } from "jotai";

export class AtomMap<K, V> {
	private map = new Map<K, ReturnType<typeof atom<V>>>();

	constructor(private getDefaultValue: (key: K) => V) {}

	get ids() {
		return Array.from(this.map.keys());
	}

	delete(key: K) {
		this.map.delete(key);
	}

	get(key: K, defaultValue?: V): ReturnType<typeof atom<V>> {
		let value = this.map.get(key);
		if (!value) {
			value = atom<V>(defaultValue ?? this.getDefaultValue(key));
			this.map.set(key, value);
		}
		return value;
	}
}
