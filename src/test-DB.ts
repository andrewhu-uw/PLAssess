import { Learner, LearnerKnowledgeModel, LearnerModel, UserAction } from "./LearnerModel"
import {expect, assert} from "chai";
import "mocha";
import { DB, toPlainObject } from "./DB"
import { WriteResult } from "@google-cloud/firestore";


describe("Firestore Cloud DB", () => {
    var generatedID : string;

    before(function() {
        DB.init();
    });

    // Must use function() syntax because of this.timeout
    before(async function () {
        this.timeout(5000);

        // Create example data
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        // Sync to Firebase
        // Interface update method
        await lm.send().then((wr) => {
            assert.isOk(wr, "Write success");
        })
        .catch((rejectedReason) => {
            assert.isNotOk(rejectedReason, "Promise rejected");
        });
        generatedID = lm.learner.id;
    });

    it ("Should load objects that are structurally equal to the data uploaded", async () => {
        // Load example data from Firebase
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        learner.id = generatedID;
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        var loadedLM = await DB.getLearnerModel(generatedID);
        expect(loadedLM).to.deep.equal(handMadeLM);
    });

    it ("Should not deep equal objects that do not have an ID", async () => {
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        //learner.id = generatedID;
        //^^ Forget id in handmade version
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        var loadedLM = await DB.getLearnerModel(generatedID);
        expect(loadedLM).to.not.deep.equal(handMadeLM);
    });
})