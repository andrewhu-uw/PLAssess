import { MapID, SetID, MapString } from "./Map";
import { DB, FirestoreSync, toPlainObject } from "./DB";
import { WriteResult } from "@google-cloud/firestore";
import { LearnerKnowledgeModel } from "./LearnerKnowledgeModel";

export class Learner implements FirestoreSync {
    id : string;
    testSessions : TestSession[] = [];
    currentTestSession : TestSession = null;
    constructor(public difficultyStyle: boolean,
                public mindset: number,
                public firstName: string,
                public lastName: string,
                public preferredName: string,
                public gender: string,
                public birthDate: string,
                public age: number) {}
    async send () : Promise<void | WriteResult> {
        // TODO deal with errors from sending the testSessions
        this.testSessions.forEach(session => {
            session.send().catch(reason => console.error(reason));
        })
        // Adding a new object
        if (this.id == undefined) {
            return DB.getInstance().collection(Learner.name).add(
                toPlainObject(this)
            ).then((docRef) => {
                // Set the local ID to the Firebase auto ID
                this.id = docRef.id;
                // Update the ID field in the database
                // TODO: Ask Greg if this is necessary. I think so, but not sure
                /* return docRef.update({
                    id : docRef.id
                }); */
            });
        } else {
            return DB.getInstance().collection(Learner.name).doc(this.id).set(
                toPlainObject(this)
            );
        }
    }
    setCurrentTestSession(t : TestSession) {
        this.currentTestSession = t;
        this.testSessions.push(t);
    }
}

export class TestSession implements FirestoreSync {
    id : string;
    pastProblems : Problem[];
    currentProblem : Problem;
    constructor(public KMID : string) {  // Must point to an actual KnowledgeModel
        if (KMID == null) {
            throw "ID is null/undefined";
        }
    }
    send() : Promise<void | WriteResult> {
        if (this.id == undefined) {
            return DB.getInstance().collection(TestSession.name).add(
                toPlainObject(this)
            ).then(docRef => {
                this.id = docRef.id;
                /* return docRef.update({
                    id : docRef.id
                }); */
            })
        } else {
            return DB.getInstance().collection(TestSession.name).doc(this.id).set(toPlainObject(this));
        }
    }
    setCurrentProblem(input : Problem) : void {
        if (this.currentProblem == undefined) {
            this.currentProblem = input;
        } else {
            this.pastProblems.push(this.currentProblem);
            this.currentProblem = input;
        }
    }
}
/** Which part of program tracing is being assessed */
export class Path { constructor(public id: string) {} }
/** The series of paths up to this point */
export class PathSequence { id : string; seq : Path[]; }
export class Probability { constructor(public prob: string) {} }
export class UserAction { constructor(public id : string){} }
export class SurveyQuestion { constructor(public id : string){}}
export class Program {
    id : string;  // filename
    contents : string;
}
export class Problem {
    programID : string;
    startingState : MapString<string>;
    promptIDs : string[];
    currentPromptAnswers : MapID<Prompt, LearnerResponse>;
}
export class Prompt { 
    id : string;  // question
    // TODO: What do these properties mean?
    location : string;
    howToShow : string;
    dependentPaths : Path[];
    constructor(question : string){
        this.id = question;
    }
    getQuestion() : string { return this.id; }
}
export class LearnerResponse {  // LearnerResponse's id is the question
    question : Prompt
    constructor(q : Prompt, public answer: string) {
        this.question = q;
    }
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
    setCurrentTestSession (ts : TestSession) {
        this.learner.setCurrentTestSession(ts);
    }
    /** This updates the testSession's most recent answers as well as the LKM */
    update (lr : LearnerResponse): Promise<WriteResult> {
        // Emulate MapID, figure out if there's a cleaner way to do this
        this.learner.currentTestSession.currentProblem.currentPromptAnswers[lr.question.id] = lr;
        this.knowledgeModel.update(lr);
        return this.send();
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
    async send () : Promise<any> {
        var learnerPromise = this.learner.send();
        var lkmPromise = this.knowledgeModel.send();
        // Have to await here because the LM entry depends on both ids
        if (this.learner.id == null) await learnerPromise;
        if (this.knowledgeModel.id == null) await lkmPromise;
        var lmPromise = DB.getInstance().collection(LearnerModel.name).doc(this.learner.id).set({
            "learner" : this.learner.id,
            "knowledgeModel" : this.knowledgeModel.id,
            "userActionLog" : toPlainObject(this.userActionLog)
        });
        return Promise.all([learnerPromise, lkmPromise, lmPromise])
    }
}