import { expect } from "chai";
import { parseScript } from "../script-builder";
import chai from "chai";
chai.use(require("chai-as-promised"));

describe("Script builder", () => {
    it("throws an error if trying to build a script from an unsupported type", async () => {
        const script = { __type: "YourMum" };
        const gonnaThrowPromise = () => parseScript(script);

        await expect(gonnaThrowPromise()).to.be.rejectedWith("Unsupported script type: YourMum");
    });
});
