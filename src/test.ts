import { Learner, LearnerKnowledgeModel, LearnerModel, LearnerModelInterface } from "./LearnerModel"
import { expect } from "chai";
import "mocha";

describe("LearnerModelSchema", () => {
    it ("Should be equal to the example", () => {
        var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(5000).toJSON(), 5);
        var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

        var handMade = {
            "learner": {
                "id": 5,
                "difficultyStyle": true,
                "mindset": 4,
                "firstName": "A",
                "lastName": "Hu",
                "preferredName": "A",
                "gender": "fdsf",
                "birthDate": new Date(5000).toJSON(),
                "age": 5
            },
            "knowledgeModel": {}
        };

        expect(lm).to.deep.equal(handMade);
    })
})