import { Learner, LearnerKnowledgeModel, LearnerModel, UserAction } from "./LearnerModel"
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Firestore } from "@google-cloud/firestore";

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
        var lmRef = null;
        await db.collection('LearnerModel').doc(id).get().then((doc) => {
            lmRef = doc.data();
        });
        var learner : Learner;
        var knowledgeModel : LearnerKnowledgeModel;
        await db.collection('Learner').doc(lmRef.learner).get().then((doc) => {
            learner = doc.data() as Learner;
        });
        await db.collection('LearnerKnowledgeModel').doc(lmRef.knowledgeModel).get().then((doc) => {
            knowledgeModel = doc.data() as LearnerKnowledgeModel;
        });
        return new LearnerModel(learner, knowledgeModel);
    }

    export async function getLearner(id : string) : Promise<Learner> {
        return db.collection('Learner').doc(id).get().then((docRef) => {
            return docRef.data() as Learner;
        });
    }
}

export function toPlainObject(o : Object): Object {
    return JSON.parse(JSON.stringify(o));
}