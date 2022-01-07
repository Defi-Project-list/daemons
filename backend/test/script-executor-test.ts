import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { ComparisonType } from '../messages/condition-messages';
import { domain, ISwapAction, types } from "../messages/swap-action-messages";

describe("SwapperScriptExecutor", function () {

    let owner: SignerWithAddress;

    // contracts
    let BRG: Contract;
    let gasTank: Contract;
    let executor: Contract;
    let fooToken: Contract;
    let barToken: Contract;
    let mockRouter: Contract;

    // signature components
    let sigR: string;
    let sigS: string;
    let sigV: number;

    let baseMessage: ISwapAction = {
        id: '0x7465737400000000000000000000000000000000000000000000000000000000',
        tokenFrom: '',
        tokenTo: '',
        amount: ethers.utils.parseEther("145"),
        user: '',
        executor: '',
        balance: {
            enabled: false,
            amount: ethers.utils.parseEther("150"),
            token: '',
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

        // instantiate Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
        barToken = await MockTokenContract.deploy("Bar Token", "BAR");

        // instantiate Mock router contract
        const MockRouterContract = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouterContract.deploy();

        // Executor contract
        const SwapperScriptExecutorContract = await ethers.getContractFactory("SwapperScriptExecutor");
        executor = await SwapperScriptExecutorContract.deploy();
        await executor.setGasTank(gasTank.address);
        await executor.setBrgToken(BRG.address);
        await executor.setExchange(mockRouter.address);

        // Create message
        const message = { ...baseMessage };
        message.user = owner.address;
        message.executor = executor.address;
        message.tokenFrom = fooToken.address;
        message.tokenTo = barToken.address;
        message.balance.token = fooToken.address;

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

    it("fails if the script has been revoked by the user", async () => {
        const message = await initialize(baseMessage);

        // revoke the script execution
        await executor.revoke(message.id);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('Script has been revoked by the user');
    });

    it('fails the verification if frequency is enabled and the start block has not been reached', async () => {
        // update frequency in message and submit for signature
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.frequency.enabled = true;
        message.frequency.blocks = BigNumber.from(0);
        message.frequency.startBlock = BigNumber.from(100000000);
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Frequency Condition] Start block has not been reached yet');
    });

    it('fails the verification if frequency is enabled and not enough blocks passed since start block', async () => {
        // update frequency in message and submit for signature
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.frequency.enabled = true;
        message.frequency.blocks = BigNumber.from(1000000);
        message.frequency.startBlock = BigNumber.from(0);
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Frequency Condition] Not enough time has passed since the start block');
    });

    it('fails the verification if balance is enabled and the user does not own enough tokens', async () => {
        // update balance in message and submit for signature
        // enabling it will be enough as the condition is "FOO_TOKEN>150"
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.balance.enabled = true;
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Balance Condition] User does not own enough tokens');
    });

    it('fails the verification if balance is enabled and the user owns too many tokens', async () => {
        // update frequency in message and submit for signature
        // we'll change the comparison so it will become "FOO_TOKEN<150"
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.balance.enabled = true;
        message.balance.comparison = ComparisonType.LessThan;
        message = await initialize(message);

        // add tokens to the user address so the check will fail
        await fooToken.mint(owner.address, ethers.utils.parseEther("200"));

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Balance Condition] User owns too many tokens');
    });

    it('fails if the user does not have enough funds in the gas tank', async () => {
        const message = await initialize(baseMessage);

        // empty the gas tank and try to verify the message
        await gasTank.withdrawAll();
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Gas Condition] Not enough gas in the tank');
    });

    it('swaps the tokens', async () => {
        let message = JSON.parse(JSON.stringify(baseMessage));
        message = await initialize(message);

        await fooToken.mint(owner.address, ethers.utils.parseEther("200"));

        // giving allowance. This will have to be another check!
        await fooToken.approve(executor.address, ethers.utils.parseEther("250"));
        await executor.execute(message, sigR, sigS, sigV);

        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("55"));
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("145"));
    });
});
