import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { AmountType, ComparisonType } from "@daemons-fi/shared-definitions";
import {
  mmAdvDomain,
  IMMAdvancedAction,
  AdvancedMoneyMarketActionType,
  mmAdvTypes,
  InterestRateMode,
} from "@daemons-fi/shared-definitions";

describe("ScriptExecutor - Money Market Advanced", function () {
  let owner: SignerWithAddress;
  let otherWallet: SignerWithAddress;

  // contracts
  let gasTank: Contract;
  let priceRetriever: Contract;
  let executor: Contract;
  let fooToken: Contract;
  let fooDebtToken: Contract;
  let mockMoneyMarketPool: Contract;

  // signature components
  let sigR: string;
  let sigS: string;
  let sigV: number;

  let baseMessage: IMMAdvancedAction = {
    scriptId:
      "0x7465737400000000000000000000000000000000000000000000000000000000",
    token: "",
    debtToken: "",
    action: AdvancedMoneyMarketActionType.Repay,
    typeAmt: AmountType.Absolute,
    rateMode: InterestRateMode.Variable,
    amount: ethers.utils.parseEther("100"),
    user: "",
    kontract: "",
    executor: "",
    chainId: BigNumber.from(42),
    balance: {
      enabled: false,
      amount: ethers.utils.parseEther("150"),
      token: "",
      comparison: ComparisonType.GreaterThan,
    },
    frequency: {
      enabled: false,
      delay: BigNumber.from(5),
      start: BigNumber.from(0),
    },
    price: {
      enabled: false,
      token: "",
      comparison: ComparisonType.GreaterThan,
      value: ethers.utils.parseEther("150"),
    },
    repetitions: {
      enabled: false,
      amount: BigNumber.from(0),
    },
    follow: {
      enabled: false,
      shift: BigNumber.from(0),
      scriptId:
        "0x0065737400000000000000000000000000000000000000000000000000000000",
      executor: "0x000000000000000000000000000000000000dead",
    },
    healthFactor: {
      enabled: false,
      kontract: "",
      comparison: ComparisonType.GreaterThan,
      amount: ethers.utils.parseEther("0"),
    },
  };

  this.beforeEach(async () => {
    // get main wallet
    [owner, otherWallet] = await ethers.getSigners();

    // GasTank contract
    const GasTankContract = await ethers.getContractFactory("GasTank");
    gasTank = await GasTankContract.deploy();
    await gasTank.deposit({ value: ethers.utils.parseEther("2.0") });

    // Price retriever contract
    const PriceRetrieverContract = await ethers.getContractFactory(
      "PriceRetriever"
    );
    priceRetriever = await PriceRetrieverContract.deploy();

    // Mock token contracts
    const MockTokenContract = await ethers.getContractFactory("MockToken");
    fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
    const fooAToken = await MockTokenContract.deploy("Foo A Token", "aFOO");
    fooDebtToken = await MockTokenContract.deploy("Foo DebtToken", "dFOO");

    // Gas Price Feed contract
    const GasPriceFeedContract = await ethers.getContractFactory(
      "GasPriceFeed"
    );
    const gasPriceFeed = await GasPriceFeedContract.deploy();

    // Mock Money Market Pool contract
    const MockMoneyMarketPoolContract = await ethers.getContractFactory(
      "MockMoneyMarketPool"
    );
    mockMoneyMarketPool = await MockMoneyMarketPoolContract.deploy(
      fooToken.address,
      fooAToken.address,
      fooDebtToken.address
    );

    // Mock MoneyMarket Oracle contract
    const fakePrice = ethers.utils.parseEther("0.01");
    const MockOracleContract = await ethers.getContractFactory(
      "MockPriceOracleGetter"
    );
    const mockOracle = await MockOracleContract.deploy(fakePrice);

    // Executor contract
    const MmScriptExecutorContract = await ethers.getContractFactory(
      "MmAdvancedScriptExecutor"
    );
    executor = await MmScriptExecutorContract.deploy();
    await executor.setGasTank(gasTank.address);
    await executor.setPriceRetriever(priceRetriever.address);
    await executor.setGasFeed(gasPriceFeed.address);
    await executor.setAavePriceOracle(mockOracle.address);

    // Grant allowance
    await fooToken.approve(executor.address, ethers.utils.parseEther("500"));
    await fooDebtToken.approve(
      executor.address,
      ethers.utils.parseEther("5000")
    );

    // Generate balance and pre-existing debt
    await fooToken.mint(owner.address, ethers.utils.parseEther("100"));
    await fooDebtToken.mint(owner.address, ethers.utils.parseEther("87"));

    // register executor in gas tank
    await gasTank.addExecutor(executor.address);

    // Mock router contract
    const MockRouterContract = await ethers.getContractFactory("MockRouter");
    const mockRouter = await MockRouterContract.deploy();

    // Treasury contract
    const TreasuryContract = await ethers.getContractFactory("Treasury");
    const treasury = await TreasuryContract.deploy(
      fooToken.address,
      gasTank.address,
      mockRouter.address
    );

    // add some tokens to treasury
    fooToken.mint(treasury.address, ethers.utils.parseEther("100"));

    // set treasury address in gas tank
    await gasTank.setTreasury(treasury.address);

    // check that everything has been set correctly
    await executor.preliminaryCheck();
    await gasTank.preliminaryCheck();
    await treasury.preliminaryCheck();
  });

  async function initialize(
    baseMessage: IMMAdvancedAction
  ): Promise<IMMAdvancedAction> {
    // Create message and fill missing info
    const message = { ...baseMessage };
    message.user = owner.address;
    message.executor = executor.address;
    message.token = fooToken.address;
    message.debtToken = fooDebtToken.address;
    message.kontract = mockMoneyMarketPool.address;
    message.healthFactor.kontract = mockMoneyMarketPool.address;
    message.balance.token = fooToken.address;
    message.price.token = fooToken.address;
    message.follow.executor = executor.address; // following itself, it'll never be executed when condition is enabled

    // Sign message
    const signature = await owner._signTypedData(
      mmAdvDomain,
      mmAdvTypes,
      message
    );
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

    await expect(
      executor.verify(tamperedMessage, sigR, sigS, sigV)
    ).to.be.revertedWith("[SIGNATURE][FINAL]");
  });

  it("spots a valid message from another chain", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.chainId = BigNumber.from("1"); // message created for the Ethereum chain
    message = await initialize(message);

    // as the contract is created on chain 42, it will refuse to execute this message
    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[CHAIN][ERROR]"
    );
  });

  it("repays the debt - ABS", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = ethers.utils.parseEther("100");
    message.typeAmt = AmountType.Absolute;
    message.action = AdvancedMoneyMarketActionType.Repay;
    message = await initialize(message);

    await executor.execute(message, sigR, sigS, sigV);

    // Debt is 87, so 13 FOO are given back to the user
    const tokenBalance = await fooToken.balanceOf(owner.address);
    expect(tokenBalance).to.equal(ethers.utils.parseEther("13"));
  });

  it("repays the debt - PRC", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = BigNumber.from(7500); // 75%
    message.typeAmt = AmountType.Percentage;
    message.action = AdvancedMoneyMarketActionType.Repay;
    message = await initialize(message);

    await executor.execute(message, sigR, sigS, sigV);

    // we're paying 75% of the 87ETH debt =>
    // 65.25 paid, 34.75 remaining in wallet and debt of 21.75
    const tokenBalance = await fooToken.balanceOf(owner.address);
    expect(tokenBalance).to.equal(ethers.utils.parseEther("34.75"));

    const debtBalance = await fooDebtToken.balanceOf(owner.address);
    expect(debtBalance).to.equal(ethers.utils.parseEther("21.75"));
  });

  it("borrows some tokens - ABS", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = ethers.utils.parseEther("25");
    message.action = AdvancedMoneyMarketActionType.Borrow;
    message = await initialize(message);

    await executor.execute(message, sigR, sigS, sigV);

    const tokenBalance = await fooToken.balanceOf(owner.address);
    expect(tokenBalance).to.equal(ethers.utils.parseEther("125")); // 100 was already there
  });

  it("borrows some tokens - PRC", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = BigNumber.from("5000"); // Borrow 50% of borrowable
    message.typeAmt = AmountType.Percentage;
    message.action = AdvancedMoneyMarketActionType.Borrow;
    message = await initialize(message);

    await executor.execute(message, sigR, sigS, sigV);

    // a debt of 1750 FOO is created and they are sent to the user
    // as they already had a debt of 87 FOO, now it becomes 1837
    const debtBalance = await fooDebtToken.balanceOf(owner.address);
    expect(debtBalance).to.equal(ethers.utils.parseEther("1837"));

    // now they own 1850 FOO (100 FOO were already in the wallet)
    const tokenBalance = await fooToken.balanceOf(owner.address);
    expect(tokenBalance).to.equal(ethers.utils.parseEther("1850")); // 100 was already there
  });

  it("execution triggers reward in gas tank", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message = await initialize(message);
    await fooToken.mint(owner.address, ethers.utils.parseEther("55"));

    // gasTank should NOT have a claimable amount now for user1
    expect((await gasTank.claimable(otherWallet.address)).toNumber()).to.equal(
      0
    );

    await executor.connect(otherWallet).execute(message, sigR, sigS, sigV);

    // gasTank should have a claimable amount now for user1
    expect(
      (await gasTank.claimable(otherWallet.address)).toNumber()
    ).to.not.equal(0);
  });

  it("repaying is cheap - ABS", async () => {
    // At the time this test was last checked, the gas spent to
    // execute the script was 0.000258426002067408 ETH.

    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = ethers.utils.parseEther("100");
    message.typeAmt = AmountType.Absolute;
    message.action = AdvancedMoneyMarketActionType.Repay;
    message = await initialize(message);

    const initialBalance = await owner.getBalance();
    await executor.execute(message, sigR, sigS, sigV);
    const spentAmount = initialBalance.sub(await owner.getBalance());

    const threshold = ethers.utils.parseEther("0.0003");
    console.log("Spent for repay ABS:", spentAmount.toString());
    expect(spentAmount.lte(threshold)).to.equal(true);
  });

  it("repaying is cheap - PRC", async () => {
    // At the time this test was last checked, the gas spent to
    // execute the script was 0.000267068002136544 ETH.

    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = BigNumber.from(7500); // 75%
    message.typeAmt = AmountType.Percentage;
    message.action = AdvancedMoneyMarketActionType.Repay;
    message = await initialize(message);

    const initialBalance = await owner.getBalance();
    await executor.execute(message, sigR, sigS, sigV);
    const spentAmount = initialBalance.sub(await owner.getBalance());

    const threshold = ethers.utils.parseEther("0.0003");
    console.log("Spent for repay PRC:", spentAmount.toString());
    expect(spentAmount.lte(threshold)).to.equal(true);
  });

  it("borrowing is cheap - ABS", async () => {
    // At the time this test was last checked, the gas spent to
    // execute the script was 0.000210066001680528 ETH.

    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = ethers.utils.parseEther("25");
    message.action = AdvancedMoneyMarketActionType.Borrow;
    message = await initialize(message);

    const initialBalance = await owner.getBalance();
    await executor.execute(message, sigR, sigS, sigV);
    const spentAmount = initialBalance.sub(await owner.getBalance());

    const threshold = ethers.utils.parseEther("0.0003");
    console.log("Spent for borrow ABS:", spentAmount.toString());
    expect(spentAmount.lte(threshold)).to.equal(true);
  });

  it("borrowing is cheap - PRC", async () => {
    // At the time this test was last checked, the gas spent to
    // execute the script was 0.000215473001723784 ETH.

    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = BigNumber.from("5000"); // Borrow 50% of borrowable
    message.typeAmt = AmountType.Percentage;
    message.action = AdvancedMoneyMarketActionType.Borrow;
    message = await initialize(message);

    const initialBalance = await owner.getBalance();
    await executor.execute(message, sigR, sigS, sigV);
    const spentAmount = initialBalance.sub(await owner.getBalance());

    const threshold = ethers.utils.parseEther("0.0003");
    console.log("Spent for borrow PRC:", spentAmount.toString());
    expect(spentAmount.lte(threshold)).to.equal(true);
  });

  it("sets the lastExecution value during execution", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));

    // enable frequency condition so 2 consecutive executions should fail
    message.frequency.enabled = true;
    message = await initialize(message);
    await fooToken.mint(owner.address, ethers.utils.parseEther("2000"));

    // the first one goes through
    await executor.execute(message, sigR, sigS, sigV);

    // the second one fails as not enough blocks have passed
    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[FREQUENCY_CONDITION][TMP]"
    );
  });

  /* ========== ACTION INTRINSIC CHECK ========== */

  it("fails if the user wants to repay but there is no debt", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = BigNumber.from(10000); // 100%
    message.typeAmt = AmountType.Percentage;
    message.action = AdvancedMoneyMarketActionType.Repay;
    message = await initialize(message);

    // repaying 100% of the debt
    await executor.execute(message, sigR, sigS, sigV);

    // trying again will fail
    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[NO_DEBT][TMP]"
    );
  });

  it("fails if the user doesn't have enough balance, even tho the balance condition was not set - ABS", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = ethers.utils.parseEther("9999"); // setting an amount higher than the user's balance
    message = await initialize(message);

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[SCRIPT_BALANCE][TMP]"
    );
  });

  it("fails if the user doesn't have enough balance, even tho the balance condition was not set - PRC", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = BigNumber.from("10000"); // wanna pay 100%
    message.typeAmt = AmountType.Percentage;
    message = await initialize(message);

    // let's set a debt much higher than what the user owns
    await fooDebtToken.mint(owner.address, ethers.utils.parseEther("9999"));

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[SCRIPT_BALANCE][TMP]"
    );
  });

  it("fails if the user wants to borrow more than the borrowable amount - ABS", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = ethers.utils.parseEther("50000"); // can borrow 3325, this is way too much and will fail
    message.action = AdvancedMoneyMarketActionType.Borrow;
    message = await initialize(message);

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[BORROW_TOO_HIGH][TMP]"
    );
  });

  it("fails if the user wants to borrow more than the borrowable amount - PRC", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.amount = BigNumber.from("10000"); // wanna borrow 100% of borrowable
    message.typeAmt = AmountType.Percentage;
    message.action = AdvancedMoneyMarketActionType.Borrow;
    message = await initialize(message);

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[BORROW_TOO_HIGH][FINAL]"
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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.balance.enabled = true;
    message = await initialize(message);

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[BALANCE_CONDITION_LOW][TMP]"
    );
  });

  it("fails the verification if balance is enabled and the user owns too many tokens", async () => {
    // update frequency in message and submit for signature
    // we'll change the comparison so it will become "FOO_TOKEN<150"
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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
    const mockFooPriceFeed = await ethers.getContractFactory(
      "MockChainlinkAggregator"
    );
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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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
    const mockFooPriceFeed = await ethers.getContractFactory(
      "MockChainlinkAggregator"
    );
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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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
    const mockFooPriceFeed = await ethers.getContractFactory(
      "MockChainlinkAggregator"
    );
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
    await gasTank.withdrawAll();
    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[GAS][TMP]"
    );
  });

  /* ========== ALLOWANCE CONDITION CHECK ========== */

  it("fails if the user did not grant enough allowance to the executor contract - REPAY", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.action = AdvancedMoneyMarketActionType.Repay;
    message = await initialize(message);

    // revoke the allowance for the token to the executor contract
    await fooToken.approve(executor.address, ethers.utils.parseEther("0"));

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[ALLOWANCE][ACTION]"
    );
  });

  it("fails if the user did not grant enough allowance to the executor contract - BORROW", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.action = AdvancedMoneyMarketActionType.Borrow;
    message = await initialize(message);

    // revoke the allowance for the token to the executor contract
    await fooDebtToken.approve(executor.address, ethers.utils.parseEther("0"));

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[ALLOWANCE][ACTION]"
    );
  });

  /* ========== REPETITIONS CONDITION CHECK ========== */

  it("fails if the script has been executed more than the allowed repetitions", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    message.action = AdvancedMoneyMarketActionType.Repay;
    message.typeAmt = AmountType.Percentage;
    message.amount = BigNumber.from(500); //5%
    message.repetitions.enabled = true;
    message.repetitions.amount = BigNumber.from(2);
    message = await initialize(message);

    // let's get rich. wink.
    await fooToken.mint(owner.address, ethers.utils.parseEther("20000000"));

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
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
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

    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    // setting the follow condition to use another executor, so to test the external calls.
    message.follow.enabled = true;
    message.follow.executor = otherExecutor.address;
    message = await initialize(message);

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[FOLLOW_CONDITION][TMP]"
    );
  });

  /* ========== HEALTH FACTOR CONDITION CHECK ========== */

  it("fails if current health factor is lower than threshold when looking for GreaterThan", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    // enabling the health factor condition
    // the mock MM pool always return current HF:2
    message.healthFactor.enabled = true;
    message.healthFactor.amount = ethers.utils.parseEther("2.1");
    message.healthFactor.comparison = ComparisonType.GreaterThan;
    message = await initialize(message);

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[HEALTH_FACTOR_LOW][TMP]"
    );
  });

  it("fails if current health factor is higher than threshold when looking for LessThan", async () => {
    let message: IMMAdvancedAction = JSON.parse(JSON.stringify(baseMessage));
    // enabling the health factor condition
    // the mock MM pool always return current HF:2
    message.healthFactor.enabled = true;
    message.healthFactor.amount = ethers.utils.parseEther("1.9");
    message.healthFactor.comparison = ComparisonType.LessThan;
    message = await initialize(message);

    await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
      "[HEALTH_FACTOR_HIGH][TMP]"
    );
  });
});
