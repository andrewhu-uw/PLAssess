import {expect} from "chai";
import "mocha";
import { MapID, MapWrapper } from "./Map";
import { Path, Probability, LearnerKnowledgeModel, Learner, createLearnerKnowledgeModel } from "./LearnerModel";
import { DB } from "./DB";

describe("MapID", () => {
    it("Should be an empty object on construction (without types)", () => {
        var empty = new MapID();
        expect(empty).to.deep.equal({});
        expect(empty).to.not.equal({});
    });
    it("Should be an empty object on construction (with types)", () => {
        var empty = new MapID<Path, Probability>();
        expect(empty).to.deep.equal({});
        expect(empty).to.not.equal({});
    });

    it("Should set a value at the property corresponding to the key's id", () => {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");

        var oneEntry = new MapID<Path, Probability>();
        oneEntry.set(pathKey, probValue);

        var handMade = new MapID<Path, Probability>();
        var handMadeProbability = new Probability("42%");
        handMade["abfd"] = handMadeProbability;
        expect(oneEntry).to.deep.equal(handMade);
    });
    it("Should overwrite value at same key", () => {
        var pathKey = new Path("abfd");
        var probOne = new Probability("42%");
        var probTwo = new Probability("100%");

        var overwritePair = new MapID<Path, Probability>();
        overwritePair.set(pathKey, probOne);
        overwritePair.set(pathKey, probTwo);

        var handMade = new MapID<Path, Probability>();
        var handMadeProbability = new Probability("100%");
        handMade["abfd"] = handMadeProbability;
        expect(overwritePair).to.deep.equal(handMade);
    });
    it("Should not structurally equal different maps", () => {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");

        var oneEntry = new MapID<Path, Probability>();
        oneEntry.set(pathKey, probValue);

        expect(oneEntry).to.not.deep.equal({"hello":42});
    });
    it("Should structurally equal plain JS objects", () => {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");

        var oneEntry = new MapID<Path, Probability>();
        oneEntry.set(pathKey, probValue);

        expect(oneEntry).to.deep.equal({"abfd":{"prob":"42%"}});
    })
});

describe("Map works with Firestore", () => {
    // pair , better as entry 
    var oneEntry : MapID<Path, Probability> = new MapID();
    var multiEntry : MapID<Path, Probability> = new MapID();
    var lkm : LearnerKnowledgeModel;

    before (function() {
        DB.init();
    });
    before (async function() {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");
        oneEntry.set(pathKey, probValue);
        
        var wrapper = new MapWrapper(oneEntry, "oneEntry");
        await wrapper.send();
    });
    before (async function() {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");
        multiEntry.set(pathKey, probValue);
        pathKey = new Path("hello");
        probValue = new Probability("99%");
        multiEntry.set(pathKey, probValue);
        pathKey = new Path("world");
        probValue = new Probability("100%");
        multiEntry.set(pathKey, probValue);

        await new MapWrapper(multiEntry, "multiEntry").send();
    });
    before (async function() {
        // Create and send a LKM that contains a Map with multiple pairs
        lkm = createLearnerKnowledgeModel(multiEntry);
        lkm.id = "containsMultiEntry";
        await lkm.send();
    })

    it ("One entry", async () => {
        var loadedMap : MapID<Path, Probability> =  await DB.getInstance()
            .collection('MapWrapper').doc('oneEntry').get().then((snap) => {
                return snap.data().map as MapID<Path, Probability>;
            });
        expect(loadedMap).to.deep.equal(oneEntry);
    });

    it ("Multiple pairs", async () => {
        var loadedMap : MapID<Path, Probability> = 
        await DB.getInstance().collection('MapWrapper').doc('multiEntry').get().then((snap) => {
            return snap.data().map as MapID<Path, Probability>;
        });
        expect(loadedMap).to.deep.equal(multiEntry);
    });

    it ("Should store LKM properly", async () => {
        var loadedLKM : LearnerKnowledgeModel = await DB.getLearnerKnowledgeModel('containsMultiEntry');
        expect(loadedLKM.byPath["hello"]).to.deep.equal(new Probability("99%"));
        expect(loadedLKM).to.deep.equal(lkm);
    });
});
