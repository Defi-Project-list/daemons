import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { IMaxRepetitionsCondition } from "@daemons-fi/shared-definitions";
import { RepetitionsFactory } from "../repetitions-factory";

describe("Repetitions Factory", () => {
    it("creates an empty condition", async () => {
        const empty = RepetitionsFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.amount.toNumber()).to.be.equal(0);
    });

    it("returns an empty condition when trying to build from undefined json", async () => {
        const condition = RepetitionsFactory.fromJson();

        assert.deepEqual(condition, RepetitionsFactory.empty());
    });

    it("restores condition from json object", async () => {
        const originalCondition: IMaxRepetitionsCondition = {
            enabled: true,
            amount: BigNumber.from(7999)
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = RepetitionsFactory.fromJson(jsonCondition);

        assert.deepEqual(condition, originalCondition);
    });
});
