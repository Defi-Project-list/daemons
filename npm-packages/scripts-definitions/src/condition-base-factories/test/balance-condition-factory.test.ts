import { assert, expect } from 'chai';
import { ethers } from 'ethers';
import { ComparisonType, IBalanceCondition } from "@daemons-fi/shared-definitions";
import { BalanceFactory } from "../balance-factory";
import { ZeroAddress } from "../shared";


describe('Balance Factory', () => {

    it('creates an empty condition', async () => {
        const empty = BalanceFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.amount.toNumber()).to.be.equal(0);
        expect(empty.token).to.be.equal(ZeroAddress);
        expect(empty.comparison).to.be.equal(0);
    });

    it('returns an empty condition when trying to build from undefined json', async () => {
        const condition = BalanceFactory.fromJson();

        assert.deepEqual(condition, BalanceFactory.empty());
    });

    it('restores condition from json object', async () => {
        const originalCondition: IBalanceCondition = {
            enabled: true,
            token: '0x123',
            comparison: ComparisonType.GreaterThan,
            amount: ethers.utils.parseEther('1.255'),
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = BalanceFactory.fromJson(jsonCondition);

        assert.deepEqual(condition, originalCondition);
    });
});
