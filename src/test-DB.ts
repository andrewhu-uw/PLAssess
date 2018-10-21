import { Learner, LearnerKnowledgeModel, LearnerModel, UserAction } from "./LearnerModel"
import { SetID } from "./Map"
import {expect} from "chai";
import "mocha";
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Firestore } from "@google-cloud/firestore";

var serviceAccount = require("../priv/firestore-private-key.json");
export module DB {
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

describe("Firestore Cloud DB", () => {
    before(() => {
        DB.init();

        // Create example data
        var learner = new Learner("5", true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        // Sync to Firebase
        // "Hand-rolled" method, to be deprecated
        DB.getInstance().collection('LearnerModel').doc('AHu').set(
            toPlainObject(lm)
        );
        // Boilerplate update method
        lm.push();
        console.log(toPlainObject(lm));
        console.log("Type of plain LM's date:", typeof((toPlainObject(lm) as LearnerModel).learner.birthDate));
    });

    it ("Should load objects that are structurally equal to the data uploaded", (done) => {
        // Load example data from Firebase
        var learner = new Learner("5", true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        DB.getInstance().collection('LearnerModel').doc('AHu').get().then((doc) => {
            var lm : LearnerModel = doc.data() as LearnerModel;
            expect(lm).to.deep.equal(handMadeLM);
            console.log("Received: ", typeof(lm.learner.birthDate), typeof(handMadeLM.learner.birthDate));
            done();
        })
        .catch((err) => {
            console.log("Error getting data: ", err);
            done(err);
        });
    });

    // it ("Should load objects using the FirestoreSync abstraction", (done) => {
    //     var handMadeLearner = new Learner("5", true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
    //     var handMadeLM = new LearnerModel(handMadeLearner, new LearnerKnowledgeModel());

    //     var lm = DB.getLearnerModel("5");

        
    // })
})