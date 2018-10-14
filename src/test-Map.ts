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
    })
});
