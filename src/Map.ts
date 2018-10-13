interface HasID {
    id: string;
}

export class MapID<K extends HasID, V> {
    set(key: K, val: V) {
        this[key.id] = val;
    }
    get(key: K) : V {
        return this[key.id];
    }
}