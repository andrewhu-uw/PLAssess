import { LearnerModel, Learner } from "./LearnerModel";
import { LearnerKnowledgeModel } from "./LearnerKnowledgeModel";

// Updates the server
export async function createNewUser(firstname: string, lastname: string,
        gender: string, birthdate: string, age: number): Promise<LearnerModel> {
    var learner = new Learner(true, 5, firstname, lastname, firstname, gender, birthdate, age);
    var lkm = new LearnerKnowledgeModel(null);
    var lm = new LearnerModel(learner, lkm);
    await lm.send();
    return lm;
}