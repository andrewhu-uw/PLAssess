import { Learner, LearnerKnowledgeModel, LearnerModel, UserAction } from "./LearnerModel"
import { SetID } from "./Map"
import {expect} from "chai";
import "mocha";
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { doesNotThrow } from "assert";

var serviceAccount = require("../priv/firestore-private-key.json");
var db;

function toPlainObject(o : Object): Object {
    return JSON.parse(JSON.stringify(o));
}

describe("Firestore Cloud DB", () => {
    before(() => {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://plasses-d4707.firebaseio.com"
        });
        db = admin.firestore();
        db.settings({timestampesInSnapshots: true});

        // Create example data
        var learner = new Learner(5, true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

        // Sync to Firebase
        db.collection('LearnerModel').doc('AHu').set(
            toPlainObject(lm)
        )
        console.log(toPlainObject(lm));
        console.log("Type of plain LM's date:", typeof((toPlainObject(lm) as LearnerModel).learner.birthDate));
    });

    it ("Should load objects that are structurally equal to the data uploaded", (done) => {
        // Load example data from Firebase
        var learner = new Learner(5, true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel());

        db.collection('LearnerModel').doc('AHu').get().then((doc) => {
            var lm : LearnerModel = doc.data();
            expect(lm).to.deep.equal(handMadeLM);
            console.log("Received: ", typeof(lm.learner.birthDate), typeof(handMadeLM.learner.birthDate));
            done();
        })
        .catch((err) => {
            console.log("Error getting data: ", err);
            done(err);
        });

        
    });
})