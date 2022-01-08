import { BigNumber } from 'ethers';
import { ChainInfo, ZeroAddress } from '../../data/chain-info';
import { Contracts } from '../../data/contracts';
import { Tokens } from '../../data/tokens';
import { IBalanceCondition, IFrequencyCondition } from '../../messages/condition-messages';
import { ISwapAction, domain as swapDomain, types as swapTypes } from '../../messages/swap-action-messages';
import { ISwapActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { IBalanceConditionForm, IFrequencyConditionForm } from './blocks/conditions/conditions-interfaces';
import { ICreateScriptBundle } from './i-create-script-form';

type ScriptDefinition = ISwapAction;

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

    public async SubmitScriptsForSignature(bundle: ICreateScriptBundle): Promise<string> {
        console.log("HEHE");
        const message = await this.createScript(bundle);
        const signature: string = await this.signer._signTypedData(message.domain, message.types, message.script);
        return signature;
    }

    private async createScript(bundle: ICreateScriptBundle): Promise<IMessage> {
        switch (bundle.actionForm.action) {
            case ScriptAction.Swap:
                return {
                    script: await this.createSwapScript(bundle),
                    domain: swapDomain,
                    types: swapTypes
                };
            default:
                throw new Error("Not implemented");
        }

    }

    private async createSwapScript(bundle: ICreateScriptBundle): Promise<ISwapAction> {
        const frequencyCondition = await this.createFrequencyConditionFromForm(bundle.frequencyCondition);
        const balanceCondition = this.createBalanceConditionFromForm(bundle.balanceCondition);

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
            executor: Contracts.SwapExecutor
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
}
