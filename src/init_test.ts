import { Learner, LearnerKnowledgeModel, LearnerModel } from "./LearnerModel"
import {expect} from "chai";
import "mocha";
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

var serviceAccount = require("../priv/firestore-private-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://plasses-d4707.firebaseio.com"
});

var db = admin.firestore();

function toPlainObject(o : Object): Object {
    return JSON.parse(JSON.stringify(o));
}

export function initDB() {
    // Create example data
    var learner = new Learner(5, true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000), 5);
    var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

    // Sync to Firebase
    db.collection('LearnerModel').doc('AHu').set(
        toPlainObject(lm)
        //{learner:{firstName:"A",lastName:"Hu"}}
    )
    console.log(toPlainObject(lm));
}

export function loadDB() {
    // Load example data from Firebase
    db.collection('LearnerModel').doc('AHu').get().then((lm) => {
        var learner = new Learner(5, true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000), 5);
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel());

        console.log(JSON.stringify(lm.data()));
        expect(lm.data()).to.deep.equal(handMadeLM);
    })
    .catch((err) => {
        console.log("Error getting data");
    })
    //printDoc('LearnerModel', 'AndrewHu');
    // Check it against expected results
}

export function printDoc(col: string, doc: string) {
    db.collection(col).doc(doc).get().then((lm) => {
        console.log(JSON.stringify(lm.data()));
    })
    .catch((err) => {
        console.log("Error getting data");
    })
}