import { Path, Probability, PathSequence, LearnerResponse, Prompt } from "./LearnerModel"
import { DB, FirestoreSync, toPlainObject } from "./DB";
import { MapID, SetID,} from "./Map";
import { WriteResult, FieldValue } from "@google-cloud/firestore";

export function createLearnerKnowledgeModel(_byPath : MapID<Path, Probability>): LearnerKnowledgeModel {
    var temp = new LearnerKnowledgeModel(null);
    temp.byPath = _byPath;
    return temp;
}

export function createLearnerKnowledgeModelFromDownloaded(lkm : LearnerKnowledgeModel): LearnerKnowledgeModel {
    var temp = new LearnerKnowledgeModel(null);
    return Object.assign(temp, lkm);
}

export class LearnerKnowledgeModel implements FirestoreSync {
    id : string;
    byPath : MapID<Path, Probability>;
    byPathSequences : MapID<PathSequence, Probability>;
    pathPrior : MapID<Path, Probability>; // should be in constructor, can have a default argument
    pathSeqPrior : MapID<PathSequence, Probability>; 
    updateLog: Array<KMUpdateRow>;
    constructor(_id : string) {
        this.id = _id;
        this.updateLog = new Array();
        this.pathPrior = new MapID();
    }
    getPath () : MapID<Path, Probability> { return this.byPath; }
    getPathSequences() : MapID<PathSequence, Probability> { return this.byPathSequences; }
    setPathPrior(p: Path, prob: Probability) { this.pathPrior.set(p, prob); }
    setPathSeqPrior(ps: PathSequence, prob: Probability) { this.pathSeqPrior.set(ps, prob); }
    // Updates the server
    update(answer: LearnerResponse) {
        // create a KMUpdateRow with the input answer
        var input = new KMUpdateRow(answer, 
                                    new MapID<Path, Probability>(), 
                                    new MapID<Path, Probability>(), 
                                    new MapID<PathSequence, Probability>(), 
                                    new MapID<PathSequence, Probability>());
        this.updateLog.push(input);
        // Update the array using Firestore array semantics
        return DB.getInstance().collection(LearnerKnowledgeModel.name).doc(this.id)
            .update({updateLog: FieldValue.arrayUnion(toPlainObject(input))});
    }
    hasResponse(lr : LearnerResponse): boolean {
        throw "Not implemented yet"
    }
    send() : Promise<void | WriteResult> {
        // Adding a new object
        if (this.id == null) {
            return DB.getInstance().collection(LearnerKnowledgeModel.name).add(
                toPlainObject(this)
            ).then((docRef) => {
                // Set the local ID to the Firebase auto ID
                this.id = docRef.id;

                // TODO: check this by debugging and pausing here then open
                // firebase and see if it already has the id
                var debugpoint;
                // Update the ID field in the database
                // TODO: Ask Greg if this is necessary. I think so, but not sure
                /* return docRef.update({
                    id : docRef.id
                }); */

            })
        } else {
            return DB.getInstance().collection(LearnerKnowledgeModel.name).doc(this.id).set(
                toPlainObject(this)
            );
        }
    }
}

/** timestamp is set at the time it is constructed */
class KMUpdateRow {
    timestamp : string;
    question: Prompt;
    response : LearnerResponse;
    pathBefore : MapID<Path, Probability>;
    pathAfter  : MapID<Path, Probability>;
    pathSeqBefore : MapID<PathSequence, Probability>;
    pathSeqAfter  : MapID<PathSequence, Probability>;
    constructor(_response: LearnerResponse, _pathBefore: MapID<Path, Probability>, _pathAfter: MapID<Path, Probability>,
            _pathSeqBefore: MapID<PathSequence, Probability>, _pathSeqAfter: MapID<PathSequence, Probability>) {
        this.timestamp = new Date().toJSON();
        this.response = _response;
        this.question = _response.question;
        this.pathBefore = _pathBefore;
        this.pathAfter = _pathAfter;
        this.pathSeqBefore = _pathSeqBefore;
        this.pathSeqAfter = _pathSeqAfter;
    }
}