import { assert, expect } from 'chai';
import { BigNumber } from 'ethers';
import { IFollowCondition } from '@daemons-fi/shared-definitions';
import chai from 'chai';
import { ZeroAddress, ZeroId } from '../../../data/chain-info';
import { FollowConditionFactory } from '../follow-condition-factory';
import Sinon from 'sinon';
import { IFollowConditionForm, ScriptConditions } from "../../../data/chains-data/condition-form-interfaces";
import { ICurrentScript } from "../../i-current-script";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";
const sinon = require('sinon');

chai.use(require('chai-as-promised'));


describe('Follow Condition Factory', () => {

    const AnAddress = '0x0001000100010001000100010001000100010001';
    const AnId = '0x0001000100010001000100010001000100010001000100010001000100010001';

    let stubCall: Sinon.SinonStub<[], any>;

    const fakeExecutor = {
        getRepetitions: (_: string) => Promise.resolve(BigNumber.from(2))
    };

    before(() => {
        stubCall = sinon.stub(FollowConditionFactory, 'getExecutor');
        stubCall.callsFake(() => fakeExecutor);
    });

    after(() => {
        stubCall.reset();
    });

    it('creates an empty condition', async () => {
        const empty = FollowConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.scriptId).to.be.equal(ZeroId);
        expect(empty.executor).to.be.equal(ZeroAddress);
        expect(empty.shift.toNumber()).to.be.equal(0);
    });

    it('returns an empty condition when trying to build from undefined json', async () => {
        const condition = FollowConditionFactory.fromJson();

        assert.deepEqual(condition, FollowConditionFactory.empty());
    });

    it('restores condition from json object', async () => {
        const originalCondition: IFollowCondition = {
            enabled: false,
            scriptId: ZeroId,
            executor: ZeroAddress,
            shift: BigNumber.from(0),
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = FollowConditionFactory.fromJson(jsonCondition);

        assert.deepEqual(condition, originalCondition);
    });

    it('throws error if form is enabled but not valid', async () => {
        const form: IFollowConditionForm = {
            type: ScriptConditions.FOLLOW,
            valid: false,
            parentScriptId: AnId,
            parentScriptExecutor: AnAddress,
        };

        const gonnaThrowPromise = () => FollowConditionFactory.fromForm(form);
        await expect(gonnaThrowPromise()).to.be.rejectedWith('Cannot build Follow condition from invalid form');
    });

    describe('creates a condition from an enabled form', () => {
        const form: IFollowConditionForm = {
            type: ScriptConditions.FOLLOW,
            valid: true,
            parentScriptId: AnId,
            parentScriptExecutor: AnAddress,
        };

        it('happy flow', async () => {
            const condition = await FollowConditionFactory.fromForm(form);

            expect(condition.enabled).to.be.true;
            expect(condition.scriptId).to.be.equal(AnId);
            expect(condition.executor).to.be.equal(AnAddress);
            expect(condition.shift.toNumber()).to.be.equal(2);
        });
    });

    describe('creates a condition from a bundle', () => {
        const form: IFollowConditionForm = {
            type: ScriptConditions.FOLLOW,
            valid: true,
            parentScriptId: AnId,
            parentScriptExecutor: AnAddress,
        };

        it('happy flow', async () => {
            const bundle: ICurrentScript = {
                action: {
                    title: "FakeAction",
                    description: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true}
                },
                conditions: {
                    "Chain Scripts": {
                        title: "Chain Scripts",
                        description: "Whatevs",
                        form
                    }
                }
            }

            const condition = await FollowConditionFactory.fromBundle(bundle);

            expect(condition.enabled).to.be.true;
            expect(condition.scriptId).to.be.equal(AnId);
            expect(condition.executor).to.be.equal(AnAddress);
            expect(condition.shift.toNumber()).to.be.equal(2);
        });

        it('returns an empty form if the balance condition is missing from the bundle', async () => {
            const emptyBundle: ICurrentScript = {
                action: {
                    title: "FakeAction",
                    description: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true}
                },
                conditions: {}
            }

            const condition = await FollowConditionFactory.fromBundle(emptyBundle);

            assert.deepEqual(condition, FollowConditionFactory.empty());
        });

    });
});