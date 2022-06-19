import { assert, expect } from "chai";
import { ethers, utils } from "ethers";
import itParam from "mocha-param";
import { ComparisonType, IPriceCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress } from "../../../data/chain-info";
import { PriceConditionFactory } from "../price-condition-factory";
import { DEX, Token } from "../../../data/chains-data/interfaces";
import {
    IPriceConditionForm,
    ScriptConditions
} from "../../../data/chains-data/condition-form-interfaces";
import { ICurrentScript } from "../../i-current-script";
import { ScriptAction } from "../../../data/chains-data/action-form-interfaces";

describe("Price Condition Factory", () => {
    const tokens: Token[] = [
        {
            name: "FooToken",
            symbol: "FOO",
            address: "0x123",
            logoURI: "",
            decimals: 18
        },
        {
            name: "BarToken",
            symbol: "BAR",
            address: "0x456",
            logoURI: "",
            decimals: 18
        }
    ];

    const fakeDEX: DEX = {
        name: "Sushi",
        poolAddress: "0x789"
    };

    it("creates an empty condition", async () => {
        const empty = PriceConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.value.toNumber()).to.be.equal(0);
        expect(empty.tokenA).to.be.equal(ZeroAddress);
        expect(empty.tokenB).to.be.equal(ZeroAddress);
        expect(empty.router).to.be.equal(ZeroAddress);
        expect(empty.comparison).to.be.equal(0);
    });

    it("returns an empty condition when trying to build from undefined json", async () => {
        const condition = PriceConditionFactory.fromJson();

        assert.deepEqual(condition, PriceConditionFactory.empty());
    });

    it("restores condition from json object", async () => {
        const originalCondition: IPriceCondition = {
            enabled: true,
            value: ethers.utils.parseEther("1.255"),
            comparison: ComparisonType.GreaterThan,
            tokenA: tokens[0].address,
            tokenB: tokens[1].address,
            router: fakeDEX.poolAddress
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = PriceConditionFactory.fromJson(jsonCondition);

        assert.equal(JSON.stringify(condition), JSON.stringify(originalCondition));
    });

    it("throws error if form is enabled but not valid", async () => {
        const form: IPriceConditionForm = {
            type: ScriptConditions.PRICE,
            valid: false,
            tokenA: tokens[0].address,
            tokenB: tokens[1].address,
            dex: fakeDEX,
            comparison: ComparisonType.GreaterThan,
            floatValue: 125.554
        };

        const gonnaThrow = () => PriceConditionFactory.fromForm(form, tokens);
        expect(gonnaThrow).to.throw("Cannot build Price condition from invalid form");
    });

    describe("creates a condition from an enabled form", () => {
        const form: IPriceConditionForm = {
            type: ScriptConditions.PRICE,
            valid: true,
            tokenA: tokens[0].address,
            tokenB: tokens[1].address,
            dex: fakeDEX,
            comparison: ComparisonType.GreaterThan,
            floatValue: 125.554
        };

        it("happy flow", async () => {
            const condition = PriceConditionFactory.fromForm(form, tokens);

            expect(condition.enabled).to.be.true;
            expect(condition.comparison).to.be.equal(ComparisonType.GreaterThan);
            expect(condition.tokenA).to.be.equal(tokens[0].address);
            expect(condition.tokenB).to.be.equal(tokens[1].address);
            expect(condition.router).to.be.equal(fakeDEX.poolAddress);
            expect(condition.value.toHexString()).to.be.equal(
                ethers.utils.parseEther("125.554").toHexString()
            );
        });

        itParam(
            "condition value depends on tokenB decimals: ${value}",
            [18, 8, 6],
            async (decimals: number) => {
                const newTokens: Token[] = [
                    {
                        name: "FooToken",
                        symbol: "FOO",
                        address: "0x123",
                        logoURI: "",
                        decimals: 18
                    },
                    {
                        name: "BarToken",
                        symbol: "BAR",
                        address: "0x456",
                        logoURI: "",
                        decimals: decimals
                    }
                ];

                const condition = PriceConditionFactory.fromForm(form, newTokens);

                const expectedAmount = utils.parseUnits(form.floatValue.toString(), decimals);
                expect(condition.value.toHexString()).to.be.equal(expectedAmount.toHexString());
            }
        );
    });

    describe("creates a condition from a bundle", () => {
        const form: IPriceConditionForm = {
            type: ScriptConditions.PRICE,
            valid: true,
            tokenA: tokens[0].address,
            tokenB: tokens[1].address,
            dex: fakeDEX,
            comparison: ComparisonType.GreaterThan,
            floatValue: 125.554
        };

        it("happy flow", async () => {
            const bundle: ICurrentScript = {
                id: "0x11111111111",
                description: "lorem ipsum",
                action: {
                    title: "FakeAction",
                    info: "Whatevs",
                    conditions: [],
                    form: { type: ScriptAction.NONE, valid: true }
                },
                conditions: {
                    Price: {
                        title: "Price",
                        info: "Whatevs",
                        form
                    }
                }
            };

            const condition = PriceConditionFactory.fromBundle(bundle, tokens);

            expect(condition.enabled).to.be.true;
            expect(condition.comparison).to.be.equal(ComparisonType.GreaterThan);
            expect(condition.tokenA).to.be.equal(tokens[0].address);
            expect(condition.tokenB).to.be.equal(tokens[1].address);
            expect(condition.router).to.be.equal(fakeDEX.poolAddress);
            expect(condition.value.toHexString()).to.be.equal(
                ethers.utils.parseEther("125.554").toHexString()
            );
        });

        it("returns an empty form if the price condition is missing from the bundle", async () => {
            const emptyBundle: ICurrentScript = {
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

            const condition = PriceConditionFactory.fromBundle(emptyBundle, tokens);

            assert.deepEqual(condition, PriceConditionFactory.empty());
        });
    });
});
