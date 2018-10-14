import {expect} from "chai";
import "mocha";
import { MapID } from "./Map";
import { Path, Probability } from "./LearnerModel";

describe("MapID", () => {
    it("Should be an empty object on construction (without types)", () => {
        expect(new MapID() as unknown == {});
    });
    it("Should be an empty object on construction (with types)", () => {
        var empty = new MapID<Path, Probability>();
        expect(empty == {} as MapID<Path, Probability>);
    });

    it("Should set a value at the property corresponding to the key's id", () => {
        var pathKey = new Path();
        pathKey.id = "abfd";
        var probValue = new Probability();
        probValue.prob = "42%";

        var onePair = new MapID<Path, Probability>();
        onePair.set(pathKey, probValue);

        var handMade = new MapID<Path, Probability>();
        var handMadeProbability = new Probability();
        handMadeProbability.prob = "42%";
        handMade["abfd"] = handMadeProbability;
        expect(onePair == handMade);
    });
    it("Should overwrite value at same key", () => {
        var pathKey = new Path();
        pathKey.id = "abfd";
        var probOne = new Probability();
        probOne.prob = "42%";
        var probTwo = new Probability();
        probTwo.prob = "100%";

        var overwritePair = new MapID<Path, Probability>();
        overwritePair.set(pathKey, probOne);
        overwritePair.set(pathKey, probTwo);

        var handMade = new MapID<Path, Probability>();
        var handMadeProbability = new Probability();
        handMadeProbability.prob = "100%";
        handMade["abfd"] = handMadeProbability;
        expect(overwritePair == handMade);
    })
});
