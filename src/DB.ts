import { Learner, LearnerModel, UserAction, Problem, Program, Prompt, 
    createLearnerFromDownloaded, TestSession } from "./LearnerModel"
import { LearnerKnowledgeModel, createLearnerKnowledgeModelFromDownloaded } from "./LearnerKnowledgeModel";
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Firestore, WriteResult } from "@google-cloud/firestore";
import { MapString, MapID, SetID } from "./Map";

export interface FirestoreSync {
    send() : Promise<void | WriteResult>;
}

interface LearnerModelRef {
    learner : string;
    knowledgeModel : string;
    // IDs of the learner and LKM
}

export module DB {
    var serviceAccount = require("../priv/firestore-private-key.json");
    var db : Firestore;
    var inited : boolean = false;
    export function getInstance(): Firestore {
        return db;
    }

    export function init() {
        if (inited) return;
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://plasses-d4707.firebaseio.com"
        });
        db = admin.firestore();
        db.settings({timestampsInSnapshots: true});
        inited = true;
    }

    /** Currently, LearnerModel is indexed by learner ID*/
    export async function getLearnerModel(learnerID: string) : Promise<LearnerModel> {
        var lmRef : LearnerModelRef = await db.collection('LearnerModel').doc(learnerID).get().then((doc) => {
            return doc.data() as LearnerModelRef;
        });
        var learner : Learner = await getLearner(lmRef.learner);
        var knowledgeModel : LearnerKnowledgeModel = await getLearnerKnowledgeModel(lmRef.knowledgeModel);
        return new LearnerModel(learner, knowledgeModel);
    }

    export async function getLearner(id : string) : Promise<Learner> {
        return getTemplate<Learner>(id, "Learner").then(downloaded => 
            createLearnerFromDownloaded(downloaded)
        );
    }
    /** This one returns an actual LKM class with methods, unlike other DB.get* */
    export async function getLearnerKnowledgeModel(id : string) : Promise<LearnerKnowledgeModel> {
        return getTemplate<LearnerKnowledgeModel>(id, LearnerKnowledgeModel.name).then(downloaded => 
            createLearnerKnowledgeModelFromDownloaded(downloaded)
        );
    }
    export async function getTestSession(id : string) : Promise<TestSession> {
        return getTemplate<TestSession>(id, TestSession.name);
    }
    export async function getProblem(id : string) : Promise<Problem> {
        return getTemplate<Problem>(id, Problem.name);
    }
    export async function getProgram(id : string) : Promise<Program> {
        return getTemplate<Program>(id, Program.name);
    }
    export async function getPrompt(id : string) : Promise<Prompt> {
        return getTemplate<Prompt>(id, Prompt.name);
    }
    async function getTemplate<V extends Object>(id : string, vname : string) : Promise<V> {
        return db.collection(vname).doc(id).get().then(snap => {
            let val = snap.data();
            val.id = snap.id;
            return val as V;
        })
    }
}

// This does not work because Firestore set() does not support objects created with `new` at all
/* 
export function toPlainObjectFromMap(m : MapID<any, any> | MapString<any>) {
    delete m.get;
    delete m.set;
    return m;
}
*/
export function toPlainObject(o : Object): Object {
    return JSON.parse(JSON.stringify(o));
}
// This works, but at this point, it's so complicated that the JSON serialization is simpler
/* export function toPlainObject(o : Object): Object {
    if (o === null) return null;
    if (typeof o != "object") return o;
    if (o instanceof Array) return o.map(toPlainObject);
    var res = {};
    for (var prop in o) {
        res[prop] = (typeof o[prop] == "object") ? toPlainObject(o[prop]) : o[prop];
    }
    return res;
} */