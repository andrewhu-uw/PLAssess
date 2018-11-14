import { Learner, LearnerModel, UserAction, Path } from "./LearnerModel"
import {expect, assert} from "chai";
import "mocha";
import { DB } from "./DB"
import { LearnerKnowledgeModel } from "./LearnerKnowledgeModel";


describe("Firestore Cloud DB", () => {
    var generatedID : string;

    before(function() {
        DB.init();
    });

    // Done before to verify that we can even write to Firestore
    // Must use function() syntax because of this.timeout
    before(async function () {
        this.timeout(5000);

        // Create example data
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        // Sync to Firebase, and fail the suite if unsuccessful
        await lm.send().then((wr) => {
            assert.isOk(wr, "Write success");
        })
        .catch((rejectedReason) => {
            assert.isNotOk(rejectedReason, "Promise rejected");
        });
        generatedID = lm.learner.id;
    });

    it ("Should generate an ID after first send", async () => {
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        await lm.send();
        expect(lm.learner.id).to.not.equal(null);
        expect(typeof(lm.learner.id)).to.equal("string");
    });

    it ("Should not change id after second send (without changing lm)", async () => {
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        await lm.send();
        expect(typeof(lm.learner.id)).to.equal("string");
        var originalID = lm.learner.id;
        
        await lm.send();
        expect(lm.learner.id).to.equal(originalID);
    })

    it ("Should not change id after second send (with changing lm)", async () => {
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        await lm.send();
        expect(typeof(lm.learner.id)).to.equal("string");
        var originalID = lm.learner.id;
        
        lm.learner.mindset = 1;
        lm.learner.age = 5;
        await lm.send();
        expect(lm.learner.id).to.equal(originalID);
    })

    it ("Should load LKM with just ID", async () => {
        // hello id created manually for testing via firebase 
        var handMadeLKM = new LearnerKnowledgeModel("hello");
        var loadedLKM : LearnerKnowledgeModel = await DB.getLearnerKnowledgeModel("hello");
        expect(loadedLKM).to.deep.equal(handMadeLKM);
    })

    it ("Should load LM that are structurally equal to the data uploaded", async () => {
        // Load example data from Firebase
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        learner.id = generatedID;
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        var loadedLM = await DB.getLearnerModel(generatedID);
        expect(loadedLM).to.deep.equal(handMadeLM);
    });

    it ("Should not deep equal LM that do not have an ID", async () => {
        var learner = new Learner(true, 4, "Andrew", "Hu", "Andrew", "M", new Date(5000).toJSON(), 5);
        //learner.id = generatedID;
        //^^ Forget id in handmade version
        var handMadeLM = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));
        expect(typeof(handMadeLM.learner.id)).to.equal("undefined");

        var loadedLM = await DB.getLearnerModel(generatedID);
        expect(loadedLM).to.not.deep.equal(handMadeLM);
    });

    // test lkm with multiple entries works

    // create lkm
    // save it
    // call update several times on LKM (first once, then check it worked, then multiple, then check works again
    
    // this is an example of test for "how to use these classes in the application"
    // they may also surface api usability issues (like ugh this is a  little ugly)
    // we can talk about those on slack or at next meeting depending on severity
    
    // more tests that depend on Map (like for LKM) are in test-Map.ts at bottom
})