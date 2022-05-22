import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { FollowFactory } from "../follow-factory";
import { IFollowCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress, ZeroId } from "../shared";

describe("Follow Condition Factory", () => {
  it("creates an empty condition", async () => {
    const empty = FollowFactory.empty();

    expect(empty.enabled).to.be.false;
    expect(empty.scriptId).to.be.equal(ZeroId);
    expect(empty.executor).to.be.equal(ZeroAddress);
    expect(empty.shift.toNumber()).to.be.equal(0);
  });

  it("returns an empty condition when trying to build from undefined json", async () => {
    const condition = FollowFactory.fromJson();

    assert.deepEqual(condition, FollowFactory.empty());
  });

  it("restores condition from json object", async () => {
    const originalCondition: IFollowCondition = {
      enabled: false,
      scriptId: ZeroId,
      executor: ZeroAddress,
      shift: BigNumber.from(0),
    };
    const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
    const condition = FollowFactory.fromJson(jsonCondition);

    assert.deepEqual(condition, originalCondition);
  });
  3;
});
