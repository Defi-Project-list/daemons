import { BigNumber } from 'ethers';
import { ChainInfo, ZeroAddress } from '../../data/chain-info';
import { Contracts } from '../../data/contracts';
import { BaseScript } from '../../data/script/base-script';
import { SwapScript } from '../../data/script/swap-script';
import { TransferScript } from '../../data/script/transfer-script';
import { Tokens } from '../../data/tokens';
import { IBalanceCondition, IFrequencyCondition, IPriceCondition } from '../../../../messages/definitions/condition-messages';
import { ISwapAction, domain as swapDomain, types as swapTypes } from '../../../../messages/definitions/swap-action-messages';
import { ITransferAction, domain as transferDomain, types as transferTypes } from '../../../../messages/definitions/transfer-action-messages';
import { ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { IBalanceConditionForm, IFrequencyConditionForm, IPriceConditionForm } from './blocks/conditions/conditions-interfaces';
import { ICreateScriptBundle } from './i-create-script-form';

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

    public constructor() {
        this.ethers = require('ethers');
        this.provider = new this.ethers.providers.Web3Provider((window as any).ethereum, "any");
        this.signer = this.provider.getSigner();
    }

    public async SubmitScriptsForSignature(bundle: ICreateScriptBundle): Promise<BaseScript> {
        const getSignature = async (message: IMessage) => (await this.signer._signTypedData(message.domain, message.types, message.script)) as string;

        switch (bundle.actionForm.action) {
            case ScriptAction.Swap:
                const swapMessage = {
                    script: await this.createSwapScript(bundle),
                    domain: swapDomain,
                    types: swapTypes
                };
                return new SwapScript(swapMessage.script, await getSignature(swapMessage));
            case ScriptAction.Transfer:
                const transferMessage = {
                    script: await this.createTransferScript(bundle),
                    domain: transferDomain,
                    types: transferTypes
                };
                return new TransferScript(transferMessage.script, await getSignature(transferMessage));
            default:
                throw new Error("Not implemented");
        }
    }


    private async createSwapScript(bundle: ICreateScriptBundle): Promise<ISwapAction> {
        const frequencyCondition = await this.createFrequencyConditionFromForm(bundle.frequencyCondition);
        const balanceCondition = this.createBalanceConditionFromForm(bundle.balanceCondition);
        const priceCondition = this.createPriceConditionFromForm(bundle.priceCondition);

        const swapActionForm = bundle.actionForm as ISwapActionForm;
        const tokenFrom = Tokens.Kovan.filter(token => token.address === swapActionForm.tokenFromAddress)[0];
        const amount = BigNumber.from(10).pow(tokenFrom.decimals).mul(swapActionForm.floatAmount);

        return {
            id: this.ethers.utils.hexlify(this.ethers.utils.randomBytes(32)),
            amount: amount,
            tokenFrom: tokenFrom.address,
            tokenTo: swapActionForm.tokenToAddress,
            user: await this.signer.getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            executor: Contracts.SwapExecutor,
        };
    }

    private async createTransferScript(bundle: ICreateScriptBundle): Promise<ITransferAction> {
        const frequencyCondition = await this.createFrequencyConditionFromForm(bundle.frequencyCondition);
        const balanceCondition = this.createBalanceConditionFromForm(bundle.balanceCondition);
        const priceCondition = this.createPriceConditionFromForm(bundle.priceCondition);

        const transferActionForm = bundle.actionForm as ITransferActionForm;
        const token = Tokens.Kovan.filter(token => token.address === transferActionForm.tokenAddress)[0];
        const amount = BigNumber.from(10).pow(token.decimals).mul(transferActionForm.floatAmount);

        return {
            id: this.ethers.utils.hexlify(this.ethers.utils.randomBytes(32)),
            amount: amount,
            token: token.address,
            destination: transferActionForm.destinationAddress,
            user: await this.signer.getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            executor: Contracts.TransferExecutor,
        };
    }

    private async createFrequencyConditionFromForm(frequencyCondition: IFrequencyConditionForm): Promise<IFrequencyCondition> {
        if (!frequencyCondition.enabled) return {
            enabled: false,
            blocks: BigNumber.from(0),
            startBlock: BigNumber.from(0),
        };

        // TODO not sure at all!
        const ticksPerWeek = frequencyCondition.unit / frequencyCondition.ticks;
        const ticksPerDay = ticksPerWeek / 7;
        const blocksPerDay = ChainInfo.Kovan.blocksPerDay;
        const blocks = BigNumber.from(Math.trunc(blocksPerDay / ticksPerDay));

        const currentBlock = BigNumber.from(await this.provider.getBlockNumber());
        const startBlock = frequencyCondition.startNow ? currentBlock.sub(blocks) : currentBlock;

        return {
            enabled: true,
            blocks: blocks,
            startBlock: startBlock,
        };
    }

    private createBalanceConditionFromForm(balanceCondition: IBalanceConditionForm): IBalanceCondition {
        if (!balanceCondition.enabled) return {
            enabled: false,
            amount: BigNumber.from(0),
            comparison: 0,
            token: ZeroAddress,
        };

        const token = Tokens.Kovan.filter(token => token.address === balanceCondition.tokenAddress)[0];
        const amount = BigNumber.from(10).pow(token.decimals).mul(balanceCondition.floatAmount);

        return {
            enabled: true,
            amount: amount,
            comparison: balanceCondition.comparison,
            token: token.address,
        };
    }

    private createPriceConditionFromForm(priceCondition: IPriceConditionForm): IPriceCondition {
        if (!priceCondition.enabled) return {
            enabled: false,
            value: BigNumber.from(0),
            comparison: 0,
            token: ZeroAddress,
        };

        const token = Tokens.Kovan.filter(token => token.address === priceCondition.tokenAddress)[0];
        const value = BigNumber.from(10).pow(token.decimals).mul(priceCondition.floatValue);

        return {
            enabled: true,
            value: value,
            comparison: priceCondition.comparison,
            token: token.address,
        };
    }
}
