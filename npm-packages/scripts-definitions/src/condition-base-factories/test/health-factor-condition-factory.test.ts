import { assert, expect } from "chai";
import { ethers } from "ethers";
import { ComparisonType, IHealthFactorCondition } from "@daemons-fi/shared-definitions";
import { HealthFactorFactory } from "../health-factor-factory";
import { ZeroAddress } from "../shared";

describe("HealthFactor Factory", () => {
  it("creates an empty condition", async () => {
    const empty = HealthFactorFactory.empty();

    expect(empty.enabled).to.be.false;
    expect(empty.amount.toNumber()).to.be.equal(0);
    expect(empty.comparison).to.be.equal(0);
    expect(empty.kontract).to.be.equal(ZeroAddress);
  });

  it("returns an empty condition when trying to build from undefined json", async () => {
    const condition = HealthFactorFactory.fromJson();

    assert.deepEqual(condition, HealthFactorFactory.empty());
  });

  it("restores condition from json object", async () => {
    const originalCondition: IHealthFactorCondition = {
      enabled: true,
      kontract: "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
      comparison: ComparisonType.GreaterThan,
      amount: ethers.utils.parseEther("1.255"),
    };
    const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
    const condition = HealthFactorFactory.fromJson(jsonCondition);

    assert.deepEqual(condition, originalCondition);
  });
});
