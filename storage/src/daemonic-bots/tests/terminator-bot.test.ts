import { ValidScript, VerificationFailedScript } from "@daemons-fi/scripts-definitions/build";
import { expect } from "chai";
import { BrokenScript } from "../../models/queues/broken-scripts";
import { Script } from "../../models/scripts/script";
import { transferScriptDocumentFactory } from "../../test-factories/script-factories";
import { FakeScript } from "../../test/mocks/fake-script";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import { TerminatorBot } from "../terminator-bot";
const sinon = require("sinon");
const scriptsBuilder = require("../script-builder");

describe("Terminator Bot", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => {
        await clearTestDb();
        sinon.restore();
    });
    after(async () => await closeTestDb());

    it("gracefully ends if there are no scripts in the queue", async () => {
        await TerminatorBot.execute();
    });

    it("successfully removes broken scripts", async () => {
        // add a script on the broken scripts queue
        const script = await transferScriptDocumentFactory({});
        await BrokenScript.build({
            chainId: script.chainId.toString(),
            reporter: script.user,
            scriptId: script.scriptId
        }).save();

        // mock the scriptBuilder so it'll return a fake script
        // in this way we can control the validation outcome
        const outcome = new VerificationFailedScript("[SIGNATURE][FINAL]");
        const fakeScript = new FakeScript(outcome);
        sinon.stub(scriptsBuilder, "parseScript").returns(fakeScript);

        // let's have the bot run
        const removedScripts = await TerminatorBot.execute();

        // the script should have been flagged and removed
        expect(removedScripts).to.be.equal(1);
        expect(await Script.count({})).to.be.equal(0);
        expect(await BrokenScript.count({})).to.be.equal(0);
    });

    it("ignores scripts that were not [FINAL]", async () => {
        // add a script on the broken scripts queue
        const script = await transferScriptDocumentFactory({});
        await BrokenScript.build({
            chainId: script.chainId.toString(),
            reporter: script.user,
            scriptId: script.scriptId
        }).save();

        // mock the scriptBuilder so it'll return a fake script
        // in this way we can control the validation outcome
        const outcome = new VerificationFailedScript("[PRICE_CONDITION_LOW][TMP]");
        const fakeScript = new FakeScript(outcome);
        sinon.stub(scriptsBuilder, "parseScript").returns(fakeScript);

        // let's have the bot run
        const removedScripts = await TerminatorBot.execute();

        // the script should have been left untouched
        // but removed from the broken scripts queue
        expect(removedScripts).to.be.equal(0);
        expect(await Script.count({})).to.be.equal(1);
        expect(await BrokenScript.count({})).to.be.equal(0);
    });

    it("ignores scripts whose verification does not cause error", async () => {
        // add a script on the broken scripts queue
        const script = await transferScriptDocumentFactory({});
        await BrokenScript.build({
            chainId: script.chainId.toString(),
            reporter: script.user,
            scriptId: script.scriptId
        }).save();

        // mock the scriptBuilder so it'll return a fake script
        // in this way we can control the validation outcome
        const outcome = new ValidScript();
        const fakeScript = new FakeScript(outcome);
        sinon.stub(scriptsBuilder, "parseScript").returns(fakeScript);

        // let's have the bot run
        const removedScripts = await TerminatorBot.execute();

        // the script should have been left untouched
        // but removed from the broken scripts queue
        expect(removedScripts).to.be.equal(0);
        expect(await Script.count({})).to.be.equal(1);
        expect(await BrokenScript.count({})).to.be.equal(0);
    });
});
