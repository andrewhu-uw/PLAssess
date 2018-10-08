import { Learner, LearnerKnowledgeModel, LearnerModel } from "./LearnerModel"

function testSchemaLearnerModel() {
    var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(), 5);
    var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

    var JSONString = JSON.stringify(lm);
    console.log(JSONString);
}

testSchemaLearnerModel();