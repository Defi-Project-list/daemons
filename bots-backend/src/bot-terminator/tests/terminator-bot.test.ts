import { ValidScript, VerificationFailedScript } from "@daemons-fi/scripts-definitions/build";
import { expect } from "chai";
import { BrokenScript, Script } from "@daemons-fi/db-schema";
import { Notification } from '@daemons-fi/db-schema';
import { transferScriptDocumentFactory } from "@daemons-fi/db-schema";
import { FakeScript } from "../../test/mocks/fake-script";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import { TerminatorBot } from "..";
const sinon = require("sinon");
const scriptsBuilder = require("../mockable-script-builder");
const providersBuilder = require("../../utils/providers-builder");

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
            reporter: script.user,
            scriptId: script.scriptId
        }).save();

        // mock the scriptBuilder so it'll return a fake script
        // in this way we can control the validation outcome
        const outcome = new VerificationFailedScript("[SIGNATURE][FINAL]");
        const fakeScript = new FakeScript(outcome);
        sinon.stub(scriptsBuilder, "parseScript").returns(fakeScript);
        sinon.stub(providersBuilder, "getProvider").returns({});

        // let's have the bot run
        const removedScripts = await TerminatorBot.execute();

        // the script should have been flagged and removed
        expect(removedScripts).to.be.equal(1);
        expect(await Script.count({})).to.be.equal(0);
        expect(await BrokenScript.count({})).to.be.equal(0);

        // 1 notification is created
        const notifications = await Notification.find({})
        expect(notifications.length).to.equal(1);
        expect(notifications[0].title).to.equal("Removed inexecutable script");
        expect(notifications[0].description.startsWith('The following script has been automatically removed as it was no longer executable:')).to.be.true;
        expect(notifications[0].chainId).to.equal(script.chainId);
        expect(notifications[0].user).to.equal(script.user);
    });

    it("ignores scripts that were not [FINAL]", async () => {
        // add a script on the broken scripts queue
        const script = await transferScriptDocumentFactory({});
        await BrokenScript.build({
            reporter: script.user,
            scriptId: script.scriptId
        }).save();

        // mock the scriptBuilder so it'll return a fake script
        // in this way we can control the validation outcome
        const outcome = new VerificationFailedScript("[PRICE_CONDITION_LOW][TMP]");
        const fakeScript = new FakeScript(outcome);
        sinon.stub(scriptsBuilder, "parseScript").returns(fakeScript);
        sinon.stub(providersBuilder, "getProvider").returns({});

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
            reporter: script.user,
            scriptId: script.scriptId
        }).save();

        // mock the scriptBuilder so it'll return a fake script
        // in this way we can control the validation outcome
        const outcome = new ValidScript();
        const fakeScript = new FakeScript(outcome);
        sinon.stub(scriptsBuilder, "parseScript").returns(fakeScript);
        sinon.stub(providersBuilder, "getProvider").returns({});

        // let's have the bot run
        const removedScripts = await TerminatorBot.execute();

        // the script should have been left untouched
        // but removed from the broken scripts queue
        expect(removedScripts).to.be.equal(0);
        expect(await Script.count({})).to.be.equal(1);
        expect(await BrokenScript.count({})).to.be.equal(0);
    });
});
