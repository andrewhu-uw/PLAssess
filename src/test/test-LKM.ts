import { Learner, LearnerModel, UserAction, LearnerResponse, Prompt,
    Path, Probability, } from "./LearnerModel"
import { MapID } from "./Map";
import {expect, assert} from "chai";
import "mocha";
import { DB } from "./DB"
import {LearnerKnowledgeModel, createLearnerKnowledgeModel} from "./LearnerKnowledgeModel"

describe("LKM works with Firestore", () => {
    before(function () {
        DB.init();
    });

    function makeExampleMap() : MapID<Path, Probability> {
        var multiEntry = new MapID<Path, Probability>();

        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");
        multiEntry.set(pathKey, probValue);
        pathKey = new Path("hello");
        probValue = new Probability("99%");
        multiEntry.set(pathKey, probValue);
        pathKey = new Path("world");
        probValue = new Probability("100%");
        multiEntry.set(pathKey, probValue);
        return multiEntry;
    }

    function makeExampleLKM() : LearnerKnowledgeModel {
        var multiEntry = makeExampleMap();

        var lkm = createLearnerKnowledgeModel(multiEntry);
        lkm.id = "containsMultiEntry";
        return lkm;
    }

    before (async function() {
        // Create and send a LKM that contains a Map with multiple entrys
        var lkm = makeExampleLKM();
        await lkm.send();
    });

    it ("Should store LKM properly", async () => {
        var originalLKM = makeExampleLKM();
        var loadedLKM : LearnerKnowledgeModel = await DB.getLearnerKnowledgeModel('containsMultiEntry');
        expect(loadedLKM.byPath["hello"]).to.deep.equal(new Probability("99%"));
        expect(loadedLKM.byPath["hello"]).to.deep.equal({ prob: "99%"});
        expect(loadedLKM).to.deep.equal(originalLKM);
    });

    it ("Should update log properly", () => {
        var multiEntry = makeExampleMap();
        var lkm = createLearnerKnowledgeModel(multiEntry);

        lkm.update(new LearnerResponse(new Prompt("1 + 2"), "3"));
        expect(lkm.updateLog).to.exist;
        expect(lkm.updateLog["1 + 2"].response).to.deep.equal({
            id: "1 + 2",
            answer: "3"
        });
    })
})