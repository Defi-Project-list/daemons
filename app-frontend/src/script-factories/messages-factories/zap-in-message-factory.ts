import { BigNumber, ethers, utils } from "ethers";
import { AmountType, IZapInAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IZapInActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";
import { UniswapV2PairABI } from "@daemons-fi/contracts/build";

export class ZapInMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IZapInAction> {
        const zapInActionForm = bundle.action.form as IZapInActionForm;
        if (zapInActionForm.type !== ScriptAction.ZAP_IN)
            throw new Error(
                `Cannot build ZapIn message with this form: ${JSON.stringify(zapInActionForm)}`
            );

        if (!zapInActionForm.valid)
            throw new Error(`Cannot build ZapIn message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = FollowConditionFactory.fromBundle(bundle);

        const tokenA = tokens.filter((token) => token.address === zapInActionForm.tokenA)[0];
        const tokenB = tokens.filter((token) => token.address === zapInActionForm.tokenB)[0];

        let amountA: BigNumber;
        if (zapInActionForm.amountTypeA === AmountType.Absolute) {
            // absolute amount
            amountA = utils.parseUnits(zapInActionForm.floatAmountA.toString(), tokenA.decimals);
        } else {
            // percentage amount
            amountA = BigNumber.from(zapInActionForm.floatAmountA.toString());
        }
        let amountB: BigNumber;
        if (zapInActionForm.amountTypeB === AmountType.Absolute) {
            // absolute amount
            amountB = utils.parseUnits(zapInActionForm.floatAmountB.toString(), tokenB.decimals);
        } else {
            // percentage amount
            amountB = BigNumber.from(zapInActionForm.floatAmountB.toString());
        }

        const tip = utils.parseEther(zapInActionForm.floatTip.toString());

        // make sure that the specified tokens belong to the pair
        // and ***are in the right order*** (very important for the executor contract)
        const keepCurrentOrder = await PairOrderChecker.shouldKeepCurrentOrder(
            zapInActionForm.pair,
            tokenA.address,
            tokenB.address,
            provider
        );

        return {
            scriptId: bundle.id,
            typeAmtA: keepCurrentOrder ? zapInActionForm.amountTypeA : zapInActionForm.amountTypeB,
            typeAmtB: keepCurrentOrder ? zapInActionForm.amountTypeB : zapInActionForm.amountTypeA,
            amountA: keepCurrentOrder ? amountA : amountB,
            amountB: keepCurrentOrder ? amountB : amountA,
            tip: tip,
            pair: zapInActionForm.pair,
            kontract: zapInActionForm.dex.poolAddress,
            user: await provider.getSigner().getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: chain.contracts.ZapInScriptExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}

export class PairOrderChecker {
    public static async shouldKeepCurrentOrder(
        pairAddress: string,
        tokenA: string,
        tokenB: string,
        provider: any
    ): Promise<boolean> {
        if (tokenA === tokenB) throw new Error("TokenA and TokenB are the same token");

        const pair = new ethers.Contract(pairAddress, UniswapV2PairABI, provider);
        const token0 = await pair.token0();
        const token1 = await pair.token1();
        tokenA = ethers.utils.getAddress(tokenA);
        tokenB = ethers.utils.getAddress(tokenB);
        if (token0 !== tokenA && token0 !== tokenB) throw new Error("Token0 of pair not found");
        if (token1 !== tokenA && token1 !== tokenB) throw new Error("token1 of pair not found");

        return token0 === tokenA;
    }
}
