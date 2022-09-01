import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { AmountType, ComparisonType, ZapOutputChoice } from "@daemons-fi/shared-definitions";
import { zapOutDomain, IZapOutAction, zapOutTypes } from "@daemons-fi/shared-definitions";
import hre from "hardhat";
const chainId = hre.network.config.chainId;

describe("ScriptExecutor - ZapOut [FORKED CHAIN]", function () {
    let owner: SignerWithAddress;
    let otherWallet: SignerWithAddress;

    // contracts
    let gasTank: Contract;
    let executor: Contract;
    let DAEMToken: Contract;
    let WMATICToken: Contract;
    let MATICDAEMLP: Contract;
    let fooToken: Contract;
    let barToken: Contract;

    const quickswapRouterAddress = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";

    // signature components
    let sigR: string;
    let sigS: string;
    let sigV: number;

    let baseMessage: IZapOutAction = {
        scriptId: "0x7465737400000000000000000000000000000000000000000000000000000000",
        tokenA: "",
        tokenB: "",
        amount: ethers.utils.parseEther("500"),
        typeAmt: AmountType.Absolute,
        outputChoice: ZapOutputChoice.bothTokens,
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
            tokenA: "",
            tokenB: "",
            comparison: ComparisonType.GreaterThan,
            value: ethers.utils.parseEther("150"),
            router: ""
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

    this.afterAll(async () => {
        // Reset the fork
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: []
        });
    });

    this.beforeAll(async () => {
        console.log(`Forking Polygon network`);
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.POLYGON_RPC!,
                        blockNumber: 29483920
                    }
                }
            ]
        });

        // get main wallet
        [owner, otherWallet] = await ethers.getSigners();

        // GasTank contract
        const GasTankContract = await ethers.getContractFactory("GasTank");
        gasTank = await GasTankContract.deploy();
        await gasTank.depositGas({ value: ethers.utils.parseEther("2.0") });

        // Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        DAEMToken = await MockTokenContract.deploy("DAEM Token", "DAEM");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
        barToken = await MockTokenContract.deploy("Bar Token", "BAR");
        WMATICToken = await ethers.getContractAt(
            "MockToken",
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
        );

        // Gas Price Feed contract
        const GasPriceFeedContract = await ethers.getContractFactory("GasPriceFeed");
        const gasPriceFeed = await GasPriceFeedContract.deploy();

        // Executor contract
        const ZapOutScriptExecutorContract = await ethers.getContractFactory(
            "ZapOutScriptExecutor"
        );
        executor = await ZapOutScriptExecutorContract.deploy();
        await executor.setGasTank(gasTank.address);
        await executor.setGasFeed(gasPriceFeed.address);

        // register executor in gas tank
        await gasTank.addExecutor(executor.address);
        await gasTank.setDAEMToken(DAEMToken.address);

        // create liquidity manager
        const LiquidityManager = await ethers.getContractFactory("UniswapV2LiquidityManager");
        const liquidityManager = await LiquidityManager.deploy(
            DAEMToken.address,
            quickswapRouterAddress // quickswap router
        );

        // Treasury contract
        const TreasuryContract = await ethers.getContractFactory("Treasury");
        const treasury = await TreasuryContract.deploy(
            DAEMToken.address,
            gasTank.address,
            liquidityManager.address
        );

        // create LP
        const ETHAmount = ethers.utils.parseEther("2000");
        const DAEMAmount = ethers.utils.parseEther("2000");
        await DAEMToken.mint(owner.address, DAEMAmount);
        await DAEMToken.approve(liquidityManager.address, DAEMAmount);
        await liquidityManager.createLP(DAEMAmount, treasury.address, { value: ETHAmount });

        // ** DIVERGENCE FROM OTHER TESTS **
        // Get LP Address and use liquidityManager to create some liquidity
        // that will be used by the ZapOut executor
        const MATICDAEMLPaddress = await liquidityManager.polLp();
        MATICDAEMLP = await ethers.getContractAt("MockToken", MATICDAEMLPaddress);

        await DAEMToken.mint(owner.address, DAEMAmount);
        await DAEMToken.approve(liquidityManager.address, DAEMAmount);
        await liquidityManager.addLiquidityETH(
            DAEMAmount,
            owner.address,
            0xffffffffffff,
            { value: ETHAmount }
        );
        // ** END DIVERGENCE **

        // add some tokens to treasury
        DAEMToken.mint(treasury.address, ethers.utils.parseEther("110"));

        // Grant allowance
        await MATICDAEMLP.approve(executor.address, ethers.utils.parseEther("1000000"));
        await DAEMToken.approve(executor.address, ethers.utils.parseEther("1000000"));

        // set treasury address in gas tank
        await gasTank.setTreasury(treasury.address);

        // check that everything has been set correctly
        await executor.preliminaryCheck();
        await gasTank.preliminaryCheck();
        await treasury.preliminaryCheck();

        // get a snapshot of the current state so to speed up tests
        snapshotId = await hre.network.provider.send("evm_snapshot", []);
    });

    async function initialize(baseMessage: IZapOutAction): Promise<IZapOutAction> {
        // Create message and fill missing info
        const message = { ...baseMessage };
        message.user = owner.address;
        message.executor = executor.address;
        message.tokenA = WMATICToken.address;
        message.tokenB = DAEMToken.address;
        message.kontract = quickswapRouterAddress;
        message.balance.token = fooToken.address;
        message.price.tokenA = WMATICToken.address;
        message.price.tokenB = DAEMToken.address;
        message.price.router = quickswapRouterAddress;
        message.follow.executor = executor.address; // following itself, it'll never be executed when condition is enabled

        // Sign message
        const signature = await owner._signTypedData(zapOutDomain, zapOutTypes, message);
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

        await expect(executor.verify(tamperedMessage, sigR, sigS, sigV)).to.be.revertedWith(
            "[SIGNATURE][FINAL]"
        );
    });

    it("spots a valid message from another chain", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.chainId = BigNumber.from("1"); // message created for the Ethereum chain
        message = await initialize(message);

        // as the contract is created on chain 42, it will refuse to execute this message
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[CHAIN][ERROR]"
        );
    });

    it("zaps the LP - ABS", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.amount = ethers.utils.parseEther("500"),
        message = await initialize(message);

        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("2000"));

        await executor.execute(message, sigR, sigS, sigV);

        // the LP should be gone (only leftovers) and tokens should have been added
        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1500"));
        expect(await WMATICToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("500"));
        expect(await DAEMToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("500")); // 250 already there
    });

    it("zaps the LP - ABS + single token A", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.amount = ethers.utils.parseEther("500"),
        message.outputChoice = ZapOutputChoice.tokenA;
        message = await initialize(message);

        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("2000"));

        await executor.execute(message, sigR, sigS, sigV);

        // the LP should be gone (only leftovers) and tokens should have been added
        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1500"));
        expect(await WMATICToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("936.351131674377891709"));
        expect(await DAEMToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("0"));
    });

    it("zaps the LP - ABS + single token B", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.amount = ethers.utils.parseEther("500"),
        message.outputChoice = ZapOutputChoice.tokenB;
        message = await initialize(message);

        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("2000"));

        await executor.execute(message, sigR, sigS, sigV);

        // the LP should be gone (only leftovers) and tokens should have been added
        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1500"));
        expect(await WMATICToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("0"));
        expect(await DAEMToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("936.351131674377891709"));
    });

    it("zaps the LP - PRC", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmt = AmountType.Percentage;
        message.amount = BigNumber.from(5000); // 50%
        message = await initialize(message);

        await executor.execute(message, sigR, sigS, sigV);

        // 50% of the LP should be gone and tokens should have been added
        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(
            ethers.utils.parseEther("1000")
        );
        expect(await WMATICToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000"));
        expect(await DAEMToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000"));
    });

    it("zaps the LP - PRC + single token A", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmt = AmountType.Percentage;
        message.amount = BigNumber.from(5000); // 50%
        message.outputChoice = ZapOutputChoice.tokenA;
        message = await initialize(message);

        await executor.execute(message, sigR, sigS, sigV);

        // 50% of the LP should be gone and tokens should have been added
        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(
            ethers.utils.parseEther("1000")
        );
        expect(await WMATICToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1748.311233425068801601"));
        expect(await DAEMToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("0"));
    });

    it("zaps the LP - PRC + single token B", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmt = AmountType.Percentage;
        message.amount = BigNumber.from(5000); // 50%
        message.outputChoice = ZapOutputChoice.tokenB;
        message = await initialize(message);

        await executor.execute(message, sigR, sigS, sigV);

        // 50% of the LP should be gone and tokens should have been added
        expect(await MATICDAEMLP.balanceOf(owner.address)).to.equal(
            ethers.utils.parseEther("1000")
        );
        expect(await WMATICToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("0"));
        expect(await DAEMToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1748.311233425068801601"));
    });

    it("zapping triggers reward in gas tank", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message = await initialize(message);

        // gasTank should NOT have a claimable amount now for user1
        expect((await gasTank.claimable(otherWallet.address)).toNumber()).to.equal(0);

        await executor.connect(otherWallet).execute(message, sigR, sigS, sigV);

        // gasTank should have a claimable amount now for user1
        expect((await gasTank.claimable(otherWallet.address)).toNumber()).to.not.equal(0);
    });

    it("zapping is cheap - ABS", async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000325998869575760 ETH.
        const message = await initialize(baseMessage);

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.00035");
        console.log("Spent for transfer:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it("zapping is cheap - ABS + single token", async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000382134723942795 ETH.
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.outputChoice = ZapOutputChoice.tokenB;
        message = await initialize(message);

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.00040");
        console.log("Spent for transfer:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it("zapping is cheap - PRC", async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000337329545297267 ETH.

        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmt = AmountType.Percentage;
        message.amount = BigNumber.from(5000);
        message = await initialize(message);

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.00035");
        console.log("Spent for transfer:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it("zapping is cheap - PRC + single token", async () => {
        // At the time this test was last checked, the gas spent to
        // execute the script was 0.000393464364615821 ETH.

        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.typeAmt = AmountType.Percentage;
        message.amount = BigNumber.from(5000);
        message.outputChoice = ZapOutputChoice.tokenA;
        message = await initialize(message);

        const initialBalance = await owner.getBalance();
        await executor.execute(message, sigR, sigS, sigV);
        const spentAmount = initialBalance.sub(await owner.getBalance());

        const threshold = ethers.utils.parseEther("0.0004");
        console.log("Spent for transfer:", spentAmount.toString());
        expect(spentAmount.lte(threshold)).to.equal(true);
    });

    it("sets the lastExecution value during execution", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));

        // enable frequency condition so 2 consecutive executions should fail
        message.frequency.enabled = true;
        message = await initialize(message);

        // the first one goes through
        await executor.execute(message, sigR, sigS, sigV);

        // the second one fails as not enough blocks have passed
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[FREQUENCY_CONDITION][TMP]"
        );
    });

    /* ========== ACTION INTRINSIC CHECK ========== */

    it("fails if the user doesn't have enough balance, even tho the balance condition was not set", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.amount = ethers.utils.parseEther("9999"); // setting an amount higher than the user's balance
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[SCRIPT_BALANCE][TMP]"
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
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
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
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
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
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.balance.enabled = true;
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[BALANCE_CONDITION_LOW][TMP]"
        );
    });

    it("fails the verification if balance is enabled and the user owns too many tokens", async () => {
        // update frequency in message and submit for signature
        // we'll change the comparison so it will become "FOO_TOKEN<150"
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
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

    it("fails the verification if price is enabled with GREATER_THAN condition and tokenPrice < value", async () => {
        // update price in message and submit for signature.
        // Condition: FOO > 1.01
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("1.01");
        message = await initialize(message);

        // verification should fail as the price lower than expected
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[PRICE_CONDITION_LOW][TMP]"
        );
    });

    it("fails the verification if price is enabled with LESS_THAN condition and tokenPrice > value", async () => {
        // update price in message and submit for signature.
        // Condition: FOO < 0.99
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.comparison = ComparisonType.LessThan;
        message.price.value = ethers.utils.parseEther("0.99");
        message = await initialize(message);

        // verification should fail as the price lower than expected
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[PRICE_CONDITION_HIGH][TMP]"
        );
    });

    it("passes the price verification if conditions are met", async () => {
        // update price in message and submit for signature.
        // Condition: FOO > 0.99
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.price.enabled = true;
        message.price.comparison = ComparisonType.GreaterThan;
        message.price.value = ethers.utils.parseEther("0.99");
        message = await initialize(message);

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
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.tip = ethers.utils.parseEther("15000");
        message = await initialize(message);

        // empty the gas tank and try to verify the message
        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith("[TIP][TMP]");
    });

    it("Pays the tip to the executor", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.tip = ethers.utils.parseEther("5");
        message = await initialize(message);

        DAEMToken.mint(owner.address, ethers.utils.parseEther("10"));

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

    it("fails if the user did not grant enough allowance to the executor contract", async () => {
        const message = await initialize(baseMessage);

        // revoke the allowance for the token to the executor contract
        await MATICDAEMLP.approve(executor.address, ethers.utils.parseEther("0"));

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[ALLOWANCE][ACTION]"
        );
    });

    /* ========== REPETITIONS CONDITION CHECK ========== */

    it("fails if the script has been executed more than the allowed repetitions", async () => {
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        message.repetitions.enabled = true;
        message.repetitions.amount = BigNumber.from(2);
        message.typeAmt = AmountType.Percentage;
        message.amount = BigNumber.from(1000);
        message = await initialize(message);

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
        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
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

        let message: IZapOutAction = JSON.parse(JSON.stringify(baseMessage));
        // setting the follow condition to use another executor, so to test the external calls.
        message.follow.enabled = true;
        message.follow.executor = otherExecutor.address;
        message = await initialize(message);

        await expect(executor.verify(message, sigR, sigS, sigV)).to.be.revertedWith(
            "[FOLLOW_CONDITION][TMP]"
        );
    });
});