import { bigNumberToFloat } from "@daemons-fi/contracts/build";
import { BaseScript, VerificationState } from "@daemons-fi/scripts-definitions/build";
import { BigNumber, Wallet } from "ethers";
import React, { useEffect, useState } from "react";
import { fetchWalletBalance, instantiateProvider } from "../../data/info-fetcher-proxy";
import { ScriptProxy } from "../../data/scripts-proxy";
import { ChainInfo, ISimplifiedChainInfo } from "../../data/supported-chains";
import { IExecutionSetupForm } from "./execution-setup";
import "./execution-state.css";

interface IExecutionStateProps {
    setupData?: IExecutionSetupForm;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ExecutionState({ setupData }: IExecutionStateProps) {
    const [chain, setChain] = useState<ISimplifiedChainInfo | undefined>();
    const [ethBalance, setEthBalance] = useState<number>(0);
    const [gasUsed, setGasUsed] = useState<number>(0);
    const [daemBalance, setDaemBalance] = useState<number>(0);
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
    };

    const execute = async () => {
        await waitForFunds();

        // fetch scripts
        const scripts = await ScriptProxy.fetchScripts(setupData!.chainId);
        console.debug({ msg: "fetched scripts", scripts });
        let executed = 0;
        while (scripts.length > 0) {
            const result = await tryExecuteScript(scripts.pop()!);
            if (result) executed++;
        }

        if (executed) await fetchBalances();
        await execute();
    };

    const tryExecuteScript = async (script: BaseScript): Promise<boolean> => {
        const provider = instantiateProvider(setupData!.rpcUrl);
        const verificationResult = await script.verify(provider);
        setScriptsChecked(scriptsChecked + 1);
        if (verificationResult.state !== VerificationState.valid) {
            console.debug({ msg: "Script verification failed" });
            return false;
        }

        console.debug({ message: "Script successfully verified", script });
        const walletSigner = new Wallet(setupData!.executorPrivateKey, provider);
        setCurrentTask((prev) => `Executing script ${script.getId()}`);

        try {
            const tx = await script.execute(walletSigner);
            const res = await tx?.wait();

            console.debug({ message: "Execution completed", res });
            res?.status === 1
                ? setSuccessfulExecutions((prev) => prev + 1)
                : setFailedExecutions((prev) => prev + 1);

            const gasUsed = res?.gasUsed ?? BigNumber.from(0)
            const gasPrice = res?.effectiveGasPrice ?? BigNumber.from(0)
            const gasPaid = bigNumberToFloat(gasUsed.mul(gasPrice), 8);
            setGasUsed((prev) => prev + gasPaid);
            return res?.status === 1;
        } catch (error) {
            console.debug({ message: "Exception", error });
            setFailedExecutions((prev) => prev + 1);
            return false;
        }
    };

    const waitForFunds = async () => {
        while (ethBalance < chain!.minCoinsToExecuteScripts) {
            setCurrentTask(
                `Not enough ${chain!.coinName} to execute. Please send at least ${
                    chain?.minCoinsToExecuteScripts
                } to ${setupData?.executorAddress} to trigger the executions`
            );
            await sleep(30000); //sleep 30 seconds;
            await fetchBalances();
        }
    };

    const startExecuting = async () => {
        setStartedAt(new Date());
        execute();
    };

    const stopExecuting = async () => {
        setStartedAt(undefined);
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
                        Gas used:
                        <div className="exec-state__token-balance">
                            <img
                                className="exec-state__token-icon exec-state__token-icon--small"
                                src={chain.coinIconPath}
                            />
                            <div className="exec-state__token-amount">{gasUsed}</div>
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
