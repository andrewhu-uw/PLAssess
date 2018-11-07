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

        var onePair = new MapID<Path, Probability>();
        onePair.set(pathKey, probValue);

        var handMade = new MapID<Path, Probability>();
        var handMadeProbability = new Probability("42%");
        handMade["abfd"] = handMadeProbability;
        expect(onePair).to.deep.equal(handMade);
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

        var onePair = new MapID<Path, Probability>();
        onePair.set(pathKey, probValue);

        expect(onePair).to.not.deep.equal({"hello":42});
    });
    it("Should structurally equal plain JS objects", () => {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");

        var onePair = new MapID<Path, Probability>();
        onePair.set(pathKey, probValue);

        expect(onePair).to.deep.equal({"abfd":{"prob":"42%"}});
    })
});

describe("Map Firestore", () => {
    var onePair : MapID<Path, Probability> = new MapID();
    var multiPair : MapID<Path, Probability> = new MapID();
    var lkm : LearnerKnowledgeModel;

    before (function() {
        DB.init();
    });
    before (async function() {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");
        onePair.set(pathKey, probValue);
        
        var wrapper = new MapWrapper(onePair, "onePair");
        await wrapper.send();
    });
    before (async function() {
        var pathKey = new Path("abfd");
        var probValue = new Probability("42%");
        multiPair.set(pathKey, probValue);
        pathKey = new Path("hello");
        probValue = new Probability("99%");
        multiPair.set(pathKey, probValue);
        pathKey = new Path("world");
        probValue = new Probability("100%");
        multiPair.set(pathKey, probValue);

        await new MapWrapper(multiPair, "multiPair").send();
    });
    before (async function() {
        // Create and send a LKM that contains a Map with multiple pairs
        lkm = createLearnerKnowledgeModel(multiPair);
        lkm.id = "containsMultiPair";
        await lkm.send();
    })

    it ("One pair", async () => {
        var loadedMap : MapID<Path, Probability> = 
        await DB.getInstance().collection('MapWrapper').doc('onePair').get().then((snap) => {
            return snap.data().map as MapID<Path, Probability>;
        });
        expect(loadedMap).to.deep.equal(onePair);
    });

    it ("Multiple pairs", async () => {
        var loadedMap : MapID<Path, Probability> = 
        await DB.getInstance().collection('MapWrapper').doc('multiPair').get().then((snap) => {
            return snap.data().map as MapID<Path, Probability>;
        });
        expect(loadedMap).to.deep.equal(multiPair);
    });

    it ("Should store LKM properly", async () => {
        var loadedLKM : LearnerKnowledgeModel = await DB.getLearnerKnowledgeModel('containsMultiPair');
        expect(loadedLKM.byPath.get(new Path("hello"))).to.equal(new Probability("99%"));
        expect(loadedLKM).to.deep.equal(lkm);
    });
});
