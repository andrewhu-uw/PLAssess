import "mocha"
import { expect } from "chai"
import { MapID } from "./Map";
import { Path, Probability, LearnerResponse, SurveyQuestion } from "./LearnerModel";
import { DB } from "./DB";
import { createLearnerKnowledgeModel } from "./LearnerKnowledgeModel";

describe("LKM Integration tests", () => {
    before(() => {
        DB.init();
    })
    
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
    // test lkm with multiple entries works
    
    // create lkm
    // save it
    // call update several times on LKM (first once, then check it worked, then multiple, then check works again
    
    // this is an example of test for "how to use these classes in the application"
    // they may also surface api usability issues (like ugh this is a  little ugly)
    // we can talk about those on slack or at next meeting depending on severity
    
    // more tests that depend on Map (like for LKM) are in test-Map.ts at bottom

    it ("LKM with multiple entries", async function() {
        this.timeout(5000);

        var byPathExample = makeExampleMap();
        var lkm = createLearnerKnowledgeModel(byPathExample);

        // create and save an LKM with a populated byPath
        await lkm.send();
        expect(typeof(lkm.id)).to.equal("string");

        // Add one update and verify it
        lkm.update(new LearnerResponse(new SurveyQuestion("Do you know code?"), "yes"));
        expect(lkm.updateLog).to.exist;
        expect(lkm.updateLog["Do you know code?"]).to.deep.equal({
            id: "Do you know code?",
            response: "yes"
        });

        // send() and check that it didn't change
        await lkm.send();
        expect(lkm.updateLog["Do you know code?"]).to.deep.equal({
            id: "Do you know code?",
            response: "yes"
        });
        
        // Add some more responses and verify them
        lkm.update(new LearnerResponse(new SurveyQuestion("How well do you know code?"), "pretty well"));
        lkm.update(new LearnerResponse(new SurveyQuestion("How good are you at code?"), "okay, I guess"));
        lkm.update(new LearnerResponse(new SurveyQuestion("How long have you been coding?"), "a few years now"));
        expect(lkm.updateLog["How well do you know code?"]).to.deep.equal({
            id: "How well do you know code?",
            response: "pretty well"
        });

        // send() lkm and verify that it didn't change
        await lkm.send();
        expect(lkm.updateLog["How good are you at code?"]).to.deep.equal({
            id: "How good are you at code?",
            response: "okay, I guess"
        });
    })
})