import { Learner, LearnerKnowledgeModel, LearnerModel } from "./LearnerModel"
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

var serviceAccount = require("../firestore-private-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://plasses-d4707.firebaseio.com"
});

var db = admin.firestore();

export function initDB() {
    // Create example data
    var learner = new Learner(5, true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000), 5);
    var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

    // Sync to Firebase
    db.collection('LearnerModel').doc('AHu').set(
        //JSON.parse(JSON.stringify(lm))
        {learner:{firstName:"A",lastName:"Hu"}}
    )
    //
    /*.catch((onRejected) => {
        console.log("Write rejected");
    }).then((onFulfilled) => {
        console.log("Write accepted(?)");
    })*/
}

export function loadDB() {
    // Load example data from Firebase
    db.collection('LearnerModel').doc('AHu').get().then((lm) => {
        console.log(JSON.stringify(lm.data()));
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