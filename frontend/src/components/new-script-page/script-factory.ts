import { BigNumber, utils } from 'ethers';
import { ChainInfo, ZeroAddress } from '../../data/chain-info';
import { Contracts } from '../../data/contracts';
import { BaseScript } from '../../data/script/base-script';
import { SwapScript } from '../../data/script/swap-script';
import { TransferScript } from '../../data/script/transfer-script';
import { IBalanceCondition, IFollowCondition, IFrequencyCondition, IMaxRepetitionsCondition, IPriceCondition } from '../../../../messages/definitions/condition-messages';
import { ISwapAction, domain as swapDomain, types as swapTypes } from '../../../../messages/definitions/swap-action-messages';
import { ITransferAction, domain as transferDomain, types as transferTypes } from '../../../../messages/definitions/transfer-action-messages';
import { ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { IBalanceConditionForm, IFollowConditionForm, IFrequencyConditionForm, IPriceConditionForm, IRepetitionsConditionForm } from './blocks/conditions/conditions-interfaces';
import { INewScriptBundle } from './i-new-script-form';
import { Token } from '../../data/tokens';

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


    private async createSwapScript(bundle: INewScriptBundle): Promise<ISwapAction> {
        const frequencyCondition = await this.createFrequencyConditionFromForm(bundle.frequencyCondition);
        const balanceCondition = this.createBalanceConditionFromForm(bundle.balanceCondition);
        const priceCondition = this.createPriceConditionFromForm(bundle.priceCondition);
        const maxRepetitions = this.createRepetitionsConditionFromForm(bundle.repetitionsCondition);
        const followCondition = await this.createFollowConditionFromForm(bundle.followCondition);

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
        const frequencyCondition = await this.createFrequencyConditionFromForm(bundle.frequencyCondition);
        const balanceCondition = this.createBalanceConditionFromForm(bundle.balanceCondition);
        const priceCondition = this.createPriceConditionFromForm(bundle.priceCondition);
        const maxRepetitions = this.createRepetitionsConditionFromForm(bundle.repetitionsCondition);
        const followCondition = await this.createFollowConditionFromForm(bundle.followCondition);

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

        const token = this.tokens.filter(token => token.address === balanceCondition.tokenAddress)[0];
        const amount = utils.parseUnits(balanceCondition.floatAmount.toString(), token.decimals);

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

        const token = this.tokens.filter(token => token.address === priceCondition.tokenAddress)[0];
        const value = utils.parseUnits(priceCondition.floatValue.toString(), token.decimals);

        return {
            enabled: true,
            value: value,
            comparison: priceCondition.comparison,
            token: token.address,
        };
    }

    private createRepetitionsConditionFromForm(repetitionsCondition: IRepetitionsConditionForm): IMaxRepetitionsCondition {
        return {
            enabled: repetitionsCondition.enabled,
            amount: repetitionsCondition.enabled
                ? BigNumber.from(Math.min(repetitionsCondition.amount, 4294967295)) // truncate to uint32
                : BigNumber.from(0),
        };
    }

    private async createFollowConditionFromForm(followCondition: IFollowConditionForm): Promise<IFollowCondition> {
        if (!followCondition.enabled || !followCondition.parentScript) return {
            enabled: false,
            scriptId: '0x0000000000000000000000000000000000000000000000000000000000000000',
            executor: '0x0000000000000000000000000000000000000000',
            shift: BigNumber.from(0),
        };

        // calculate shift (difference between the number of executions of the parent and the child)
        const executorContract = await followCondition.parentScript.getExecutor();
        const shift = await executorContract.getRepetitions(followCondition.parentScript.getId());

        return {
            enabled: followCondition.enabled,
            scriptId: followCondition.parentScript.getId(),
            executor: followCondition.parentScript.getExecutorAddress(),
            shift: shift,
        };
    }
}
