import { Learner, LearnerKnowledgeModel, LearnerModel, LearnerModelInterface } from "./LearnerModel"
import { initDB, loadDB } from "./init_test"
import { expect } from "chai";
import "mocha";

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

function testSchemaLearnerModel() {
    var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(5000), 5);
    var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

    var JSONString = JSON.stringify(lm);
    console.log(JSONString);
    if (JSONString == '{"learner":{"id":5,"difficultyStyle":true,"mindset":4,"firstName":"A","lastName":"Hu","preferredName":"A","gender":"fdsf","birthDate":"1970-01-01T00:00:05.000Z","age":5},"knowledgeModel":{}}') {
        console.log("PASS");
    } else {
        console.log("FAIL");
    }
}

testSchemaLearnerModel();
initDB();
loadDB();