import { Learner, LearnerKnowledgeModel, LearnerModel } from "./LearnerModel"
import {expect} from "chai";
import "mocha";
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

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

        // Create example data
        var learner = new Learner(5, true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

        // Sync to Firebase
        db.collection('LearnerModel').doc('AHu').set(
            toPlainObject(lm)
        )
        console.log(toPlainObject(lm));
    });

    it ("Should load objects that are structurally equal to the data loaded", () => {
        // Load example data from Firebase
        var tobeLoaded : LearnerModel;
        
        var learner = new Learner(5, true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000), 5);
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel());

        db.collection('LearnerModel').doc('AHu').get().then((lm) => {

            console.log(JSON.stringify(lm.data()));
            tobeLoaded = lm.data() as LearnerModel;
        })
        .catch((err) => {
            console.log("Error getting data: ", err);
        });

        expect(tobeLoaded).to.deep.equal(handMadeLM);
    });
})