import { Learner, LearnerKnowledgeModel, LearnerModel, UserAction } from "./LearnerModel"
import {expect, assert} from "chai";
import "mocha";
import { DB, toPlainObject } from "./DB"
import { WriteResult } from "@google-cloud/firestore";


describe("Firestore Cloud DB", () => {
    before(async function() {
        this.timeout(5000);
        DB.init();

        // Create example data
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        // Sync to Firebase
        // "Hand-rolled" method, to be deprecated
        // DB.getInstance().collection('LearnerModel').doc('AHu').set(
        //     toPlainObject(lm)
        // ).then((value) => {
        //     done();
        // }).catch((reason) => {
        //     done(new Error(reason));
        // })
        // Boilerplate update method
        console.log(toPlainObject(lm));
        console.log("Type of plain LM's date:", typeof((toPlainObject(lm) as LearnerModel).learner.birthDate));
        await lm.send().then((wr) => {
            assert.isOk(wr, "Write success");
        })
        .catch((rejectedReason) => {
            assert.isNotOk(rejectedReason, "Promise rejected");
        });
    });

    it ("Should load objects that are structurally equal to the data uploaded", (done) => {
        // Load example data from Firebase
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
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