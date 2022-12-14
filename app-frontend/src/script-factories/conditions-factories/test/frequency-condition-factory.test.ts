import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { IFrequencyCondition } from "@daemons-fi/shared-definitions";
import { FrequencyConditionFactory } from "../frequency-condition-factory";
import itParam from "mocha-param";
import chai from "chai";
import {
    FrequencyUnits,
    IFrequencyConditionForm,
    ScriptConditions
} from "../../../data/chains-data/condition-form-interfaces";
import { ICurrentScript } from "../../i-current-script";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";

chai.use(require("chai-as-promised"));

describe("Frequency Condition Factory", () => {
    class MockedProvider {
        public constructor(private readonly timestampToReturn: number) {}
        public getBlockNumber = () => Promise.resolve(1);
        public getBlock = () => Promise.resolve({ timestamp: this.timestampToReturn });
    }

    it("creates an empty condition", async () => {
        const empty = FrequencyConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.delay.toNumber()).to.be.equal(0);
        expect(empty.start.toNumber()).to.be.equal(0);
    });

    it("returns an empty condition when trying to build from undefined json", async () => {
        const condition = FrequencyConditionFactory.fromJson();

        assert.deepEqual(condition, FrequencyConditionFactory.empty());
    });

    it("restores condition from json object", async () => {
        const originalCondition: IFrequencyCondition = {
            enabled: true,
            delay: BigNumber.from("125"),
            start: BigNumber.from("5587")
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = FrequencyConditionFactory.fromJson(jsonCondition);

        assert.equal(JSON.stringify(condition), JSON.stringify(originalCondition));
    });


    it("throws error if form is enabled but not valid", async () => {
        const form: IFrequencyConditionForm = {
            type: ScriptConditions.FREQUENCY,
            valid: false,
            ticks: 7,
            unit: FrequencyUnits.Hours,
            startNow: true
        };

        const gonnaThrowPromise = () => FrequencyConditionFactory.fromForm(form, null);
        await expect(gonnaThrowPromise()).to.be.rejectedWith(
            "Cannot build Frequency condition from invalid form"
        );
    });

    describe("creates a condition from an enabled form", () => {
        const form: IFrequencyConditionForm = {
            type: ScriptConditions.FREQUENCY,
            valid: true,
            ticks: 1,
            unit: FrequencyUnits.Hours,
            startNow: true
        };

        it("happy flow", async () => {
            const fakeProvider = new MockedProvider(3600);
            const condition = await FrequencyConditionFactory.fromForm(form, fakeProvider);

            expect(condition.enabled).to.be.true;
            expect(condition.delay.toNumber()).to.be.equal(3600);
            expect(condition.start.toNumber()).to.be.equal(0);
        });

        itParam(
            "delay is calculated based on unit*ticks. Unit:${value.unit}",
            [
                { ticks: 1, unit: FrequencyUnits.Seconds, expectedResult: 1 },
                { ticks: 1, unit: FrequencyUnits.Minutes, expectedResult: 60 },
                { ticks: 1, unit: FrequencyUnits.Hours, expectedResult: 3600 },
                { ticks: 1, unit: FrequencyUnits.Days, expectedResult: 86400 },
                { ticks: 1, unit: FrequencyUnits.Weeks, expectedResult: 604800 }
            ],
            async (params: any) => {
                const newForm = { ...form };
                newForm.ticks = params.ticks;
                newForm.unit = params.unit;

                const fakeProvider = new MockedProvider(150000);
                const condition = await FrequencyConditionFactory.fromForm(newForm, fakeProvider);

                const expectedResult = params.expectedResult;
                expect(condition.enabled).to.be.true;
                expect(condition.delay.toNumber()).to.be.equal(expectedResult);
            }
        );

        itParam(
            "delay is calculated based on unit*ticks. Ticks${value.ticks}",
            [
                { ticks: 1, unit: FrequencyUnits.Seconds, expectedResult: 1 },
                { ticks: 15, unit: FrequencyUnits.Seconds, expectedResult: 15 }
            ],
            async (params: any) => {
                const newForm = { ...form };
                newForm.ticks = params.ticks;
                newForm.unit = params.unit;

                const fakeProvider = new MockedProvider(150000);
                const condition = await FrequencyConditionFactory.fromForm(newForm, fakeProvider);

                const expectedResult = params.expectedResult;
                expect(condition.enabled).to.be.true;
                expect(condition.delay.toNumber()).to.be.equal(expectedResult);
            }
        );

        it("start timestamp is set to the current if startNow is false", async () => {
            const newForm = { ...form, startNow: false };

            const currentTimestamp = 3600;
            const fakeProvider = new MockedProvider(currentTimestamp);
            const condition = await FrequencyConditionFactory.fromForm(newForm, fakeProvider);

            // startNow: false -> we set the current timestamp.
            // the condition will pass only when `current > delay + start`
            // so it will be triggered in `delay` seconds
            expect(condition.start.toNumber()).to.be.equal(currentTimestamp);
        });

        it("start timestamp is set to the current minus the delay if startNow is true", async () => {
            const newForm = { ...form, startNow: true };

            const currentTimestamp = 3600;
            const fakeProvider = new MockedProvider(currentTimestamp);
            const condition = await FrequencyConditionFactory.fromForm(newForm, fakeProvider);

            // startNow: true -> we set the current timestamp - delay.
            // the condition will pass only when `current > delay + start`
            // so it will be triggered immediately
            expect(condition.start.toNumber()).to.be.equal(0); // currentTimestamp - 1h (from the form)
        });
    });

    describe("creates a condition from a bundle", () => {
        const form: IFrequencyConditionForm = {
            type: ScriptConditions.FREQUENCY,
            valid: true,
            ticks: 1,
            unit: FrequencyUnits.Hours,
            startNow: true
        };

        it("happy flow", async () => {
            const bundle: ICurrentScript = {
                id: '0x11111111111',
                description: 'lorem ipsum',
                action: {
                    title: "FakeAction",
                    info: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true }
                },
                conditions: {
                    Frequency: {
                        title: "Frequency",
                        info: "Whatevs",
                        form
                    }
                }
            };

            const currentTimestamp = 3600;
            const fakeProvider = new MockedProvider(currentTimestamp);
            const condition = await FrequencyConditionFactory.fromBundle(bundle, fakeProvider);

            expect(condition.enabled).to.be.true;
            expect(condition.delay.toNumber()).to.be.equal(3600);
            expect(condition.start.toNumber()).to.be.equal(0);
        });

        it("returns an empty form if the balance condition is missing from the bundle", async () => {
            const emptyBundle: ICurrentScript = {
                id: '0x11111111111',
                description: 'lorem ipsum',
                action: {
                    title: "FakeAction",
                    info: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true }
                },
                conditions: {}
            };

            const currentTimestamp = 3600;
            const fakeProvider = new MockedProvider(currentTimestamp);
            const condition = await FrequencyConditionFactory.fromBundle(emptyBundle, fakeProvider);

            assert.deepEqual(condition, FrequencyConditionFactory.empty());
        });
    });
});
