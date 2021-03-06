import {DB, FirestoreSync, toPlainObject} from "./DB";
import { WriteResult } from "@google-cloud/firestore";

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

export class MapString<V> {
    set(key : string, val : V) {
        this[key] = val;
    }
    get(key : string) {
        return this[key];
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

export class MapWrapper<K extends HasID, V> implements FirestoreSync {
    constructor(public map : MapID<K,V>, public id: string){}
    send() : Promise<WriteResult>{
        return DB.getInstance().collection(MapWrapper.name).doc(this.id).set(toPlainObject(this));
    }
}