import { Learner, LearnerKnowledgeModel, LearnerModel } from "./LearnerModel"
import { expect } from "chai";
import "mocha";

describe("LearnerModelSchema", () => {
    it ("Should be equal to the example", () => {
        var learner = new Learner("5", true, 4, "A", "Hu", "A", "fdsf", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel("fdsf"));

        var handMade = {
            "learner": {
                "id": "5",
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