import { Learner, LearnerModel } from "../LearnerModel"
import { LearnerKnowledgeModel } from "../LearnerKnowledgeModel"
import { expect } from "chai";
import "mocha";
import { DB } from "../DB";

describe("LearnerModel Schema", () => {
    it ("Should be equal to the example (before send)", () => {
        var learner = new Learner(true, 4, "A", "Hu", "A", "fdsf", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        var handMade = {
            "learner": {
                "difficultyStyle": true,
                "mindset": 4,
                "firstName": "A",
                "lastName": "Hu",
                "preferredName": "A",
                "gender": "fdsf",
                "birthDate": new Date(5000).toJSON(),
                "age": 5,
                "testSessions": [],
                "currentTestSession": null
            },
            "knowledgeModel": {
                "id": "fdsf",
                "pathPrior": {},
                "updateLog": {}
            },
            "userActionLog": {}
        } as LearnerModel;

        expect(lm).to.deep.equal(handMade);
    });

    it ("Should not have an id before send()", () => {
        var learner = new Learner(true, 4, "A", "Hu", "A", "fdsf", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        expect(typeof(lm.learner.id)).to.equal("undefined");
    })
});

describe("LearnerModel Schema works with Firestore", () => {
    before(() => {
        DB.init();
    });

    it ("Should have id after send()", async () => {
        var learner = new Learner(true, 4, "A", "Hu", "A", "fdsf", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));
        await lm.send();

        expect(typeof(lm.learner.id)).to.equal("string");

        var handMade = {
            "learner": {
                "id": lm.learner.id,
                "difficultyStyle": true,
                "mindset": 4,
                "firstName": "A",
                "lastName": "Hu",
                "preferredName": "A",
                "gender": "fdsf",
                "birthDate": new Date(5000).toJSON(),
                "age": 5,
                "testSessions": [],
                "currentTestSession": null
            },
            "knowledgeModel": {
                "id": "fdsf",
                "pathPrior": {},
                "updateLog": {}
            },
            "userActionLog": {}
        } as LearnerModel;

        expect(lm).to.deep.equal(handMade);
    })
})