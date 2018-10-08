

//export module pla {

    export class Learner {
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
    class PathSequence { id : string; seq : Array<Path>; }
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

    /** Insert with Path.id as key */
    class MapPathProbability { }
    class MapPathSeqProbability { }
    class MapSurveyQuestionString { }
    /** Insert with Date.toDateString() as key. DO NOT USE toString() */
    class MapDateRow { }
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
            this.rowSet[input.timestamp.toDateString()] = input;
        }
    }

    export class LearnerKnowledgeModel {
        id : string;
        byPath : MapPathProbability;
        byPathSequences : MapPathSeqProbability;
        // What is the prior?
        pathPrior : MapPathProbability;
        pathSeqPrior : MapPathSeqProbability;
        updateLog: KMUpdateLog;
        getPath () : MapPathProbability { return this.byPath; }
        getPathSequences() : MapPathSeqProbability { return this.byPathSequences; }
        setPathPrior(p: Path, prob: Probability) { this.pathPrior[p.id] = prob; }
        setPathSeqPrior(ps: PathSequence, prob: Probability) { this.pathSeqPrior[ps.id] = prob; }
        update(answer: LearnerResponse) {
            // create a KMUpdateRow with the input answer
            var input = new KMUpdateRow(answer, {}, {}, {}, {});
            this.updateLog.addEntry(input);
        }
    }
            
    export class LearnerModel {
        userActionLog : MapDateUserAction;
        constructor(public learner: Learner, public knowledgeModel: LearnerKnowledgeModel) {    }
        /** Records actions taken by this learner */
        addUserAction (ua: UserAction) {
            this.userActionLog[new Date().toDateString()] = ua;
        }
        addSurveyAnswer (answer: LearnerResponse) {
            this.knowledgeModel.update(answer);
        }
        /** What are all of the current answers to all of the questions
         * TODO: clarify are the keys here all of the questions total, or those asked so far?
         */
        latestSurveyAnswers () : MapSurveyQuestionString {
            return {};
        }
        historicalSurveyAnswers () : MapSurveyQuestionString {
            return {};
        }
    }
//}