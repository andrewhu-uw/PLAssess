import { Path, Probability, PathSequence, LearnerResponse } from "./LearnerModel"
import { DB, toPlainObject, FirestoreSync } from "./DB";
import { MapID, SetID } from "./Map";
import { WriteResult } from "@google-cloud/firestore";

export function createLearnerKnowledgeModel(_byPath : MapID<Path, Probability>): LearnerKnowledgeModel {
    var temp = new LearnerKnowledgeModel(null);
    temp.byPath = _byPath;
    return temp;
}

export class LearnerKnowledgeModel implements FirestoreSync {
    id : string;
    byPath : MapID<Path, Probability>;
    byPathSequences : MapID<PathSequence, Probability>;
    pathPrior : MapID<Path, Probability>;
    pathSeqPrior : MapID<PathSequence, Probability>;
    updateLog: SetID<KMUpdateRow>;
    constructor(_id : string) {
        this.id = _id;
        this.updateLog = new SetID();
    }
    
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
        this.updateLog.add(input);
    }
    send() : Promise<void | WriteResult> {
        // Adding a new object
        if (this.id == null) {
            return DB.getInstance().collection('LearnerKnowledgeModel').add(
                toPlainObject(this)
            ).then((docRef) => {
                // Set the local ID to the Firebase auto ID
                this.id = docRef.id;
                // Update the ID field in the database
                // TODO: Ask Greg if this is necessary. I think so, but not sure
                docRef.update({
                    id : docRef.id
                });

            })
        } else {
            return DB.getInstance().collection('LearnerKnowledgeModel').doc(this.id).set(
                toPlainObject(this)
            );
        }
    }
}

/** timestamp is set at the time it is constructed */
class KMUpdateRow {
    timestamp : string;
    id: string;
    response : LearnerResponse;
    pathBefore : MapID<Path, Probability>;
    pathAfter  : MapID<Path, Probability>;
    pathSeqBefore : MapID<PathSequence, Probability>;
    pathSeqAfter  : MapID<PathSequence, Probability>;
    constructor(_response: LearnerResponse, _pathBefore: MapID<Path, Probability>, _pathAfter: MapID<Path, Probability>,
            _pathSeqBefore: MapID<PathSequence, Probability>, _pathSeqAfter: MapID<PathSequence, Probability>) {
        this.timestamp = new Date().toJSON();
        this.response = _response;
        this.id = _response.id;
        this.pathBefore = _pathBefore;
        this.pathAfter = _pathAfter;
        this.pathSeqBefore = _pathSeqBefore;
        this.pathSeqAfter = _pathSeqAfter;
    }
}