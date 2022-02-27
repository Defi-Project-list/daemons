import { BigNumber, Contract, utils } from 'ethers';
import { GetCurrentChain, ZeroAddress } from '../../data/chain-info';
import { Contracts } from '../../data/contracts';
import { BaseScript } from '../../data/script/base-script';
import { SwapScript } from '../../data/script/swap-script';
import { TransferScript } from '../../data/script/transfer-script';
import { IBalanceCondition, IFollowCondition, IFrequencyCondition, IMaxRepetitionsCondition, IPriceCondition } from '../../../../shared-definitions/scripts/condition-messages';
import { ISwapAction, domain as swapDomain, types as swapTypes } from '../../../../shared-definitions/scripts/swap-action-messages';
import { ITransferAction, domain as transferDomain, types as transferTypes } from '../../../../shared-definitions/scripts/transfer-action-messages';
import { ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { IBalanceConditionForm, IFollowConditionForm, IFrequencyConditionForm, IPriceConditionForm, IRepetitionsConditionForm } from './blocks/conditions/conditions-interfaces';
import { INewScriptBundle } from './i-new-script-form';
import { Token } from '../../data/tokens';
import { getAbiFor } from '../../utils/get-abi';

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
            delay: BigNumber.from(0),
            start: BigNumber.from(0),
        };

        const delay = BigNumber.from(frequencyCondition.unit).mul(BigNumber.from(frequencyCondition.ticks));

        // getting timestamp
        const latestBlockNumber = await this.provider.getBlockNumber();
        const latestBlock = await this.provider.getBlock(latestBlockNumber);
        const latestBlockTimestamp = BigNumber.from(latestBlock.timestamp);
        const start = frequencyCondition.startNow ? latestBlockTimestamp.sub(delay) : latestBlockTimestamp;

        return {
            enabled: true,
            delay,
            start,
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
        if (!followCondition.enabled || !followCondition.parentScriptId || !followCondition.parentScriptExecutor) {
            return {
                enabled: false,
                scriptId: '0x0000000000000000000000000000000000000000000000000000000000000000',
                executor: '0x0000000000000000000000000000000000000000',
                shift: BigNumber.from(0),
            };
        }

        // calculate shift (difference between the number of executions of the parent and the child)
        const executorContract = await this.getExecutor(followCondition.parentScriptExecutor);
        const shift = await executorContract.getRepetitions(followCondition.parentScriptId);

        return {
            enabled: followCondition.enabled,
            scriptId: followCondition.parentScriptId,
            executor: followCondition.parentScriptExecutor,
            shift: shift,
        };
    }

    private async getExecutor(executorAddress: string): Promise<Contract> {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAbi = await getAbiFor('ConditionsChecker');
        return new ethers.Contract(executorAddress, contractAbi, signer);
    }
}
