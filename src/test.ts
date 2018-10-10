import { Learner, LearnerKnowledgeModel, LearnerModel } from "./LearnerModel"
import { initDB, loadDB } from "./init_test"

function testSchemaLearnerModel() {
    var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(5000), 5);
    var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

    var JSONString = JSON.stringify(lm);
    console.log(JSONString);
    if (JSONString == '{"learner":{"id":5,"difficultyStyle":true,"mindset":4,"firstName":"A","lastName":"Hu","preferredName":"A","gender":"fdsf","birthdate":"1970-01-01T00:00:05.000Z","age":5},"knowledgeModel":{}}') {
        console.log("PASS");
    } else {
        console.log("FAIL");
    }
}

testSchemaLearnerModel();
initDB();
loadDB();