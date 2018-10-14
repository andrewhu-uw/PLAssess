import {expect} from "chai";
import "mocha";
import { MapID } from "./Map";
import { Path, Probability } from "./LearnerModel";

describe("MapID", () => {
    it("Should be an empty object on construction (without types)", () => {
        var empty = new MapID();
        expect(empty).to.equal({});
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
        //expect(JSON.stringify(onePair)).to.equal(JSON.stringify({"abfd":{"prob":"42%"}}));
        expect(onePair).to.equal({"abfd":{"prob":"42%"}});
    })
});
