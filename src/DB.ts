import { Learner, LearnerModel, UserAction, Problem, Program, Prompt } from "./LearnerModel"
import { LearnerKnowledgeModel } from "./LearnerKnowledgeModel";
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Firestore, WriteResult } from "@google-cloud/firestore";
import { MapString, MapID, SetID } from "./Map";

export interface FirestoreSync {
    send() : Promise<WriteResult>;
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

    export async function getLearnerModel(id: string) : Promise<LearnerModel> {
        var lmRef : LearnerModelRef = await db.collection('LearnerModel').doc(id).get().then((doc) => {
            return doc.data() as LearnerModelRef;
        });
        var learner : Learner = await getLearner(lmRef.learner);
        var knowledgeModel : LearnerKnowledgeModel = await getLearnerKnowledgeModel(lmRef.knowledgeModel);
        return new LearnerModel(learner, knowledgeModel);
    }

    export async function getLearner(id : string) : Promise<Learner> {
        return getTemplate<Learner>(id, "Learner");
    }
    export async function getLearnerKnowledgeModel(id : string) : Promise<LearnerKnowledgeModel> {
        return getTemplate<LearnerKnowledgeModel>(id, LearnerKnowledgeModel.name);
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
            return snap.data() as V;
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