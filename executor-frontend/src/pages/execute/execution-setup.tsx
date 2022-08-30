import { Wallet } from "ethers";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ChainsModal } from "../../components/chains-modal";
import { MessageModal } from "../../components/message-modal";
import { Tooltip, TooltipSize } from "../../components/tooltip";
import { ISimplifiedChainInfo } from "../../data/supported-chains";
import "./execution-setup.css";

export interface IExecutionSetupForm {
    chainId: string;
    rpcUrl: string;
    claimInterval: number;
    throttle: number;
    profitsDestination: string;
    executorPrivateKey: string;
    executorAddress: string;
}

export function ExecutionSetup({
    submitSetupData
}: {
    submitSetupData: (data: IExecutionSetupForm) => void;
}) {
    const [displayChains, setDisplayChains] = useState<boolean>(false);
    const [displayWalletMessage, setDisplayWalletMessage] = useState<boolean>(false);
    const [chain, setChain] = useState<ISimplifiedChainInfo | undefined>();
    const [isWalletBtDisabled, setIsWalletBtDisabled] = useState<boolean>(false);
    const [calculatedAddress, setCalculatedAddress] = useState<string>("");

    const {
        register,
        handleSubmit,
        trigger,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            chainId: "",
            rpcUrl: "",
            claimInterval: 20,
            throttle: 5,
            profitsDestination: "",
            executorPrivateKey: "",
            executorAddress: ""
        } as IExecutionSetupForm
    });

    const setChainValue = (chain: ISimplifiedChainInfo) => {
        setChain(chain);
        setValue("chainId", chain.id);
        trigger("chainId");
    };

    const generateRandomWallet = () => {
        const randomWallet = Wallet.createRandom();
        setValue("executorPrivateKey", randomWallet.privateKey);
        setCalculatedAddress(randomWallet.address);
        setValue("executorAddress", randomWallet.address);
        setIsWalletBtDisabled(true);
        trigger("executorPrivateKey");
    };

    const handlePrivateKeyChange = (privateKey: string) => {
        let address = "";
        try {
            address = new Wallet(privateKey).address;
        } catch (error) {}
        setIsWalletBtDisabled(!!privateKey);
        setCalculatedAddress(address);
        setValue("executorAddress", address);
    };

    const chainButton = () => {
        if (!chain)
            return (
                <div className="chain-button" onClick={() => setDisplayChains(true)}>
                    Select Chain
                </div>
            );

        return (
            <div className="chain-button" onClick={() => setDisplayChains(true)}>
                <img className="chain-button__icon" src={chain.iconPath} />
                <div className="chain-button__name">{chain.name}</div>
            </div>
        );
    };

    const RpcURLTooltip = (
        <Tooltip size={TooltipSize.Large}>
            The url used to send Txs to the chain.
            <br />
            You can get free ones with{" "}
            <a className="setup__link" href="https://alchemy.com/?r=DI0MTUwNzY4OTgzN">
                Alchemy
            </a>{" "}
            (300 millions calls/month) or{" "}
            <a className="setup__link" href="https://infura.io/">
                Infura
            </a>{" "}
            (100k calls/day).
            <br />
            For more info, read our documentation.
        </Tooltip>
    );
    const profitsDestinationTooltip = (
        <Tooltip size={TooltipSize.Medium}>Where we'll send the earned DAEM tokens</Tooltip>
    );
    const claimIntervalTooltip = (
        <Tooltip size={TooltipSize.Medium}>
            The amount of successful transactions before the DAEM tokens are claimed and sent to the
            profit destination address
        </Tooltip>
    );
    const throttleTooltip = (
        <Tooltip size={TooltipSize.Medium}>
            The amount of time the system will wait between one execution and the next.
        </Tooltip>
    );
    const walletTooltip = (
        <Tooltip size={TooltipSize.Large}>
            We'll use a throwaway wallet to execute the scripts.
            <br />
            <br />
            You'll have complete control over this wallet: you can import it on your MetaMask and
            send all the funds away from it anytime.
            <br />
        </Tooltip>
    );

    return (
        <div>
            <form className="setup" onSubmit={handleSubmit(submitSetupData)}>
                <div className="setup__line">
                    <div className="setup__text">Chain:</div>
                    <div className="setup__input">
                        {chainButton()}
                        <input type="hidden" {...register("chainId", { required: true })} />
                        {errors.chainId && (
                            <div className="setup__error">Please choose a chain.</div>
                        )}
                    </div>
                </div>

                <div className="setup__line">
                    <div className="setup__text">RPC Url {RpcURLTooltip}</div>
                    <div className="setup__input">
                        <input
                            className="card__input"
                            placeholder="https://polygon-mainnet.g.alchemy.com/v2/<key>"
                            {...register("rpcUrl", {
                                required: true,
                                pattern: /(((https?)|(wss?)):\/\/).*/
                            })}
                        />
                        {errors.rpcUrl && (
                            <div className="setup__error">
                                This doesn't seem a valid RPC url. Remember, you can use either HTTP
                                or WSS urls.
                            </div>
                        )}
                    </div>
                </div>

                <div className="setup__line">
                    <div className="setup__text">
                        Profits destination {profitsDestinationTooltip}
                    </div>
                    <div className="setup__input">
                        <input
                            className="card__input"
                            placeholder="0x123456789..."
                            {...register("profitsDestination", {
                                required: true,
                                pattern: /^0x[a-fA-F0-9]{40}$/
                            })}
                        />
                        {errors.profitsDestination && (
                            <div className="setup__error">Please specify a valid ETH address.</div>
                        )}
                    </div>
                </div>

                <div style={{ display: "None" }} className="setup__line">
                    <div className="setup__text">Claim Interval {claimIntervalTooltip}</div>
                    <input
                        className="card__input"
                        type="number"
                        {...register("claimInterval", { required: true })}
                    />
                </div>

                <div style={{ display: "None" }} className="setup__line">
                    <div className="setup__text">Throttle in seconds {throttleTooltip}</div>
                    <input
                        className="card__input"
                        type="number"
                        {...register("throttle", { required: true })}
                    />
                </div>

                <div className="setup__wallet setup__line">
                    <div className="setup__text">Throwaway Wallet {walletTooltip}</div>
                    <input
                        type="button"
                        value="Generate a new wallet"
                        disabled={isWalletBtDisabled}
                        className="setup__button"
                        onClick={() => setDisplayWalletMessage(true)}
                    />
                </div>

                <div className="setup__line">
                    <div className="setup__text">Private key</div>
                    <div className="setup__input">
                        <input
                            className="card__input"
                            placeholder="5f1d3e19a8dd681651abc165165cac16a516a..."
                            {...register("executorPrivateKey", {
                                required: true,
                                onChange: (e) => handlePrivateKeyChange(e.target.value),
                                pattern: /(0x)?[a-fA-F0-9]{64}/
                            })}
                        />
                        {errors.executorPrivateKey && (
                            <div className="setup__error">This private key seems a bit odd...</div>
                        )}
                    </div>
                </div>

                <div className="setup__line">
                    <div className="setup__text">Address</div>
                    <div className="">{calculatedAddress}</div>
                    <input type="hidden" {...register("executorAddress", { required: true })} />
                </div>

                <input
                    className="setup__button setup__button--submit"
                    type="submit"
                    value="Start"
                />
            </form>

            {/* Modals */}
            <ChainsModal
                isOpen={displayChains}
                hideDialog={() => setDisplayChains(false)}
                selectedChain={chain}
                setSelectedChain={setChainValue}
            />
            <MessageModal
                isOpen={displayWalletMessage}
                hideDialog={() => setDisplayWalletMessage(false)}
                okAction={generateRandomWallet}
            >
                <div className="wallet-message">
                    We will create a new wallet for you, but will <strong>not</strong> store it
                    anywhere.
                    <br /><br />
                    Write it down or import it into your MetaMask.
                    <br /><br />
                    In case of loss, there would be nothing we could do to recover any funds in it.
                </div>
            </MessageModal>
        </div>
    );
}
