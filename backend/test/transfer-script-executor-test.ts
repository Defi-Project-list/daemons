import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { ComparisonType } from '../../messages/definitions/condition-messages';
import { domain, ITransferAction, types } from "../../messages/definitions/transfer-action-messages";

describe("TransferScriptExecutor", function () {

    let owner: SignerWithAddress;
    let otherWallet: SignerWithAddress;

    // contracts
    let BRG: Contract;
    let gasTank: Contract;
    let priceRetriever: Contract;
    let executor: Contract;
    let fooToken: Contract;

    // signature components
    let sigR: string;
    let sigS: string;
    let sigV: number;

    let baseMessage: ITransferAction = {
        scriptId: '0x7465737400000000000000000000000000000000000000000000000000000000',
        token: '',
        destination: '',
        amount: ethers.utils.parseEther("145"),
        user: '',
        executor: '',
        chainId: BigNumber.from(42),
        balance: {
            enabled: false,
            amount: ethers.utils.parseEther("150"),
            token: '',
            comparison: ComparisonType.GreaterThan,
        },
        frequency: {
            enabled: false,
            blocks: BigNumber.from(5),
            startBlock: BigNumber.from(0),
        },
        price: {
            enabled: false,
            token: '',
            comparison: ComparisonType.GreaterThan,
            value: ethers.utils.parseEther("150"),
        },
        repetitions: {
            enabled: false,
            amount: BigNumber.from(0),
        },
    };

    this.beforeEach(async () => {
        // get main wallet
        [owner, otherWallet] = await ethers.getSigners();

        // Balrog contract
        const BalrogTokenContract = await ethers.getContractFactory("BalrogToken");
        BRG = await BalrogTokenContract.deploy();

        // GasTank contract
        const GasTankContract = await ethers.getContractFactory("GasTank");
        gasTank = await GasTankContract.deploy();
        await gasTank.deposit({ value: ethers.utils.parseEther("2.0") });

        // Price retriever contract
        const PriceRetrieverContract = await ethers.getContractFactory("PriceRetriever");
        priceRetriever = await PriceRetrieverContract.deploy();

        // Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");

        // Executor contract
        const TransferScriptExecutorContract = await ethers.getContractFactory("TransferScriptExecutor");
        executor = await TransferScriptExecutorContract.deploy();
        await executor.setGasTank(gasTank.address);
        await executor.setBrgToken(BRG.address);
        await executor.setPriceRetriever(priceRetriever.address);

        // Grant allowance
        await fooToken.approve(executor.address, ethers.utils.parseEther("500"));
    });

    async function initialize(baseMessage: ITransferAction): Promise<ITransferAction> {
        // Create message and fill missing info
        const message = { ...baseMessage };
        message.user = owner.address;
        message.executor = executor.address;
        message.token = fooToken.address;
        message.destination = otherWallet.address;
        message.balance.token = fooToken.address;
        message.price.token = fooToken.address;

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

    it("spots a valid message from another chain", async () => {
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.chainId = BigNumber.from('1'); // message created for the Ethereum chain
        message = await initialize(message);

        // as the contract is created on chain 42, it will refuse to execute this message
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('Wrong chain');
    });

    it('transfers the tokens', async () => {
        let message = JSON.parse(JSON.stringify(baseMessage));
        message = await initialize(message);
        await fooToken.mint(owner.address, ethers.utils.parseEther("200"));

        await executor.execute(message, sigR, sigS, sigV);

        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("55"));

        // the destination got his tokens
        expect(await fooToken.balanceOf(otherWallet.address)).to.equal(ethers.utils.parseEther("145"));
    });

    it('transferring is cheap', async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000175302855780080 ETH.

        const message = await initialize(baseMessage);
        await fooToken.mint(owner.address, ethers.utils.parseEther("200"));

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.0002");
        console.log("Spent for transfer:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it('sets the lastExecution value during execution', async () => {
        let message = JSON.parse(JSON.stringify(baseMessage));

        // enable frequency condition so 2 consecutive executions should fail
        message.frequency.enabled = true;
        message = await initialize(message);
        await fooToken.mint(owner.address, ethers.utils.parseEther("2000"));

        // the first one goes through
        await executor.execute(message, sigR, sigS, sigV);

        // the second one fails as not enough blocks have passed
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Frequency Condition] Not enough time has passed since the last execution');
    });

    /* ========== REVOCATION CONDITION CHECK ========== */

    it("fails if the script has been revoked by the user", async () => {
        const message = await initialize(baseMessage);

        // revoke the script execution
        await executor.revoke(message.scriptId);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('Script has been revoked by the user');
    });


    /* ========== FREQUENCY CONDITION CHECK ========== */

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


    /* ========== BALANCE CONDITION CHECK ========== */

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


    /* ========== PRICE CONDITION CHECK ========== */

    it('fails the verification if price is enabled, but token is not supported', async () => {
        // update price in message and submit for signature.
        // Condition: FOO > 150
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // executor has no price feed for the token, so it should fail
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[PriceRetriever] Unsupported token');
    });

    it('fails the verification if price is enabled with GREATER_THAN condition and tokenPrice < value', async () => {
        // update price in message and submit for signature.
        // Condition: FOO > 150
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // define FOO token price and feed decimals
        const fooDecimals = 18;
        const feedDecimals = 8;
        const fooPrice = BigNumber.from('149').mul(BigNumber.from(10).pow(BigNumber.from(feedDecimals))); // 149 * 10**8

        // add feed for FOO token
        const mockFooPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const fooPriceFeed = await mockFooPriceFeed.deploy(fooPrice);
        await priceRetriever.addPriceFeed(fooToken.address, fooPriceFeed.address, fooDecimals, feedDecimals);

        // verification should fail as the price lower than expected
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Price Condition] Token price is lower than expected value');
    });

    it('fails the verification if price is enabled with LESS_THAN condition and tokenPrice > value', async () => {
        // update price in message and submit for signature.
        // Condition: FOO < 150
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.LessThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // define FOO token price and feed decimals
        const fooDecimals = 18;
        const feedDecimals = 8;
        const fooPrice = BigNumber.from('151').mul(BigNumber.from(10).pow(BigNumber.from(feedDecimals))); // 151 * 10**8

        // add feed for FOO token
        const mockFooPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const fooPriceFeed = await mockFooPriceFeed.deploy(fooPrice);
        await priceRetriever.addPriceFeed(fooToken.address, fooPriceFeed.address, fooDecimals, feedDecimals);

        // verification should fail as the price lower than expected
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Price Condition] Token price is higher than expected value');
    });

    it('passes the price verification if conditions are met', async () => {
        // update price in message and submit for signature.
        // Condition: FOO < 150
        let message = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // define FOO token price and feed decimals
        const fooDecimals = 18;
        const feedDecimals = 8;
        const fooPrice = BigNumber.from('151').mul(BigNumber.from(10).pow(BigNumber.from(feedDecimals))); // 149 * 10**8

        // add feed for FOO token
        const mockFooPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const fooPriceFeed = await mockFooPriceFeed.deploy(fooPrice);
        await priceRetriever.addPriceFeed(fooToken.address, fooPriceFeed.address, fooDecimals, feedDecimals);

        // verification should go through and raise no errors!
        await executor.verify(message, sigR, sigS, sigV);
    });

    /* ========== GAS TANK CONDITION CHECK ========== */

    it('fails if the user does not have enough funds in the gas tank', async () => {
        const message = await initialize(baseMessage);

        // empty the gas tank and try to verify the message
        await gasTank.withdrawAll();
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Gas Condition] Not enough gas in the tank');
    });


    /* ========== ALLOWANCE CONDITION CHECK ========== */

    it('fails if the user did not grant enough allowance to the executor contract', async () => {
        const message = await initialize(baseMessage);

        // revoke the allowance for the token to the executor contract
        await fooToken.approve(executor.address, ethers.utils.parseEther("0"));

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Allowance Condition] User did not give enough allowance to the script executor');
    });


    /* ========== REPETITIONS CONDITION CHECK ========== */

    it('fails if the script has been executed more than the allowed repetitions', async () => {
        let message: ITransferAction = JSON.parse(JSON.stringify(baseMessage));
        message.repetitions.enabled = true;
        message.repetitions.amount = BigNumber.from(2);
        message = await initialize(message);

        // let's get rich. wink.
        await fooToken.mint(owner.address, ethers.utils.parseEther("20000000"));

        // first two times it goes through
        await executor.execute(message, sigR, sigS, sigV);
        await executor.execute(message, sigR, sigS, sigV);

        // the third time won't as it'll hit the max-repetitions limit
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith('[Repetitions Condition] The script has reached its maximum number of executions');
    });
});
