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

/** Insert Path as value with Path.id as key */
class MapPathProbability { }
class MapPathSeqProbability { }
class MapDateRow { }
class MapSurveyQuestionString { }
class MapDateUserAction { }

/** timestamp is set at the time it is constructed */
class KMUpdateRow {
    timestamp : Date;
    response : LearnerResponse;
    pathBefore : MapPathProbability;
    pathAfter  : MapPathProbability;
    pathSeqBefore : MapPathSeqProbability;
    pathSeqAfter  : MapPathSeqProbability;
    constructor(_response: LearnerResponse, _pathBefore: MapPathProbability, _pathAfter: MapPathProbability,
            _pathSeqBefore: MapPathSeqProbability, _pathSeqAfter: MapPathSeqProbability,) {
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
    rowSet : MapDateRow;
    addEntry (input : KMUpdateRow) {
        this.rowSet = set(input.timestamp, input, this.rowSet);
    }
}

class LearnerKnowledgeModel {
    id : string;
    byPath : MapPathProbability;
    byPathSequences : MapPathSeqProbability;
    // What is the prior?
    pathPrior : MapPathProbability;
    pathSeqPrior : MapPathSeqProbability;
    updateLog: KMUpdateLog;
    getPath () : MapPathProbability { return this.byPath; }
    getPathSequences() : MapPathSeqProbability { return this.byPathSequences; }
    setPathPrior(p: Path, prob: Probability) { this.pathPrior = set(p, prob, this.pathPrior); }
    setPathSeqPrior(ps: PathSequence, prob: Probability) { this.pathSeqPrior = set(ps, prob, this.pathSeqPrior); }
    update(answer: LearnerResponse) {
        // create a KMUpdateRow with the input answer
        var input = new KMUpdateRow(answer, empty(), empty(), empty(), empty());
        this.updateLog.addEntry(input);
    }
}
        
class LearnerModel {
    userActionLog : MapDateUserAction;
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
    latestSurveyAnswers () : MapSurveyQuestionString {
        return empty();
    }
    historicalSurveyAnswers () : MapSurveyQuestionString {
        return empty();
    }
}

/**
var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(), 5);
var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

var JSONString = JSON.stringify(lm);
console.log(JSONString);
*/