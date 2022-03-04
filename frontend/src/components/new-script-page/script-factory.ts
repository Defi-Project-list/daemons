import { BigNumber, Contract, utils } from 'ethers';
import { Contracts } from '../../data/contracts';
import { BaseScript } from '../../data/script/base-script';
import { SwapScript } from '../../data/script/swap-script';
import { TransferScript } from '../../data/script/transfer-script';
import { ISwapAction, domain as swapDomain, types as swapTypes } from '../../../../shared-definitions/scripts/swap-action-messages';
import { ITransferAction, domain as transferDomain, types as transferTypes } from '../../../../shared-definitions/scripts/transfer-action-messages';
import { ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { INewScriptBundle } from './i-new-script-form';
import { Token } from '../../data/tokens';
import { getAbiFor } from '../../utils/get-abi';
import { FrequencyConditionFactory } from '../../data/conditions-factories/frequency-condition-factory';
import { BalanceConditionFactory } from '../../data/conditions-factories/balance-condition-factory';
import { PriceConditionFactory } from '../../data/conditions-factories/price-condition-factory';
import { RepetitionsConditionFactory } from '../../data/conditions-factories/repetitions-condition-factory';
import { FollowConditionFactory } from '../../data/conditions-factories/follow-condition-factory';

type ScriptDefinition = ISwapAction | ITransferAction;

interface IMessage {
    script: ScriptDefinition;
    domain: any;
    types: any;
}

/**
 * Class used to compose the script from the form and ask the user to sign it with metamask.
 * Caches user wallet for internal operations, so do not reuse, create anew every time.
 * */
export class ScriptFactory {

    private readonly ethers: any;
    private readonly provider: any;
    private readonly signer: any;
    private readonly tokens: Token[];
    private readonly chainId: string;

    public constructor(chainId: string, tokens: Token[]) {
        this.ethers = require('ethers');
        this.provider = new this.ethers.providers.Web3Provider((window as any).ethereum, "any");
        this.signer = this.provider.getSigner();
        this.tokens = tokens;
        this.chainId = chainId;
    }

    public async SubmitScriptsForSignature(bundle: INewScriptBundle): Promise<BaseScript> {
        const getSignature = async (message: IMessage) => (await this.signer._signTypedData(message.domain, message.types, message.script)) as string;

        switch (bundle.actionForm.action) {
            case ScriptAction.Swap:
                const swapMessage = {
                    script: await this.createSwapScript(bundle),
                    domain: swapDomain,
                    types: swapTypes
                };
                const swapScriptSignature = await getSignature(swapMessage);
                const swapScriptDescription = SwapScript.getDefaultDescription(swapMessage.script, this.tokens);
                return new SwapScript(swapMessage.script, swapScriptSignature, swapScriptDescription);

            case ScriptAction.Transfer:
                const transferMessage = {
                    script: await this.createTransferScript(bundle),
                    domain: transferDomain,
                    types: transferTypes
                };
                const transferScriptSignature = await getSignature(transferMessage);
                const transferScriptDescription = TransferScript.getDefaultDescription(transferMessage.script, this.tokens);
                return new TransferScript(transferMessage.script, transferScriptSignature, transferScriptDescription);

            default:
                throw new Error("Not implemented");
        }
    }


    private async createSwapScript(bundle: INewScriptBundle): Promise<ISwapAction> {
        const frequencyCondition = await FrequencyConditionFactory.fromForm(bundle.frequencyCondition, this.provider);
        const balanceCondition = BalanceConditionFactory.fromForm(bundle.balanceCondition, this.tokens);
        const priceCondition = PriceConditionFactory.fromForm(bundle.priceCondition, this.tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromForm(bundle.repetitionsCondition);
        const followCondition = await FollowConditionFactory.fromForm(bundle.followCondition);

        const swapActionForm = bundle.actionForm as ISwapActionForm;
        const tokenFrom = this.tokens.filter(token => token.address === swapActionForm.tokenFromAddress)[0];
        const amount = utils.parseUnits(swapActionForm.floatAmount.toString(), tokenFrom.decimals);

        return {
            scriptId: this.ethers.utils.hexlify(this.ethers.utils.randomBytes(32)),
            amount: amount,
            tokenFrom: tokenFrom.address,
            tokenTo: swapActionForm.tokenToAddress,
            user: await this.signer.getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: Contracts.SwapExecutor,
            chainId: BigNumber.from(this.chainId),
        };
    }

    private async createTransferScript(bundle: INewScriptBundle): Promise<ITransferAction> {
        const frequencyCondition = await FrequencyConditionFactory.fromForm(bundle.frequencyCondition, this.provider);
        const balanceCondition = BalanceConditionFactory.fromForm(bundle.balanceCondition, this.tokens);
        const priceCondition = PriceConditionFactory.fromForm(bundle.priceCondition, this.tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromForm(bundle.repetitionsCondition);
        const followCondition = await FollowConditionFactory.fromForm(bundle.followCondition);

        const transferActionForm = bundle.actionForm as ITransferActionForm;
        const token = this.tokens.filter(token => token.address === transferActionForm.tokenAddress)[0];
        const amount = utils.parseUnits(transferActionForm.floatAmount.toString(), token.decimals);

        return {
            scriptId: this.ethers.utils.hexlify(this.ethers.utils.randomBytes(32)),
            amount: amount,
            token: token.address,
            destination: transferActionForm.destinationAddress,
            user: await this.signer.getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: Contracts.TransferExecutor,
            chainId: BigNumber.from(this.chainId),
        };
    }
}
