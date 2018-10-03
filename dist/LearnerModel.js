"use strict";
exports.__esModule = true;
var hashmap_1 = require("@typed/hashmap");
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
        this.rowSet = hashmap_1.set(input.timestamp, input, this.rowSet);
    };
    return KMUpdateLog;
}());
var LearnerKnowledgeModel = /** @class */ (function () {
    function LearnerKnowledgeModel() {
    }
    LearnerKnowledgeModel.prototype.getPath = function () { return this.byPath; };
    LearnerKnowledgeModel.prototype.getPathSequences = function () { return this.byPathSequences; };
    LearnerKnowledgeModel.prototype.setPathPrior = function (p, prob) { this.pathPrior = hashmap_1.set(p, prob, this.pathPrior); };
    LearnerKnowledgeModel.prototype.setPathSeqPrior = function (ps, prob) { this.pathSeqPrior = hashmap_1.set(ps, prob, this.pathSeqPrior); };
    LearnerKnowledgeModel.prototype.update = function (answer) {
        // create a KMUpdateRow with the input answer
        var input = new KMUpdateRow(answer, hashmap_1.empty(), hashmap_1.empty(), hashmap_1.empty(), hashmap_1.empty());
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
        this.userActionLog = hashmap_1.set(new Date(), ua, this.userActionLog);
    };
    LearnerModel.prototype.addSurveyAnswer = function (answer) {
        this.knowledgeModel.update(answer);
    };
    /** What are all of the current answers to all of the questions
     * TODO: clarify are the keys here all of the questions total, or those asked so far?
     */
    LearnerModel.prototype.latestSurveyAnswers = function () {
        return hashmap_1.empty();
    };
    LearnerModel.prototype.historicalSurveyAnswers = function () {
        return hashmap_1.empty();
    };
    return LearnerModel;
}());
var learner = new Learner(5, true, 4, "A", "Hu", "A", "fdsf", new Date(), 5);
var lm = new LearnerModel(learner, new LearnerKnowledgeModel());
var JSONString = JSON.stringify(lm);
console.log(JSONString);
