import "mocha"
import { expect } from "chai"
import { MapID } from "../Map";
import { Path, Probability, LearnerResponse, Prompt, Learner, TestSession, LearnerModel, Problem, Program } from "../LearnerModel";
import { DB } from "../DB";
import { createLearnerKnowledgeModel, LearnerKnowledgeModel } from "../LearnerKnowledgeModel";

describe("Integration tests", () => {
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
        // TODO change this to getMostRecentResponse
        /* expect(lkm.updateLog["1 + 2"].response).to.deep.equal({
            id: "1 + 2",
            answer: "3"
        }); */

        // send() and check that it didn't change
        await lkm.send();
        // TODO change this to getMostRecentResponse
        /* expect(lkm.updateLog["1 + 2"].response).to.deep.equal({
            id: "1 + 2",
            answer: "3"
        }); */
        
        // Add some more responses and verify them
        lkm.update(new LearnerResponse(new Prompt("-1 + 2"), "1"));
        lkm.update(new LearnerResponse(new Prompt("x++"), "x += 1"));
        // TODO change this to getMostRecentResponse
        /* expect(lkm.updateLog["-1 + 2"].response).to.deep.equal({
            id: "-1 + 2",
            answer: "1"
        }); */

        // send() lkm and verify that it didn't change
        await lkm.send();
        // TODO change this to getMostRecentResponse
        /* expect(lkm.updateLog["x++"].response).to.deep.equal({
            id: "x++",
            answer: "x += 1"
        }); */
    });

    var lindaID = undefined;
    it ("Multiple session integration test", async function(){
        this.timeout(5000);
        // Learner Linda goes to the site, and creates an account
        var linda = new Learner(true, 5, "Linda", "Langley", "Linda", "F", "11/17/1998", 20);
        var lindaKM = new LearnerKnowledgeModel(null);
        var lm = new LearnerModel(linda, lindaKM);
        // LearnerModel must be uploaded before a TestSession can be created
        await lm.send();

        // Linda starts a new test
        var testSess = new TestSession(lindaKM.id);
        lm.setCurrentTestSession(testSess);
        
        lm.learner.testSessionIDs.forEach(sessionID => {
            expect(typeof(sessionID)).to.equal("string");
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
        // Would display using program

        // Load all of the prompts
        // TODO figure out if there is a better way to do this
        var promptPromises : Promise<Prompt>[] = [];
        for (var i = 0; i < problem.promptIDs.length; i++) {
            promptPromises[i] = DB.getPrompt(problem.promptIDs[i])
        }
        var prompts : Prompt[] = await Promise.all(promptPromises).then(values => values);

        // Linda answers prompt1
        // Display using prompts[0].getQuestion()

        var lr1a = new LearnerResponse(prompts[0], "42");
        
        // Knowledge model updates
        // saved in knowledgeModel.updateLog
        // Also updates the server
        var lkmUpdatePromise = lm.update(lr1a);

        expect(lm.knowledgeModel.hasResponse(lr1a));  // Verify the knowledge model updated locally
        // Maybe redownload the LKM here and test that it worked
        await lkmUpdatePromise;
        var redownload = await DB.getLearnerKnowledgeModel(lm.knowledgeModel.id);
        expect(redownload).to.deep.equal(lm.knowledgeModel);

        // Linda answers prompt2 in that program
        var lr2 = new LearnerResponse(prompts[1], "351");
        // We have to await here because its possible that lr2 will arrive later than lr1b
        await lm.update(lr2);

        // Linda goes back and changes her answer to prompt1
        var lr1b = new LearnerResponse(prompts[0], "24");
        // Adds a new response for prompt1
        await lm.update(lr1b);
        // TODO check that both responses to prompt1 are still in the LKM

        // Linda logs off, save her id because I don't have auth working
        lindaID = linda.id
    });

    it ("Multiple session integration test pt.2", async function() {
        // Linda logs back on
        var lm: LearnerModel = await DB.getLearnerModel(lindaID);
        var testSess: TestSession = lm.learner.currentTestSession;
        expect(testSess).to.exist;
        var problem: Problem = testSess.currentProblem;

        // We have the latest prompt answers
        expect((problem
                .currentPromptAnswers["TZaKbrxQ6FrDrj2d64mv"] as LearnerResponse)
                .answer).to.equal("24");
        expect((problem
            .currentPromptAnswers["Tn4kBa5LGDkrpI1hgYdZ"] as LearnerResponse)
            .answer).to.equal("351");
        
        expect(lm.knowledgeModel.updateLog[0].response)
            .to.deep.equal({ answer: "42", 
                question: {id: "TZaKbrxQ6FrDrj2d64mv", question: "4+6"}});
        expect(lm.knowledgeModel.updateLog[1].response)
            .to.deep.equal({ answer: "351", 
                question: {id: "Tn4kBa5LGDkrpI1hgYdZ", question: "print(\"hello\")"}});
        expect(lm.knowledgeModel.updateLog[2].response)
            .to.deep.equal({ answer: "24", 
                question: {id: "TZaKbrxQ6FrDrj2d64mv", question: "4+6"}});
        
        // Display the problem
        var programPromise: Promise<Program> = DB.getProgram(problem.programID); 
        var promptPromises : Promise<Prompt>[] = [];
        for (var i = 0; i < problem.promptIDs.length; i++) {
            promptPromises[i] = DB.getPrompt(problem.promptIDs[i])
        }
        var prompts : Prompt[] = await Promise.all(promptPromises).then(values => values);      
        // Linda answers prompt3
        var lr3 = new LearnerResponse(prompts[2], "bar")
        await lm.update(lr3);

        var redownloadLM : LearnerModel = await DB.getLearnerModel(lindaID);
        expect((lm.learner.currentTestSession.currentProblem
            .currentPromptAnswers["EXHT1ubz6DafaVelDgzX"] as LearnerResponse)
            .answer).to.equal("bar")
        expect(redownloadLM.knowledgeModel.updateLog[3].response)
            .to.deep.equal({ answer: "bar",
            question: {id: "EXHT1ubz6DafaVelDgzX", question: "return foo;"}})
    })
})