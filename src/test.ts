import { Learner, LearnerKnowledgeModel, LearnerModel } from "./LearnerModel"
import { expect } from "chai";
import "mocha";
import { DB } from "./DB";

describe("LearnerModelSchema", () => {
    before(() => {
        DB.init();
    });

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
                "age": 5
            },
            "knowledgeModel": {
                "id": "fdsf"
            }
        } as LearnerModel;

        expect(lm).to.deep.equal(handMade);
    });

    it ("Should be equal to the example (after send)", async () => {
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
                "age": 5
            },
            "knowledgeModel": {
                "id": "fdsf"
            }
        } as LearnerModel;

        expect(lm).to.deep.equal(handMade);
    })
})