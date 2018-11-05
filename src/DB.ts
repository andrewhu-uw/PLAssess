import { Learner, LearnerKnowledgeModel, LearnerModel, UserAction } from "./LearnerModel"
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Firestore, DocumentSnapshot } from "@google-cloud/firestore";

interface LearnerModelRef {
    learner : string;
    knowledgeModel : string;
    // IDs of the learner and LKM
}

export module DB {
    var serviceAccount = require("../priv/firestore-private-key.json");
    var db : Firestore;
    export function getInstance(): Firestore {
        return db;
    }

    export function init() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://plasses-d4707.firebaseio.com"
        });
        db = admin.firestore();
        db.settings({timestampesInSnapshots: true});
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
        return db.collection('Learner').doc(id).get().then((snap) => {
            return snap.data() as Learner;
        });
    }

    export async function getLearnerKnowledgeModel(id : string) : Promise<LearnerKnowledgeModel> {
        return db.collection('LeanerKnowledgeModel').doc(id).get().then((snap) => {
            return snap.data() as LearnerKnowledgeModel;
        });
    }
}

export function toPlainObject(o : Object): Object {
    return JSON.parse(JSON.stringify(o));
}