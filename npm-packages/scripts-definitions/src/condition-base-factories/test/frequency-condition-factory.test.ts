import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { FrequencyFactory } from "../frequency-factory";
import { IFrequencyCondition } from "@daemons-fi/shared-definitions";


describe("Frequency Condition Factory", () => {
  it("creates an empty condition", async () => {
    const empty = FrequencyFactory.empty();

    expect(empty.enabled).to.be.false;
    expect(empty.delay.toNumber()).to.be.equal(0);
    expect(empty.start.toNumber()).to.be.equal(0);
  });

  it("returns an empty condition when trying to build from undefined json", async () => {
    const condition = FrequencyFactory.fromJson();

    assert.deepEqual(condition, FrequencyFactory.empty());
  });

  it("restores condition from json object", async () => {
    const originalCondition: IFrequencyCondition = {
      enabled: true,
      delay: BigNumber.from("125"),
      start: BigNumber.from("5587"),
    };
    const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
    const condition = FrequencyFactory.fromJson(jsonCondition);

    assert.deepEqual(condition, originalCondition);
  });
});
