import { bigNumberToFloat } from "@daemons-fi/contracts/build";
import {
    BaseScript,
    ScriptVerification,
    VerificationState
} from "@daemons-fi/scripts-definitions/build";
import { BigNumber, Wallet } from "ethers";
import React, { useEffect, useState } from "react";
import { transferAllDAEM } from "../../data/DAEM-transferer";
import { claimFunds } from "../../data/gas-tank-proxy";
import { fetchWalletBalance, instantiateProvider } from "../../data/info-fetcher-proxy";
import { ScriptProxy } from "../../data/scripts-proxy";
import { ChainInfo, ISimplifiedChainInfo } from "../../data/supported-chains";
import { IExecutorSettings } from "./execution-setup";
import "./execution-state.css";

interface IExecutionStateProps {
    setupData?: IExecutorSettings;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let SHOULD_STOP = false;

export function ExecutionState({ setupData }: IExecutionStateProps) {
    const [chain, setChain] = useState<ISimplifiedChainInfo | undefined>();
    const [ethBalance, setEthBalance] = useState<number>(0);
    const [gasUsed, setGasUsed] = useState<number>(0);
    const [daemBalance, setDaemBalance] = useState<number>(0);
    const [daemClaimable, setDaemClaimable] = useState<number>(0);
    const [daemProfits, setDaemProfits] = useState<number>(0);
    const [scriptsChecked, setScriptsChecked] = useState<number>(0);
    const [successfulExecutions, setSuccessfulExecutions] = useState<number>(0);
    const [failedExecutions, setFailedExecutions] = useState<number>(0);
    const [currentTask, setCurrentTask] = useState<string>("");
    const [startedAt, setStartedAt] = useState<Date | undefined>();

    const fetchBalances = async () => {
        if (!setupData) throw new Error("Setup incomplete");

        setCurrentTask("Fetching balance...");
        const balances = await fetchWalletBalance(
            setupData.chainId,
            setupData.executorAddress,
            setupData.rpcUrl
        );

        setEthBalance(balances.ETHBalance);
        setDaemBalance(balances.DAEMBalance);
        setDaemClaimable(balances.claimableDAEM);
    };

    const tryExecute = async (missingToClaim: number): Promise<void> => {
        try {
            await execute(missingToClaim);
        } catch (error: any) {
            setStartedAt((prev) => undefined);
            setCurrentTask((prev) => `The following error occurred ${error.toString()}`);
        }
    };

    const execute = async (missingToClaim: number): Promise<void> => {
        if (SHOULD_STOP || !(await waitForFunds())) return;

        // fetch scripts
        const scripts = await ScriptProxy.fetchScripts(setupData!.chainId);
        let executed = 0;
        while (scripts.length > 0 && !SHOULD_STOP) {
            const result = await tryExecuteScript(scripts.pop()!);
            if (result) {
                executed++;
                missingToClaim--;
                await sleep(setupData!.throttle * 1000);
            }

            if (missingToClaim <= 0) {
                await claimAndSendFunds();
                missingToClaim += setupData!.claimInterval;
            }
        }

        if (executed) await fetchBalances();
        if (SHOULD_STOP) {
            setCurrentTask((prev) => `Stopped.`);
            return;
        }

        tryExecute(missingToClaim > 0 ? missingToClaim : missingToClaim + setupData!.claimInterval);
    };

    const tryExecuteScript = async (script: BaseScript): Promise<boolean> => {
        const provider = instantiateProvider(setupData!.rpcUrl);
        setCurrentTask((prev) => `Verifying Script ${script.getId().substring(0, 15)}...`);
        setScriptsChecked((prev) => prev + 1);

        let verificationResult: ScriptVerification | undefined = undefined;
        try {
            verificationResult = await script.verify(provider);
        } catch (error) {
            console.log({ msg: "Error during verification", error });
        }
        if (!verificationResult || verificationResult.state !== VerificationState.valid) {
            console.debug({ msg: "Script verification failed" });
            return false;
        }

        console.debug({ message: "Script successfully verified", script });
        const walletSigner = new Wallet(setupData!.executorPrivateKey, provider);
        setCurrentTask((prev) => `Executing script ${script.getId().substring(0, 15)}`);

        try {
            const tx = await script.execute(walletSigner);
            const res = await tx?.wait();

            console.debug({ message: "Execution completed", res });
            res?.status === 1
                ? setSuccessfulExecutions((prev) => prev + 1)
                : setFailedExecutions((prev) => prev + 1);

            const gasUsed = res?.gasUsed ?? BigNumber.from(0);
            const gasPrice = res?.effectiveGasPrice ?? BigNumber.from(0);
            const gasPaid = bigNumberToFloat(gasUsed.mul(gasPrice), 8);
            setGasUsed((prev) => prev + gasPaid);
            return res?.status === 1;
        } catch (error) {
            console.debug({ message: "Exception", error });
            setFailedExecutions((prev) => prev + 1);
            return false;
        }
    };

    const claimAndSendFunds = async () => {
        if (!setupData) throw new Error("Setup incomplete");

        const provider = instantiateProvider(setupData.rpcUrl);
        const walletSigner = new Wallet(setupData.executorPrivateKey, provider);

        // claim DAEM profits
        setCurrentTask((prev) => `Claiming DAEM profits from Gas Tank`);
        const claimed = await claimFunds(setupData.chainId, walletSigner);
        setDaemClaimable(0);

        // if the used wallet is also the destination, we don't need to send any DAEM to it
        if (
            setupData.executorAddress.toLowerCase() === setupData.profitsDestination.toLowerCase()
        ) {
            setDaemProfits((prev) => prev + claimed);
            return;
        }

        // otherwise, let's send all DAEM we have there
        setCurrentTask((prev) => `Transferring earned DAEM to your main wallet`);
        const transferred = await transferAllDAEM(
            setupData.chainId,
            walletSigner,
            setupData.profitsDestination
        );
        setDaemProfits((prev) => prev + transferred);
    };

    const waitForFunds = async () => {
        if (ethBalance < chain!.minCoinsToExecuteScripts) {
            setCurrentTask(
                `Not enough ${chain!.coinName} to execute. Please send at least ${
                    chain?.minCoinsToExecuteScripts
                } to ${setupData?.executorAddress} to trigger the executions`
            );
            setStartedAt(undefined);
            return false;
        }

        return true;
    };

    const startExecuting = async () => {
        console.log("started");
        setStartedAt(new Date());
        SHOULD_STOP = false;
        await fetchBalances();
        tryExecute(setupData!.claimInterval);
    };

    const stopExecuting = async () => {
        setStartedAt(undefined);
        setCurrentTask("Stopping...");
        SHOULD_STOP = true;
    };

    useEffect(() => {
        if (!setupData) return;
        setChain(ChainInfo[setupData.chainId]);
        fetchBalances().then(() => setCurrentTask("Waiting for start..."));
    }, [setupData]);

    if (!setupData || !chain) return <div>Please setup the execution...</div>;

    return (
        <div className="exec-state">
            {!startedAt ? (
                <div className="exec-stat__bt exec-stat__bt--start" onClick={startExecuting}>
                    Start
                </div>
            ) : (
                <div className="exec-stat__bt exec-stat__bt--stop" onClick={stopExecuting}>
                    Stop
                </div>
            )}

            <div className="exec-state__wallet">
                {/* Wallet Balance */}
                <div className="exec-state__title">Wallet Balance</div>
                <div className="exec-state__balances">
                    <div className="exec-state__token-balance">
                        <img className="exec-state__token-icon" src={chain.coinIconPath} />
                        <div className="exec-state__token-amount">{ethBalance}</div>
                    </div>
                    <div className="exec-state__token-balance">
                        <img className="exec-state__token-icon" src="/icons/DAEM.svg" />
                        <div className="exec-state__token-amount">{daemBalance}</div>
                    </div>
                </div>

                {/* Execution Stats */}
                <div className="exec-state__title">Execution Stats</div>
                <div className="exec-state__exec-stats">
                    {!startedAt ? (
                        <div className="exec-state__text">Not started yet</div>
                    ) : (
                        <div className="exec-state__text">
                            Started at: {startedAt.toLocaleDateString()}{" "}
                            {startedAt.toLocaleTimeString()}
                        </div>
                    )}

                    <div className="exec-state__text">Checks: {scriptsChecked}</div>
                    <div className="exec-state__text">
                        Successful executions: {successfulExecutions}
                    </div>
                    <div className="exec-state__text">Failed executions: {failedExecutions}</div>
                    <div className="exec-state__text">
                        DAEM claimed every {setupData!.claimInterval} successful executions
                    </div>
                    <div className="exec-state__text">
                        Gas used:
                        <div className="exec-state__token-balance">
                            <img
                                className="exec-state__token-icon exec-state__token-icon--small"
                                src={chain.coinIconPath}
                            />
                            <div className="exec-state__token-amount">{gasUsed}</div>
                        </div>
                    </div>
                    <div className="exec-state__text">
                        Claimable DAEM:
                        <div className="exec-state__token-balance">
                            <img
                                className="exec-state__token-icon exec-state__token-icon--small"
                                src="/icons/DAEM.svg"
                            />
                            <div className="exec-state__token-amount">{daemClaimable}</div>
                        </div>
                    </div>
                    <div className="exec-state__text">
                        Claimed profits:
                        <div className="exec-state__token-balance">
                            <img
                                className="exec-state__token-icon exec-state__token-icon--small"
                                src="/icons/DAEM.svg"
                            />
                            <div className="exec-state__token-amount">{daemProfits}</div>
                        </div>
                    </div>
                </div>

                {/* Current task */}
                <div className="exec-state__title">Current task</div>
                <div className="exec-state__text">{currentTask}</div>
            </div>
        </div>
    );
}
