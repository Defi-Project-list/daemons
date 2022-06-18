import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { AmountType, ComparisonType, ZapOutputChoice } from "@daemons-fi/shared-definitions";
import { zapInDomain, IZapInAction, zapInTypes } from "@daemons-fi/shared-definitions";
import hre from 'hardhat'
const chainId = hre.network.config.chainId

describe("ScriptExecutor - ZapIn", function () {
    let owner: SignerWithAddress;
    let otherWallet: SignerWithAddress;

    // contracts
    let gasTank: Contract;
    let priceRetriever: Contract;
    let executor: Contract;
    let DAEMToken: Contract;
    let fooToken: Contract;
    let barToken: Contract;
    let fooBarLP: Contract;
    let mockRouter: Contract;

    // signature components
    let sigR: string;
    let sigS: string;
    let sigV: number;

    let baseMessage: IZapInAction = {
        scriptId: "0x7465737400000000000000000000000000000000000000000000000000000000",
        tokenA: "",
        tokenB: "",
        amountA: ethers.utils.parseEther("27"),
        amountB: ethers.utils.parseEther("12"),
        typeAmtA: AmountType.Absolute,
        typeAmtB: AmountType.Absolute,
        user: "",
        kontract: "",
        executor: "",
        chainId: BigNumber.from(chainId),
        tip: BigNumber.from(0),
        balance: {
            enabled: false,
            amount: ethers.utils.parseEther("150"),
            token: "",
            comparison: ComparisonType.GreaterThan
        },
        frequency: {
            enabled: false,
            delay: BigNumber.from(5),
            start: BigNumber.from(0)
        },
        price: {
            enabled: false,
            token: "",
            comparison: ComparisonType.GreaterThan,
            value: ethers.utils.parseEther("150")
        },
        repetitions: {
            enabled: false,
            amount: BigNumber.from(0)
        },
        follow: {
            enabled: false,
            shift: BigNumber.from(0),
            scriptId: "0x0065737400000000000000000000000000000000000000000000000000000000",
            executor: "0x000000000000000000000000000000000000dead"
        }
    };

    let snapshotId: string;
    this.beforeEach(async () => {
        await hre.network.provider.send("evm_revert", [snapshotId]);
        // [...] A snapshot can only be used once. After a successful evm_revert, the same snapshot id cannot be used again.
        snapshotId = await hre.network.provider.send("evm_snapshot", []);
    });

    this.beforeAll(async () => {
        // get main wallet
        [owner, otherWallet] = await ethers.getSigners();

        // GasTank contract
        const GasTankContract = await ethers.getContractFactory("GasTank");
        gasTank = await GasTankContract.deploy();
        await gasTank.depositGas({ value: ethers.utils.parseEther("2.0") });

        // Price retriever contract
        const PriceRetrieverContract = await ethers.getContractFactory("PriceRetriever");
        priceRetriever = await PriceRetrieverContract.deploy();

        // Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        DAEMToken = await MockTokenContract.deploy("DAEM Token", "DAEM");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
        barToken = await MockTokenContract.deploy("Bar Token", "BAR");
        fooBarLP = await MockTokenContract.deploy("FOO-BAR-LP", "FOO-BAR-LP");

        // Gas Price Feed contract
        const GasPriceFeedContract = await ethers.getContractFactory("GasPriceFeed");
        const gasPriceFeed = await GasPriceFeedContract.deploy();

        // Executor contract
        const ZapInScriptExecutorContract = await ethers.getContractFactory("ZapInScriptExecutor");
        executor = await ZapInScriptExecutorContract.deploy();
        await executor.setGasTank(gasTank.address);
        await executor.setPriceRetriever(priceRetriever.address);
        await executor.setGasFeed(gasPriceFeed.address);

        // Grant allowance
        await fooToken.approve(executor.address, ethers.utils.parseEther("1000000"));
        await barToken.approve(executor.address, ethers.utils.parseEther("1000000"));
        await DAEMToken.approve(executor.address, ethers.utils.parseEther("1000000"));

        // Generate balance
        await fooToken.mint(owner.address, baseMessage.amountA);
        await barToken.mint(owner.address, baseMessage.amountB);
        await DAEMToken.mint(owner.address, ethers.utils.parseEther("250"));

        // register executor in gas tank
        await gasTank.addExecutor(executor.address);
        await gasTank.setDAEMToken(DAEMToken.address);

        // Mock Uniswap router contract
        const MockRouterContract = await ethers.getContractFactory("MockUniswapV2Router");
        mockRouter = await MockRouterContract.deploy();

        // Mock Uniswap factory contract
        const MockFactoryContract = await ethers.getContractFactory("MockUniswapV2Factory");
        const mockFactory = await MockFactoryContract.deploy();
        await mockRouter.setFactory(mockFactory.address);
        await mockFactory.setFakePair(fooToken.address, barToken.address, fooBarLP.address);

        // Treasury contract
        const TreasuryContract = await ethers.getContractFactory("Treasury");
        const treasury = await TreasuryContract.deploy(
            DAEMToken.address,
            gasTank.address,
            mockRouter.address
        );

        // add some tokens to treasury
        DAEMToken.mint(treasury.address, ethers.utils.parseEther("110"));

        // create token LP
        const ethAmount = ethers.utils.parseEther("5");
        const daemAmount = ethers.utils.parseEther("10");
        await treasury.createLP(daemAmount, { value: ethAmount });

        // set treasury address in gas tank
        await gasTank.setTreasury(treasury.address);

        // check that everything has been set correctly
        await executor.preliminaryCheck();
        await gasTank.preliminaryCheck();
        await treasury.preliminaryCheck();

        // get a snapshot of the current state so to speed up tests
        snapshotId = await hre.network.provider.send("evm_snapshot", []);
    });

    async function initialize(
        baseMessage: IZapInAction,
        tokenAAddress: string | undefined = undefined,
        tokenBAddress: string | undefined = undefined
    ): Promise<IZapInAction> {
        // Create message and fill missing info
        const message = { ...baseMessage };
        message.user = owner.address;
        message.executor = executor.address;
        message.tokenA = tokenAAddress ?? fooToken.address;
        message.tokenB = tokenBAddress ?? barToken.address;
        message.kontract = mockRouter.address;
        message.balance.token = fooToken.address;
        message.price.token = fooToken.address;
        message.follow.executor = executor.address; // following itself, it'll never be executed when condition is enabled

        // Sign message
        const signature = await owner._signTypedData(zapInDomain, zapInTypes, message);
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
        tamperedMessage.amountA = ethers.utils.parseEther("0");

        await expect(executor.verify(tamperedMessage, sigR, sigS, sigV)).to.be.revertedWith(
            "[SIGNATURE][FINAL]"
        );
    });

    it("spots a valid message from another chain", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.chainId = BigNumber.from("1"); // message created for the Ethereum chain
        message = await initialize(message);

        // as the contract is created on chain 42, it will refuse to execute this message
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[CHAIN][ERROR]"
        );
    });

    it("zaps the LP - ABS ABS", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message = await initialize(message);

        // add a bit more tokens, to have some leftovers
        await fooToken.mint(owner.address, ethers.utils.parseEther("5"));
        await barToken.mint(owner.address, ethers.utils.parseEther("5"));
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("32"));
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("17"));

        await executor.execute(message, sigR, sigS, sigV);

        // now the wallet should contain both the LP and some tokens
        expect(await fooBarLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("39"));
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("5"));
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("5"));

        // the executor should not have leftovers
        expect(await fooToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
        expect(await barToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
    });

    it("zaps the LP - ABS PRC", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmtA = AmountType.Percentage;
        message.amountA = BigNumber.from(5000); // 50%
        message = await initialize(message);

        // add a bit more tokens, to have some leftovers
        await fooToken.mint(owner.address, ethers.utils.parseEther("5"));
        await barToken.mint(owner.address, ethers.utils.parseEther("5"));
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("32"));
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("17"));

        await executor.execute(message, sigR, sigS, sigV);

        // now the wallet should contain both the LP and some tokens
        expect(await fooBarLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("28")); // 32*50% + 12
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("16")); // 32*50%
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("5"));

        // the executor should not have leftovers
        expect(await fooToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
        expect(await barToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
    });

    it("zaps the LP - PRC PRC", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmtA = AmountType.Percentage;
        message.amountA = BigNumber.from(2000); // 20% (5.4)
        message.typeAmtB = AmountType.Percentage;
        message.amountB = BigNumber.from(5000); // 50% (6.0)
        message = await initialize(message);

        // current wallet situation
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("27"));
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("12"));

        await executor.execute(message, sigR, sigS, sigV);

        // now the wallet should contain both the LP and some tokens
        expect(await fooBarLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("11.4")); // 27*20% + 16*50%
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("21.6")); // 27*80%
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("6")); // 12*50%

        // the executor should not have leftovers
        expect(await fooToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
        expect(await barToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
    });

    it("zaps the LP with one of the two amounts set to 0 - TokenA", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.amountA = ethers.utils.parseEther("0");
        message.amountB = ethers.utils.parseEther("10");
        message = await initialize(message);

        await executor.execute(message, sigR, sigS, sigV);

        // now the wallet should contain both the LP and some tokens
        expect(await fooBarLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("10"));
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("27"));
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("2"));

        // the executor should not have leftovers
        expect(await fooToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
        expect(await barToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
    });

    it("zaps the LP with one of the two amounts set to 0 - TokenB", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.amountA = ethers.utils.parseEther("25");
        message.amountB = ethers.utils.parseEther("0");
        message = await initialize(message);

        await executor.execute(message, sigR, sigS, sigV);

        // now the wallet should contain both the LP and some tokens
        expect(await fooBarLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("25"));
        expect(await fooToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("2"));
        expect(await barToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("12"));

        // the executor should not have leftovers
        expect(await fooToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
        expect(await barToken.balanceOf(executor.address)).to.equal(ethers.utils.parseEther("0"));
    });

    it("zapping triggers reward in gas tank", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message = await initialize(message);
        await fooToken.mint(owner.address, ethers.utils.parseEther("55"));

        // gasTank should NOT have a claimable amount now for user1
        expect((await gasTank.claimable(otherWallet.address)).toNumber()).to.equal(0);

        await executor.connect(otherWallet).execute(message, sigR, sigS, sigV);

        // gasTank should have a claimable amount now for user1
        expect((await gasTank.claimable(otherWallet.address)).toNumber()).to.not.equal(0);
    });

    it("zapping is cheap - ABS ABS", async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000379177003033416 ETH.
        const message = await initialize(baseMessage);

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.0004");
        console.log("Spent for zapping:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it("zapping is cheap - ABS PRC", async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000385537003084296 ETH.

        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmtA = AmountType.Percentage;
        message.amountA = BigNumber.from(5000);
        message = await initialize(message);

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.0004");
        console.log("Spent for zapping:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it("zapping is cheap - PRC PRC", async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000396709003173672 ETH.

        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmtA = AmountType.Percentage;
        message.amountA = BigNumber.from(5000);
        message.typeAmtB = AmountType.Percentage;
        message.amountB = BigNumber.from(5000);
        message = await initialize(message);

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.00041");
        console.log("Spent for zapping:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it("sets the lastExecution value during execution", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));

        // enable frequency condition so 2 consecutive executions should fail
        message.frequency.enabled = true;
        message = await initialize(message);
        await fooToken.mint(owner.address, ethers.utils.parseEther("5000"));
        await barToken.mint(owner.address, ethers.utils.parseEther("5000"));

        // the first one goes through
        await executor.execute(message, sigR, sigS, sigV);

        // the second one fails as not enough blocks have passed
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[FREQUENCY_CONDITION][TMP]"
        );
    });

    /* ========== ACTION INTRINSIC CHECK ========== */

    it("fails if the user passes amount 0 for both tokens", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.amountA = ethers.utils.parseEther("0");
        message.amountB = ethers.utils.parseEther("0");
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[ZERO_AMOUNT][FINAL]"
        );
    });

    it("fails if the user doesn't have enough balance, even tho the balance condition was not set", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.amountA = ethers.utils.parseEther("9999"); // setting an amount higher than the user's balance
        message.amountB = ethers.utils.parseEther("9999"); // setting an amount higher than the user's balance
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[SCRIPT_BALANCE][TMP]"
        );
    });

    it("fails if the given pair is not supported", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        // initialize message using the same token twice to trigger unsupported pair message
        message = await initialize(message, fooToken.address, fooToken.address);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[UNSUPPORTED_PAIR][FINAL]"
        );
    });

    /* ========== REVOCATION CONDITION CHECK ========== */

    it("fails if the script has been revoked by the user", async () => {
        const message = await initialize(baseMessage);

        // revoke the script execution
        await executor.revoke(message.scriptId);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[REVOKED][FINAL]"
        );
    });

    /* ========== FREQUENCY CONDITION CHECK ========== */

    it("fails the verification if frequency is enabled and the start block has not been reached", async () => {
        const timestampNow = Math.floor(Date.now() / 1000);
        // update frequency in message and submit for signature
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.frequency.enabled = true;
        message.frequency.delay = BigNumber.from(0);
        message.frequency.start = BigNumber.from(timestampNow + 5000);
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[FREQUENCY_CONDITION][TMP]"
        );
    });

    it("fails the verification if frequency is enabled and not enough blocks passed since start block", async () => {
        const timestampNow = Math.floor(Date.now() / 1000);
        // update frequency in message and submit for signature
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.frequency.enabled = true;
        message.frequency.delay = BigNumber.from(timestampNow + 5000);
        message.frequency.start = BigNumber.from(0);
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[FREQUENCY_CONDITION][TMP]"
        );
    });

    /* ========== BALANCE CONDITION CHECK ========== */

    it("fails the verification if balance is enabled and the user does not own enough tokens", async () => {
        // update balance in message and submit for signature
        // enabling it will be enough as the condition is "FOO_TOKEN>150"
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.balance.enabled = true;
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[BALANCE_CONDITION_LOW][TMP]"
        );
    });

    it("fails the verification if balance is enabled and the user owns too many tokens", async () => {
        // update frequency in message and submit for signature
        // we'll change the comparison so it will become "FOO_TOKEN<150"
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.balance.enabled = true;
        message.balance.comparison = ComparisonType.LessThan;
        message = await initialize(message);

        // add tokens to the user address so the check will fail
        await fooToken.mint(owner.address, ethers.utils.parseEther("200"));

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[BALANCE_CONDITION_HIGH][TMP]"
        );
    });

    /* ========== PRICE CONDITION CHECK ========== */

    it("fails the verification if price is enabled, but token is not supported", async () => {
        // update price in message and submit for signature.
        // Condition: FOO > 150
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // executor has no price feed for the token, so it should fail
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[PriceRetriever] Unsupported token"
        );
    });

    it("fails the verification if price is enabled with GREATER_THAN condition and tokenPrice < value", async () => {
        // update price in message and submit for signature.
        // Condition: FOO > 150
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // define FOO token price and feed decimals
        const fooDecimals = 18;
        const feedDecimals = 8;
        const fooPrice = BigNumber.from("149").mul(
            BigNumber.from(10).pow(BigNumber.from(feedDecimals))
        ); // 149 * 10**8

        // add feed for FOO token
        const mockFooPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const fooPriceFeed = await mockFooPriceFeed.deploy(fooPrice);
        await priceRetriever.addPriceFeed(
            fooToken.address,
            fooPriceFeed.address,
            fooDecimals,
            feedDecimals
        );

        // verification should fail as the price lower than expected
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[PRICE_CONDITION_LOW][TMP]"
        );
    });

    it("fails the verification if price is enabled with LESS_THAN condition and tokenPrice > value", async () => {
        // update price in message and submit for signature.
        // Condition: FOO < 150
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.LessThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // define FOO token price and feed decimals
        const fooDecimals = 18;
        const feedDecimals = 8;
        const fooPrice = BigNumber.from("151").mul(
            BigNumber.from(10).pow(BigNumber.from(feedDecimals))
        ); // 151 * 10**8

        // add feed for FOO token
        const mockFooPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const fooPriceFeed = await mockFooPriceFeed.deploy(fooPrice);
        await priceRetriever.addPriceFeed(
            fooToken.address,
            fooPriceFeed.address,
            fooDecimals,
            feedDecimals
        );

        // verification should fail as the price lower than expected
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[PRICE_CONDITION_HIGH][TMP]"
        );
    });

    it("passes the price verification if conditions are met", async () => {
        // update price in message and submit for signature.
        // Condition: FOO < 150
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.token = fooToken.address;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("150");
        message = await initialize(message);

        // define FOO token price and feed decimals
        const fooDecimals = 18;
        const feedDecimals = 8;
        const fooPrice = BigNumber.from("151").mul(
            BigNumber.from(10).pow(BigNumber.from(feedDecimals))
        ); // 149 * 10**8

        // add feed for FOO token
        const mockFooPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const fooPriceFeed = await mockFooPriceFeed.deploy(fooPrice);
        await priceRetriever.addPriceFeed(
            fooToken.address,
            fooPriceFeed.address,
            fooDecimals,
            feedDecimals
        );

        // verification should go through and raise no errors!
        await executor.verify(message, sigR, sigS, sigV);
    });

    /* ========== GAS TANK CONDITION CHECK ========== */

    it("fails if the user does not have enough funds in the gas tank", async () => {
        const message = await initialize(baseMessage);

        // empty the gas tank and try to verify the message
        await gasTank.withdrawAllGas();
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith("[GAS][TMP]");
    });

    /* ========== TIP CONDITION CHECK ========== */

    it("fails if the user sets a tip but doesn't have enough funds to pay for it", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.tip = ethers.utils.parseEther("15000");
        message = await initialize(message);

        // empty the gas tank and try to verify the message
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith("[TIP][TMP]");
    });

    it("Pays the tip to the executor", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.tip = ethers.utils.parseEther("5");
        message = await initialize(message);
        await fooToken.mint(owner.address, ethers.utils.parseEther("55"));

        // deposit DAEM in the Tip Jar
        await DAEMToken.approve(gasTank.address, ethers.utils.parseEther("10000"));
        await gasTank.connect(owner).depositTip(ethers.utils.parseEther("10"));
        let tipBalance = await gasTank.tipBalanceOf(owner.address);
        expect(tipBalance).to.be.equal(ethers.utils.parseEther("10"));

        await executor.connect(otherWallet).execute(message, sigR, sigS, sigV);

        // tokens have been removed from the user's tip jar
        tipBalance = await gasTank.tipBalanceOf(owner.address);
        expect(tipBalance).to.be.equal(ethers.utils.parseEther("5"));
    });

    /* ========== ALLOWANCE CONDITION CHECK ========== */

    it("fails if the user did not grant enough allowance to the executor contract - TOKEN A", async () => {
        const message = await initialize(baseMessage);

        // revoke the allowance for the token to the executor contract
        await fooToken.approve(executor.address, ethers.utils.parseEther("0"));

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[ALLOWANCE][ACTION]"
        );
    });

    it("fails if the user did not grant enough allowance to the executor contract - TOKEN B", async () => {
        const message = await initialize(baseMessage);

        // revoke the allowance for the token to the executor contract
        await barToken.approve(executor.address, ethers.utils.parseEther("0"));

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[ALLOWANCE][ACTION]"
        );
    });

    /* ========== REPETITIONS CONDITION CHECK ========== */

    it("fails if the script has been executed more than the allowed repetitions", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        message.repetitions.enabled = true;
        message.repetitions.amount = BigNumber.from(2);
        message = await initialize(message);

        // let's get rich. wink.
        await fooToken.mint(owner.address, ethers.utils.parseEther("20000000"));
        await barToken.mint(owner.address, ethers.utils.parseEther("20000000"));

        // first two times it goes through
        await executor.execute(message, sigR, sigS, sigV);
        await executor.execute(message, sigR, sigS, sigV);

        // the third time won't as it'll hit the max-repetitions limit
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[REPETITIONS_CONDITION][FINAL]"
        );
    });

    /* ========== FOLLOW CONDITION CHECK ========== */

    it("fails if the script should follow a script that has not run yet", async () => {
        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        // enabling the follow condition. It now points to a script that never executed (as it does not exist),
        // so it should always fail.
        message.follow.enabled = true;
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[FOLLOW_CONDITION][TMP]"
        );
    });

    it("fails if the script should follow a script that has not run yet, even if it is run by another executor", async () => {
        const SwapperScriptExecutorContract = await ethers.getContractFactory(
            "SwapperScriptExecutor"
        );
        const otherExecutor = await SwapperScriptExecutorContract.deploy();

        let message: IZapInAction = JSON.parse(JSON.stringify(baseMessage));
        // setting the follow condition to use another executor, so to test the external calls.
        message.follow.enabled = true;
        message.follow.executor = otherExecutor.address;
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[FOLLOW_CONDITION][TMP]"
        );
    });
});
