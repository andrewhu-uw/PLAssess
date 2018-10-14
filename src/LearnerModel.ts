import { MapID, SetID } from "./Map";

export class Learner {
    constructor(public id: number,
                public difficultyStyle: boolean,
                public mindset: number,
                public firstName: string,
                public lastName: string,
                public preferredName: string,
                public gender: string,
                public birthDate: Date,
                public age: number) {    }
}

/** Which part of program tracing is being assessed */
class Path { id : string }
/** The series of paths up to this point */
class PathSequence { id : string; seq : Path[]; }
class Probability { prob : string }
class UserAction { id : string }
class SurveyQuestion {
    // TODO: should this just be the question as a string or an id?
    id : string;
}
class LearnerResponse {
    id: string;
    // TODO: Update with what Greg says should go in here
    constructor(public q: SurveyQuestion) {}
}

/** timestamp is set at the time it is constructed */
class KMUpdateRow {
    timestamp : Date;
    id: string;
    response : LearnerResponse;
    pathBefore : MapID<Path, Probability>;
    pathAfter  : MapID<Path, Probability>;
    pathSeqBefore : MapID<PathSequence, Probability>;
    pathSeqAfter  : MapID<PathSequence, Probability>;
    constructor(_response: LearnerResponse, _pathBefore: MapID<Path, Probability>, _pathAfter: MapID<Path, Probability>,
            _pathSeqBefore: MapID<PathSequence, Probability>, _pathSeqAfter: MapID<PathSequence, Probability>) {
        this.timestamp = new Date();
        this.response = _response;
        this.id = _response.id;
        this.pathBefore = _pathBefore;
        this.pathAfter = _pathAfter;
        this.pathSeqBefore = _pathSeqBefore;
        this.pathSeqAfter = _pathSeqAfter;
    }
}

/** A set of KMUpdateRow's */
class KMUpdateLog {
    rowSet : SetID<KMUpdateRow>;
    addEntry (input : KMUpdateRow) {
        this.rowSet.add(input);
    }
}

export class LearnerKnowledgeModel {
    id : string;
    byPath : MapID<Path, Probability>;
    byPathSequences : MapID<PathSequence, Probability>;
    pathPrior : MapID<Path, Probability>;
    pathSeqPrior : MapID<PathSequence, Probability>;
    updateLog: KMUpdateLog;
    getPath () : MapID<Path, Probability> { return this.byPath; }
    getPathSequences() : MapID<PathSequence, Probability> { return this.byPathSequences; }
    setPathPrior(p: Path, prob: Probability) { this.pathPrior.set(p, prob); }
    setPathSeqPrior(ps: PathSequence, prob: Probability) { this.pathSeqPrior.set(ps, prob); }
    update(answer: LearnerResponse) {
        // create a KMUpdateRow with the input answer
        var input = new KMUpdateRow(answer, 
                                    new MapID<Path, Probability>(), 
                                    new MapID<Path, Probability>(), 
                                    new MapID<PathSequence, Probability>(), 
                                    new MapID<PathSequence, Probability>());
        this.updateLog.addEntry(input);
    }
}

export interface LearnerModelInterface {
    userActionLog : Object;
    learner: Learner;
    knowledgeModel : LearnerKnowledgeModel;
}
export class LearnerModel {
    userActionLog : SetID<UserAction>;
    constructor(public learner: Learner, public knowledgeModel: LearnerKnowledgeModel) {    }
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
}