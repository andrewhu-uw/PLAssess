import {empty, set, HashMap} from "@typed/hashmap";

class Learner {
    constructor(public id: number, 
            public difficultyStyle: boolean, 
            public mindset: number, 
            public firstName: string,
            public lastName: string,
            public preferredName: string,
            public gender: string,
            public birthdate: Date,
            public age: number) {    }
}

/** Which part of program tracing is being assessed */
class Path { id : string }
/** The series of paths up to this point */
class PathSequence { seq : Array<Path> }
class Probability { prob : string }
class UserAction { id : string }
class SurveyQuestion {
    // TODO: should this just be the question as a string or an id?
    id : string
}
class LearnerResponse {
    // TODO: Update with what Greg says should go in here
    constructor(public q: SurveyQuestion) {}
}

/** timestamp is set at the time it is constructed */
class KMUpdateRow {
    timestamp : Date;
    response : LearnerResponse;
    pathBefore : HashMap<Path, Probability>;
    pathAfter  : HashMap<Path, Probability>;
    pathSeqBefore : HashMap<PathSequence, Probability>;
    pathSeqAfter  : HashMap<PathSequence, Probability>;
    constructor(_response: LearnerResponse, _pathBefore: HashMap<Path, Probability>, _pathAfter: HashMap<Path, Probability>,
            _pathSeqBefore: HashMap<PathSequence, Probability>, _pathSeqAfter: HashMap<PathSequence, Probability>,) {
        this.timestamp = new Date();
        this.response = _response;
        this.pathBefore = _pathBefore;
        this.pathAfter = _pathAfter;
        this.pathSeqBefore = _pathSeqBefore;
        this.pathSeqAfter = _pathSeqAfter;
    }
}

/** A set of KMUpdateRow's */
class KMUpdateLog {
    rowSet : HashMap<Date, KMUpdateRow>;
    addEntry (input : KMUpdateRow) {
        this.rowSet = set(input.timestamp, input, this.rowSet);
    }
}

class LearnerKnowledgeModel {
    id : string;
    byPath : HashMap<Path, Probability>;
    byPathSequences : HashMap<PathSequence, Probability>;
    // What is the prior?
    pathPrior : HashMap<Path, Probability>;
    pathSeqPrior : HashMap<PathSequence, Probability>;
    updateLog: KMUpdateLog;
    getPath () : HashMap<Path, Probability> { return this.byPath; }
    getPathSequences() : HashMap<PathSequence, Probability> { return this.byPathSequences; }
    setPathPrior(p: Path, prob: Probability) { this.pathPrior = set(p, prob, this.pathPrior); }
    setPathSeqPrior(ps: PathSequence, prob: Probability) { this.pathSeqPrior = set(ps, prob, this.pathSeqPrior); }
    update(answer: LearnerResponse) {
        // create a KMUpdateRow with the input answer
        var input = new KMUpdateRow(answer, empty(), empty(), empty(), empty());
        this.updateLog.addEntry(input);
    }
}
        
class LearnerModel {
    userActionLog : HashMap<Date, UserAction>;
    constructor(public learner: Learner, public knowledgeModel: LearnerKnowledgeModel) {    }
    /** Records actions taken by this learner */
    addUserAction (ua: UserAction) {
        this.userActionLog = set(new Date(), ua, this.userActionLog);
    }
    addSurveyAnswer (answer: LearnerResponse) {
        this.knowledgeModel.update(answer);
    }
    /** What are all of the current answers to all of the questions
     * TODO: clarify are the keys here all of the questions total, or those asked so far?
     */
    latestSurveyAnswers () : HashMap<SurveyQuestion, string> {
        return empty();
    }
    historicalSurveyAnswers () : HashMap<SurveyQuestion, string> {
        return empty();
    }
}

/**
var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(), 5);
var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

var JSONString = JSON.stringify(lm);
console.log(JSONString);
*/