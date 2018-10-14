import { Learner, LearnerKnowledgeModel, LearnerModel, LearnerModelInterface } from "./LearnerModel"
import { initDB, loadDB } from "./init_test"
import { expect } from "chai";
import { describe } from "mocha";

describe("LearnerModelSchema", () => {
    it ("should be equal to the example", () => {
        var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(5000), 5);
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
                "birthDate": new Date(5000),
                "age": 5
            },
            "knowledgeModel": {},
            "userActionLog": {}
        };

        expect(handMade as LearnerModelInterface == lm);
    })
})

initDB();
loadDB();