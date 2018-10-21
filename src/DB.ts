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
    export function getLearnerModel(id: string) : LearnerModel {
        var lmRef = null;
        db.collection('LearnerModel').doc(id).get().then((doc) => {
            lmRef = doc.data();
        });
        var learner : Learner;
        var knowledgeModel : LearnerKnowledgeModel;
        db.collection('Learner').doc(lmRef.learner).get().then((doc) => {
            learner = doc.data() as Learner;
        });
        db.collection('LearnerKnowledgeModel').doc(lmRef.knowledgeModel).get().then((doc) => {
            knowledgeModel = doc.data() as LearnerKnowledgeModel;
        });
        return new LearnerModel(learner, knowledgeModel);
    }
}

export function toPlainObject(o : Object): Object {
    return JSON.parse(JSON.stringify(o));
}