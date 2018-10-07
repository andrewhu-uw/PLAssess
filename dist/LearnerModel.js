var Learner = /** @class */ (function () {
    function Learner(id, difficultyStyle, mindset, firstName, lastName, preferredName, gender, birthdate, age) {
        this.id = id;
        this.difficultyStyle = difficultyStyle;
        this.mindset = mindset;
        this.firstName = firstName;
        this.lastName = lastName;
        this.preferredName = preferredName;
        this.gender = gender;
        this.birthdate = birthdate;
        this.age = age;
    }
    return Learner;
}());
/** Which part of program tracing is being assessed */
var Path = /** @class */ (function () {
    function Path() {
    }
    return Path;
}());
/** The series of paths up to this point */
var PathSequence = /** @class */ (function () {
    function PathSequence() {
    }
    return PathSequence;
}());
var Probability = /** @class */ (function () {
    function Probability() {
    }
    return Probability;
}());
var UserAction = /** @class */ (function () {
    function UserAction() {
    }
    return UserAction;
}());
var SurveyQuestion = /** @class */ (function () {
    function SurveyQuestion() {
    }
    return SurveyQuestion;
}());
var LearnerResponse = /** @class */ (function () {
    // TODO: Update with what Greg says should go in here
    function LearnerResponse(q) {
        this.q = q;
    }
    return LearnerResponse;
}());
/** Insert with Path.id as key */
var MapPathProbability = /** @class */ (function () {
    function MapPathProbability() {
    }
    return MapPathProbability;
}());
var MapPathSeqProbability = /** @class */ (function () {
    function MapPathSeqProbability() {
    }
    return MapPathSeqProbability;
}());
var MapSurveyQuestionString = /** @class */ (function () {
    function MapSurveyQuestionString() {
    }
    return MapSurveyQuestionString;
}());
/** Insert with Date.toDateString() as key. DO NOT USE toString() */
var MapDateRow = /** @class */ (function () {
    function MapDateRow() {
    }
    return MapDateRow;
}());
var MapDateUserAction = /** @class */ (function () {
    function MapDateUserAction() {
    }
    return MapDateUserAction;
}());
/** timestamp is set at the time it is constructed */
var KMUpdateRow = /** @class */ (function () {
    function KMUpdateRow(_response, _pathBefore, _pathAfter, _pathSeqBefore, _pathSeqAfter) {
        this.timestamp = new Date();
        this.response = _response;
        this.pathBefore = _pathBefore;
        this.pathAfter = _pathAfter;
        this.pathSeqBefore = _pathSeqBefore;
        this.pathSeqAfter = _pathSeqAfter;
    }
    return KMUpdateRow;
}());
/** A set of KMUpdateRow's */
var KMUpdateLog = /** @class */ (function () {
    function KMUpdateLog() {
    }
    KMUpdateLog.prototype.addEntry = function (input) {
        this.rowSet[input.timestamp.toDateString()] = input;
    };
    return KMUpdateLog;
}());
var LearnerKnowledgeModel = /** @class */ (function () {
    function LearnerKnowledgeModel() {
    }
    LearnerKnowledgeModel.prototype.getPath = function () { return this.byPath; };
    LearnerKnowledgeModel.prototype.getPathSequences = function () { return this.byPathSequences; };
    LearnerKnowledgeModel.prototype.setPathPrior = function (p, prob) { this.pathPrior[p.id] = prob; };
    LearnerKnowledgeModel.prototype.setPathSeqPrior = function (ps, prob) { this.pathSeqPrior[ps.id] = prob; };
    LearnerKnowledgeModel.prototype.update = function (answer) {
        // create a KMUpdateRow with the input answer
        var input = new KMUpdateRow(answer, {}, {}, {}, {});
        this.updateLog.addEntry(input);
    };
    return LearnerKnowledgeModel;
}());
var LearnerModel = /** @class */ (function () {
    function LearnerModel(learner, knowledgeModel) {
        this.learner = learner;
        this.knowledgeModel = knowledgeModel;
    }
    /** Records actions taken by this learner */
    LearnerModel.prototype.addUserAction = function (ua) {
        this.userActionLog[new Date().toDateString()] = ua;
    };
    LearnerModel.prototype.addSurveyAnswer = function (answer) {
        this.knowledgeModel.update(answer);
    };
    /** What are all of the current answers to all of the questions
     * TODO: clarify are the keys here all of the questions total, or those asked so far?
     */
    LearnerModel.prototype.latestSurveyAnswers = function () {
        return {};
    };
    LearnerModel.prototype.historicalSurveyAnswers = function () {
        return {};
    };
    return LearnerModel;
}());
/**
var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(), 5);
var lm = new LearnerModel(learner, new LearnerKnowledgeModel());

var JSONString = JSON.stringify(lm);
console.log(JSONString);
*/ 
