import "mocha"
import { expect } from "chai"
import { MapID } from "./Map";
import { Path, Probability, LearnerResponse, Prompt, Learner, TestSession, LearnerModel } from "./LearnerModel";
import { DB } from "./DB";
import { createLearnerKnowledgeModel, LearnerKnowledgeModel } from "./LearnerKnowledgeModel";

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

    it ("LKM with multiple entries", async function() {
        this.timeout(5000);

        var byPathExample = makeExampleMap();
        var lkm = createLearnerKnowledgeModel(byPathExample);

        // create and save an LKM with a populated byPath
        await lkm.send();
        expect(typeof(lkm.id)).to.equal("string");

        // Add one update and verify it
        lkm.update(new LearnerResponse(new Prompt("1 + 2"), "3"));
        expect(lkm.updateLog).to.exist;
        expect(lkm.updateLog["1 + 2"].response).to.deep.equal({
            id: "1 + 2",
            answer: "3"
        });

        // send() and check that it didn't change
        await lkm.send();
        expect(lkm.updateLog["1 + 2"].response).to.deep.equal({
            id: "1 + 2",
            answer: "3"
        });
        
        // Add some more responses and verify them
        lkm.update(new LearnerResponse(new Prompt("-1 + 2"), "1"));
        lkm.update(new LearnerResponse(new Prompt("x++"), "x += 1"));
        expect(lkm.updateLog["-1 + 2"].response).to.deep.equal({
            id: "-1 + 2",
            answer: "1"
        });

        // send() lkm and verify that it didn't change
        await lkm.send();
        expect(lkm.updateLog["x++"].response).to.deep.equal({
            id: "x++",
            answer: "x += 1"
        });
    });

    it ("Multiple session integration test", async ()=>{
        // Learner Linda goes to the site, and creates an account
        var linda = new Learner(true, 5, "Linda", "Langley", "Linda", "F", "11/17/1998", 20);
        var lindaKM = new LearnerKnowledgeModel(null);
        var lm = new LearnerModel(linda, lindaKM);
        // LearnerModel must be uploaded before a TestSession can be created
        await lm.send();

        // Linda starts a new test
        var testSess = new TestSession(lindaKM.id);
        lm.setCurrentTestSession(testSess);
        
        lm.learner.testSessions.forEach(session => {
            expect(typeof(session.KMID)).to.equal("string");
        })

        // App loads questions to show Linda
        // I take this to mean that one Problem is loaded into the TestSession
        // For now, let's just get one of the Problems
        // testProblem is a test example manually created
        var problem = await DB.getProblem("testProblem");

        expect(problem.programID).to.equal("hello.py");
        //expect(problem.promptIDs).to.deep.equal(["TZaKbrxQ6FrDrj2d64mv", "Tn4kBa5LGDkrpI1hgYdZ"]);
        expect(problem.startingState).to.deep.equal({
            varName: "varValue"
        });

        testSess.setCurrentProblem(problem);
        // Upload the new learner, LKM, and test session
        lm.send();

        // Retrieve the program and prompts, so that they can be displayed
        const program = await DB.getProgram(problem.programID);
        // Display using program

        // Load all of the prompts
        // TODO figure out if there is a better way to do this
        var promptPromises : Promise<Prompt>[] = [];
        for (var i = 0; i < problem.promptIDs.length; i++) {
            promptPromises[i] = DB.getPrompt(problem.promptIDs[i])
        }
        var prompts : Prompt[] = await Promise.all(promptPromises).then(values => values);

        // Linda answers the first prompt
        // Display using prompts[0].getQuestion()

        var lr = new LearnerResponse(prompts[0], "42");
        
        // Knowledge model updates
        // saved in knowledgeModel.updateLog
        lm.updateKnowledgeModel(lr);

        expect(lm.knowledgeModel.hasResponse(lr));
    });
})