interface HasID {
    id: string;
}

export class MapID<K extends HasID, V> {
    // buildFrom(data: Object) {
    //     Object.assign(this, data);
    // }
    set(key: K, val: V) {
        this[key.id] = val;
    }
    get(key: K) : V {
        return this[key.id];
    }
}

export class SetID<K extends HasID> {
    add(entry: K) {
        this[entry.id] = entry;
    }
    remove(entry: K) {
        this[entry.id] = {};
    }
}