import { assert, expect } from "chai";
import { AmountType, BeefyActionType, IBeefyAction } from "@daemons-fi/shared-definitions";
import { Token } from "../../../data/chains-data/interfaces";
import { ICurrentScript } from "../../i-current-script";
import { IBeefyActionForm } from "../../../data/chains-data/action-form-interfaces";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";
import { BeefyMessageFactory } from "../beefy-message-factory";
import { BigNumber, ethers } from "ethers";
import { FrequencyConditionFactory } from "../../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../../conditions-factories/follow-condition-factory";

describe("Beefy Message Factory", () => {
    const tokens: Token[] = [];

    const form: IBeefyActionForm = {
        type: ScriptAction.BEEFY,
        valid: true,
        amountType: AmountType.Absolute,
        floatAmount: 12.22,
        floatTip: 1,
        lpAddress: "0x123",
        mooAddress: "0x456",
        action: BeefyActionType.Deposit,
        lpName: "FOO-BAR-LP"
    };

    const bundle: ICurrentScript = {
        id: "0x11111111111",
        description: "lorem ipsum",
        action: {
            title: "FakeAction",
            info: "Whatevs",
            conditions: [],
            form
        },
        conditions: {}
    };

    const fakeProvider: any = {
        getSigner: () => ({ getAddress: () => "0x1234567890" })
    };

    const fakeChain: any = {
        id: "42",
        contracts: { BeefyScriptExecutor: "0x88884444" },
        tokens: tokens
    };

    it("throws an error if BeefyScriptExecutor is not deployed on the chain", async () => {
        const bundleWithWrongAction: ICurrentScript = {
            id: "0x11111111111",
            description: "lorem ipsum",
            action: {
                title: "FakeAction",
                info: "Whatevs",
                conditions: [],
                form: { type: ScriptAction.NONE, valid: true }
            },
            conditions: {}
        };

        const fakeChainWithoutExecutor: any = {
            id: "42",
            contracts: {},
            tokens: tokens
        };

        const gonnaThrowPromise = () =>
            BeefyMessageFactory.create(
                bundleWithWrongAction,
                fakeChainWithoutExecutor,
                fakeProvider
            );
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `The BeefyScriptExecutor has not been deployed on this chain`
        );
    });

    it("throws an error if the action type does not correspond", async () => {
        const bundleWithWrongAction: ICurrentScript = {
            id: "0x11111111111",
            description: "lorem ipsum",
            action: {
                title: "FakeAction",
                info: "Whatevs",
                conditions: [],
                form: { type: ScriptAction.NONE, valid: true }
            },
            conditions: {}
        };

        const gonnaThrowPromise = () =>
            BeefyMessageFactory.create(bundleWithWrongAction, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build Beefy message with this form: ${JSON.stringify({
                type: ScriptAction.NONE,
                valid: true
            })}`
        );
    });

    it("throws an error if the action form is invalid", async () => {
        const invalidForm = JSON.parse(JSON.stringify(form));
        invalidForm.valid = false;
        const bundleWithInvalidForm: ICurrentScript = {
            id: "0x11111111111",
            description: "lorem ipsum",
            action: {
                title: "FakeAction",
                info: "Whatevs",
                conditions: [],
                form: invalidForm
            },
            conditions: {}
        };

        const gonnaThrowPromise = () =>
            BeefyMessageFactory.create(bundleWithInvalidForm, fakeChain, fakeProvider);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            `Cannot build Beefy message with an invalid form`
        );
    });

    it("successfully creates a transfer script", async () => {
        const result = await BeefyMessageFactory.create(bundle, fakeChain, fakeProvider);

        const expectedResult = {
            scriptId: result.scriptId, // <- taken from real object as it is randomly generated
            typeAmt: form.amountType,
            amount: ethers.utils.parseUnits("12.22", 18), // <- token has 18 decimals
            tip: ethers.utils.parseEther("1"),
            action: form.action,
            lpAddress: "0x123",
            mooAddress: "0x456",
            user: "0x1234567890",
            frequency: FrequencyConditionFactory.empty(),
            balance: BalanceConditionFactory.empty(),
            price: PriceConditionFactory.empty(),
            repetitions: RepetitionsConditionFactory.empty(),
            follow: FollowConditionFactory.empty(),
            executor: "0x88884444",
            chainId: BigNumber.from(fakeChain.id)
        } as IBeefyAction;

        assert.deepEqual(result, expectedResult);
    });
});
