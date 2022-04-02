import React, { useState } from 'react';
import { AmountType, ComparisonType } from '@daemons-fi/shared-definitions';
import { INewScriptBundle } from './i-new-script-form';
import { ScriptFactory } from './script-factory';
import { RootState } from '../../state';
import { useDispatch, useSelector } from 'react-redux';
import { ConditionBlock } from './blocks/conditions/conditionBlock';
import { FrequencyCondition } from './blocks/conditions/frequencyCondition';
import { FrequencyUnits, IFollowConditionForm, IPriceConditionForm, IRepetitionsConditionForm } from './blocks/conditions/conditions-interfaces';
import { IBalanceConditionForm, IFrequencyConditionForm } from './blocks/conditions/conditions-interfaces';
import { BalanceCondition } from './blocks/conditions/balanceCondition';
import { PriceCondition } from './blocks/conditions/priceCondition';
import { RepetitionsCondition } from './blocks/conditions/repetitionsCondition';
import { FollowCondition } from './blocks/conditions/followCondition';
import { IBaseMMActionForm, INoActionForm, IScriptActionForm, ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { ActionBlock } from './blocks/actions/actionBlock';
import { TransferAction } from './blocks/actions/transferAction';
import { SwapAction } from './blocks/actions/swapAction';
import { StorageProxy } from '../../data/storage-proxy';
import './styles.css';
import { addNewScript } from '../../state/action-creators/script-action-creators';
import { IToken } from '../../data/tokens';
import { Navigate } from 'react-router-dom';
import { BaseMoneyMarketActionType } from '@daemons-fi/shared-definitions';
import { MmBaseAction } from './blocks/actions/mmBaseAction';
import { GetCurrentChain } from '../../data/chain-info';


export function NewScriptPage(): JSX.Element {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const tokens: IToken[] = useSelector((state: RootState) => state.tokens.currentChainTokens);

    // action forms
    const noActionForm: INoActionForm = { action: ScriptAction.None, valid: false };
    const transferActionForm: ITransferActionForm = { action: ScriptAction.Transfer, valid: false, tokenAddress: '', destinationAddress: '', amountType: AmountType.Absolute, floatAmount: 0 };
    const swapActionForm: ISwapActionForm = { action: ScriptAction.Swap, valid: false, tokenFromAddress: '', tokenToAddress: '', amountType: AmountType.Absolute, floatAmount: 0 };
    const aaveBaseActionForm: IBaseMMActionForm = { action: ScriptAction.MmBase, valid: false, tokenAddress: '', amountType: AmountType.Absolute, floatAmount: 0, actionType: BaseMoneyMarketActionType.Deposit, moneyMarket: GetCurrentChain(chainId!).moneyMarket };

    // states
    const [redirect, setRedirect] = useState<boolean>(false);
    const [actionForm, setActionForm] = useState<IScriptActionForm>(noActionForm);
    const [frequencyCondition, setFrequencyCondition] = useState<IFrequencyConditionForm>({ valid: true, enabled: false, ticks: 1, unit: FrequencyUnits.Hours, startNow: true });
    const [balanceCondition, setBalanceCondition] = useState<IBalanceConditionForm>({ valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatAmount: 0 });
    const [priceCondition, setPriceCondition] = useState<IPriceConditionForm>({ valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatValue: 0 });
    const [repetitionsCondition, setRepetitionsCondition] = useState<IRepetitionsConditionForm>({ valid: false, enabled: false, amount: 0 });
    const [followCondition, setFollowCondition] = useState<IFollowConditionForm>({ valid: false, enabled: false });

    const toggleFrequencyCondition = () => setFrequencyCondition({ ...frequencyCondition, enabled: !frequencyCondition.enabled });
    const toggleBalanceCondition = () => setBalanceCondition({ ...balanceCondition, enabled: !balanceCondition.enabled });
    const togglePriceCondition = () => setPriceCondition({ ...priceCondition, enabled: !priceCondition.enabled });
    const toggleRepetitionsCondition = () => setRepetitionsCondition({ ...repetitionsCondition, enabled: !repetitionsCondition.enabled });
    const toggleFollowCondition = () => setFollowCondition({ ...followCondition, enabled: !followCondition.enabled });

    const setTransferActionAsSelected = () => { if (actionForm.action !== ScriptAction.Transfer) setActionForm(transferActionForm); };
    const setSwapActionAsSelected = () => { if (actionForm.action !== ScriptAction.Swap) setActionForm(swapActionForm); };
    const setMmBaseActionAsSelected = () => { if (actionForm.action !== ScriptAction.MmBase) setActionForm(aaveBaseActionForm); };

    const createBundle = (): INewScriptBundle => ({
        frequencyCondition,
        balanceCondition,
        priceCondition,
        repetitionsCondition,
        followCondition,
        actionForm,
    });

    const createAndSignScript = async () => {
        if (!chainId) throw new Error("Cannot create the script! The chain is unknown");

        const scriptFactory = new ScriptFactory(chainId, tokens);
        const bundle = createBundle();
        const script = await scriptFactory.SubmitScriptsForSignature(bundle);
        if (!await script.hasAllowance()) {
            await script.requestAllowance();
        }
        await StorageProxy.script.saveScript(script);
        dispatch(addNewScript(script));
        setRedirect(true);
    };

    const buttonDisabled = () => {
        const bundle = createBundle();
        const actionIsInvalid = !actionForm.valid;
        const invalidCondition = Object.values(bundle).some(c => c.enabled && !c.valid);
        return actionIsInvalid || invalidCondition;
    };

    const shouldRedirect = redirect || !authenticated || !supportedChain;
    if (shouldRedirect) return <Navigate to="/my-page" />;

    return (
        <div className="new-script">

            {/* Condition Block */}
            <div className="new-script__step new-script__step--condition">
                <div className="new-script__block-title">Condition</div>

                <ConditionBlock
                    title="Frequency"
                    enabled={frequencyCondition.enabled}
                    toggleEnabled={toggleFrequencyCondition}
                >
                    <FrequencyCondition form={frequencyCondition} update={setFrequencyCondition} />
                </ConditionBlock>

                <ConditionBlock
                    title="Balance"
                    enabled={balanceCondition.enabled}
                    toggleEnabled={toggleBalanceCondition}
                >
                    <BalanceCondition form={balanceCondition} update={setBalanceCondition} />
                </ConditionBlock>

                <ConditionBlock
                    title="Price"
                    enabled={priceCondition.enabled}
                    toggleEnabled={togglePriceCondition}
                >
                    <PriceCondition form={priceCondition} update={setPriceCondition} />
                </ConditionBlock>

                <ConditionBlock
                    title="Repetitions"
                    enabled={repetitionsCondition.enabled}
                    toggleEnabled={toggleRepetitionsCondition}
                >
                    <RepetitionsCondition form={repetitionsCondition} update={setRepetitionsCondition} />
                </ConditionBlock>

                <ConditionBlock
                    title="Execute After"
                    enabled={followCondition.enabled}
                    toggleEnabled={toggleFollowCondition}
                >
                    <FollowCondition form={followCondition} update={setFollowCondition} />
                </ConditionBlock>

            </div>

            {/* Action Block */}
            <div className="new-script__step">
                <div className="new-script__block-title">Action</div>

                <ActionBlock
                    title="Transfer"
                    enabled={actionForm.action === ScriptAction.Transfer}
                    toggleEnabled={setTransferActionAsSelected}
                >
                    <TransferAction form={actionForm as ITransferActionForm} update={setActionForm} />
                </ActionBlock>

                <ActionBlock
                    title="Swap"
                    enabled={actionForm.action === ScriptAction.Swap}
                    toggleEnabled={setSwapActionAsSelected}
                >
                    <SwapAction form={actionForm as ISwapActionForm} update={setActionForm} />
                </ActionBlock>

                <ActionBlock
                    title="Aave - Base"
                    enabled={actionForm.action === ScriptAction.MmBase}
                    toggleEnabled={setMmBaseActionAsSelected}
                >
                    <MmBaseAction form={actionForm as IBaseMMActionForm} update={setActionForm} />
                </ActionBlock>

            </div>

            <button
                className="new-script__button"
                disabled={buttonDisabled()}
                onClick={async () => createAndSignScript()}
            >
                {"Sign & Deploy"}
            </button>
        </div >
    );
}
