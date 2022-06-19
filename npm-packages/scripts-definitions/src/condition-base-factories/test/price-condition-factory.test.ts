import { assert, expect } from 'chai';
import { ethers } from 'ethers';
import { ComparisonType, IPriceCondition } from "@daemons-fi/shared-definitions";
import { PriceFactory } from "../price-factory";
import { ZeroAddress } from "../shared";


describe('Price Factory', () => {

    it('creates an empty condition', async () => {
        const empty = PriceFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.value.toNumber()).to.be.equal(0);
        expect(empty.tokenA).to.be.equal(ZeroAddress);
        expect(empty.tokenB).to.be.equal(ZeroAddress);
        expect(empty.comparison).to.be.equal(0);
        expect(empty.router).to.be.equal(ZeroAddress);
    });

    it('returns an empty condition when trying to build from undefined json', async () => {
        const condition = PriceFactory.fromJson();

        assert.deepEqual(condition, PriceFactory.empty());
    });

    it('restores condition from json object', async () => {
        const originalCondition: IPriceCondition = {
            enabled: true,
            tokenA: '0x123',
            tokenB: '0x456',
            comparison: ComparisonType.GreaterThan,
            value: ethers.utils.parseEther('1.255'),
            router: '0x789',
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = PriceFactory.fromJson(jsonCondition);

        assert.deepEqual(condition, originalCondition);
    });
});
