import { MapID, SetID } from "./Map";
import {DB, toPlainObject, FirestoreSync} from "./DB";
import { WriteResult } from "@google-cloud/firestore";
import { LearnerKnowledgeModel } from "./LearnerKnowledgeModel";

export class Learner implements FirestoreSync{
    id : string;
    constructor(public difficultyStyle: boolean,
                public mindset: number,
                public firstName: string,
                public lastName: string,
                public preferredName: string,
                public gender: string,
                public birthDate: string,
                public age: number) {    }
    async send () : Promise<void | WriteResult> {
        // Adding a new object
        if (this.id == null) {
            return DB.getInstance().collection('Learner').add(
                toPlainObject(this)
            ).then((docRef) => {
                // Set the local ID to the Firebase auto ID
                this.id = docRef.id;
                // Update the ID field in the database
                // TODO: Ask Greg if this is necessary. I think so, but not sure
                docRef.update({
                    id : docRef.id
                });
            });
        } else {
            return DB.getInstance().collection('Learner').doc(this.id).set(
                toPlainObject(this)
            );
        }      
    }
}

/** Which part of program tracing is being assessed */
export class Path { constructor(public id: string) {} }
/** The series of paths up to this point */
export class PathSequence { id : string; seq : Path[]; }
export class Probability { constructor(public prob: string) {} }
export class UserAction { constructor(public id : string){} }
export class SurveyQuestion {
    // TODO: should this just be the question as a string or an id?
    id : string;
}
export class LearnerResponse {
    id: string;
    // TODO: Update with what Greg says should go in here
    constructor(public q: SurveyQuestion) {}
}

export class LearnerModel implements FirestoreSync {
    userActionLog : SetID<UserAction>;
    constructor(public learner: Learner, public knowledgeModel: LearnerKnowledgeModel) {
        this.userActionLog = new SetID();
    }
    /** Records actions taken by this learner */
    addUserAction (ua: UserAction) {
        this.userActionLog.add(ua);
    }
    addSurveyAnswer (answer: LearnerResponse) {
        this.knowledgeModel.update(answer);
    }
    /** What are all of the current answers to all of the questions
     * TODO: clarify are the keys here all of the questions total, or those asked so far?
     */
    latestSurveyAnswers () : MapID<SurveyQuestion, string> {
        return new MapID();
    }
    historicalSurveyAnswers () : MapID<SurveyQuestion, string> {
        return new MapID();
    }
    async send () : Promise<WriteResult> {
        await this.learner.send();
        await this.knowledgeModel.send();
        return DB.getInstance().collection('LearnerModel').doc(this.learner.id).set({
            "learner" : this.learner.id,
            "knowledgeModel" : this.knowledgeModel.id,
            //"userActionLog" : this.userActionLog
        });
    }
}