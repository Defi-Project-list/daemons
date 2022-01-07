import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { BigNumber, Contract, utils } from 'ethers';
import { ethers } from 'hardhat';
import { ComparisonType } from '../messages/condition-messages';
import { domain, ISwapAction, types } from "../messages/swap-action-messages";

describe("SwapperScriptExecutor", function () {

    let owner: SignerWithAddress;

    // contracts
    let BRG: Contract;
    let gasTank: Contract;
    let executor: Contract;

    // signature components
    let sigR: string;
    let sigS: string;
    let sigV: number;

    let baseMessage: ISwapAction = {
        id: '0x7465737400000000000000000000000000000000000000000000000000000000',
        tokenFrom: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
        tokenTo: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
        amount: ethers.utils.parseEther("100"),
        user: '',
        executor: '',
        balance: {
            enabled: false,
            amount: BigNumber.from(0),
            token: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
            comparison: ComparisonType.GreaterThan,
        },
        frequency: {
            enabled: false,
            blocks: BigNumber.from(0),
            startBlock: BigNumber.from(0),
        }
    };

    async function initialize(baseMessage: ISwapAction): Promise<ISwapAction> {
        // get some wallets
        [owner] = await ethers.getSigners();

        // Balrog contract
        const BalrogTokenContract = await ethers.getContractFactory("BalrogToken");
        BRG = await BalrogTokenContract.deploy();

        // GasTank contract
        const GasTankContract = await ethers.getContractFactory("GasTank");
        gasTank = await GasTankContract.deploy();
        await gasTank.deposit({ value: ethers.utils.parseEther("2.0") });

        // Executor contract
        const SwapperScriptExecutorContract = await ethers.getContractFactory("SwapperScriptExecutor");
        executor = await SwapperScriptExecutorContract.deploy();
        await executor.setGasTank(gasTank.address);

        // Create message
        const message = { ...baseMessage };
        message.user = owner.address;
        message.executor = executor.address;
        message.balance.token = BRG.address; // let's set BRG as token in the balance condition

        // Sign message
        const signature = await owner._signTypedData(domain, types, message);
        const split = ethers.utils.splitSignature(signature);
        [sigR, sigS, sigV] = [split.r, split.s, split.v];

        // Return updated message
        return message;
    }

    it("verifies a correct message with no conditions", async () => {
        const message = await initialize(baseMessage);
        await executor.verify(message, sigR, sigS, sigV);
        // no error means success!
    });

    it("spots a tampered message with no conditions", async () => {
        const message = await initialize(baseMessage);
        const tamperedMessage = { ...message };
        tamperedMessage.amount = ethers.utils.parseEther("0");

        await expect(executor.verify(tamperedMessage, sigR, sigS, sigV)).to.be.revertedWith('Signature does not match');
    });

    it('fails the verification if frequency is enabled and the start block has not been reached', async () => {
        // update frequency in message and submit for signature
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.frequency.enabled = true;
        message.frequency.blocks = BigNumber.from(0);
        message.frequency.startBlock = BigNumber.from(100000000);
        message = await initialize(message);

        // this should fail as the start block has not been reached yet
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Frequency Condition] Start block has not been reached yet');
    });

    it('fails the verification if frequency is enabled and not enough blocks passed since start block', async () => {
        // update frequency in message and submit for signature
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.frequency.enabled = true;
        message.frequency.blocks = BigNumber.from(1000000);
        message.frequency.startBlock = BigNumber.from(0);
        message = await initialize(message);

        // this should fail as the start block has not been reached yet
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Frequency Condition] Not enough time has passed since the start block');
    });

    it('fails the verification if balance is enabled and the user does not own enough tokens', async () => {
        // update balance in message and submit for signature
        // enabling it will be enough as the condition is "DAI>0"
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.balance.enabled = true;
        message = await initialize(message);

        // this should fail as the start block has not been reached yet
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Balance Condition] User does not own enough tokens');
    });

    it('fails the verification if balance is enabled and the user owns too many tokens', async () => {
        // update frequency in message and submit for signature
        // we'll change the comparison so it will become "DAI<0" and it will always fail
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.balance.enabled = true;
        message.balance.comparison = ComparisonType.LessThan;
        message = await initialize(message);

        // this should fail as the start block has not been reached yet
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Balance Condition] User owns too many tokens');
    });

    it('fails if the user does not have enough funds in the gas tank', async () => {
        const message = await initialize(baseMessage);

        // empty the gas tank and try to verify the message
        await gasTank.withdrawAll();
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Gas Condition] Not enough gas in the tank');
    });
});
